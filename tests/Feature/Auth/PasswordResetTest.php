<?php

use App\Mail\PasswordResetLink;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('reset password link screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertOk();
});

test('reset password link can be requested', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Mail::assertQueued(PasswordResetLink::class);
});

test('reset password screen can be rendered', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Mail::assertQueued(PasswordResetLink::class, function ($mailable) {
        $response = $this->get(route('password.reset', $mailable->token));

        $response->assertOk();

        return true;
    });
});

test('password can be reset with valid token', function () {
    Mail::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Mail::assertQueued(PasswordResetLink::class, function ($mailable) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $mailable->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('password cannot be reset with invalid token', function () {
    $user = User::factory()->create();

    $response = $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('password reset link requests are rate limited by email and ip', function () {
    $email = 'limited-reset-link@example.com';

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('password.email'), ['email' => $email])
            ->assertRedirect();
    }

    $this->post(route('password.email'), ['email' => $email])
        ->assertStatus(429);
});

test('password reset submissions are rate limited by email and ip', function () {
    $user = User::factory()->create();

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('password.update'), [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertRedirect();
    }

    $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ])->assertStatus(429);
});
