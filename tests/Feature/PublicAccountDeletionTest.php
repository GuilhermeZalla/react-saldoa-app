<?php

use App\Models\AccountDeletionRequest;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\AccountDeletionRequested;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('a guest can request deletion without exposing whether the email exists', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'Delete-Me@Example.com']);

    $this->get('/account-deletion')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('account-deletion/request'));

    $this->post('/account-deletion', ['email' => 'unknown@example.com'])
        ->assertRedirect(route('account-deletion.requested'));
    $this->post('/account-deletion', ['email' => ' DELETE-ME@EXAMPLE.COM '])
        ->assertRedirect(route('account-deletion.requested'));

    expect(AccountDeletionRequest::query()->where('email', $user->email)->count())->toBe(1);
    Notification::assertSentOnDemand(AccountDeletionRequested::class);
});

test('account deletion requires a valid email link and deletes all personal data only on POST', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'Delete-Me@Example.com']);
    $category = Category::factory()->for($user)->create();
    $transaction = Transaction::factory()->for($user)->for($category)->create();

    $this->post('/account-deletion', ['email' => $user->email])
        ->assertRedirect(route('account-deletion.requested'));

    $token = null;
    Notification::assertSentOnDemand(
        AccountDeletionRequested::class,
        function (AccountDeletionRequested $notification) use (&$token): bool {
            $token = basename((string) parse_url($notification->confirmationUrl, PHP_URL_PATH));

            return true;
        },
    );

    expect($token)->toBeString()->not->toBeEmpty();

    $this->get(route('account-deletion.confirm', ['token' => $token]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account-deletion/confirm')
            ->where('token', $token));

    expect(User::query()->find($user->id))->not->toBeNull()
        ->and(Transaction::query()->find($transaction->id))->not->toBeNull();

    $this->post('/account-deletion/confirm', ['token' => $token])
        ->assertRedirect(route('account-deletion.complete'));

    expect(User::query()->find($user->id))->toBeNull()
        ->and(Transaction::withTrashed()->find($transaction->id))->toBeNull()
        ->and(AccountDeletionRequest::query()->exists())->toBeFalse();

    $this->get(route('account-deletion.confirm', ['token' => $token]))->assertNotFound();
});

test('expired deletion links cannot be confirmed', function () {
    $user = User::factory()->create(['email' => 'expired@example.com']);
    $token = 'expired-deletion-token-that-is-long-enough-for-validation';

    AccountDeletionRequest::query()->create([
        'email' => $user->email,
        'token_hash' => hash('sha256', $token),
        'expires_at' => now()->subMinute(),
    ]);

    $this->get(route('account-deletion.confirm', ['token' => $token]))->assertNotFound();
    $this->post('/account-deletion/confirm', ['token' => $token])->assertNotFound();

    expect(User::query()->find($user->id))->not->toBeNull();
});

test('public account deletion is rate limited by normalized email and IP', function () {
    Notification::fake();
    User::factory()->create(['email' => 'limited-delete@example.com']);

    foreach (range(1, 3) as $attempt) {
        $this->post('/account-deletion', ['email' => ' LIMITED-DELETE@EXAMPLE.COM '])
            ->assertRedirect(route('account-deletion.requested'));
    }

    $this->post('/account-deletion', ['email' => 'limited-delete@example.com'])
        ->assertTooManyRequests();
});
