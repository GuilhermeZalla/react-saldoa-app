<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;

test('demo purge requires confirmation and leaves data unchanged when canceled', function () {
    $demoUser = User::factory()->create(['email' => config('demo.email')]);

    $this->artisan('demo:purge')
        ->expectsConfirmation("Delete the demonstration account [{$demoUser->email}] and all of its data?", 'no')
        ->expectsOutput('Demo account purge canceled.')
        ->assertSuccessful();

    expect($demoUser->fresh())->not->toBeNull();
});

test('demo purge removes only the configured demo account and all its data', function () {
    $demoUser = User::factory()->create(['email' => config('demo.email')]);
    $demoCategory = Category::factory()->for($demoUser)->create(['type' => 'expense']);
    $activeTransaction = Transaction::factory()
        ->for($demoUser)
        ->for($demoCategory)
        ->create(['type' => 'expense']);
    $deletedTransaction = Transaction::factory()
        ->for($demoUser)
        ->for($demoCategory)
        ->create(['type' => 'expense']);
    $deletedTransaction->delete();
    $budget = Budget::factory()
        ->for($demoUser)
        ->for($demoCategory)
        ->create();
    $recurringTransaction = RecurringTransaction::factory()
        ->for($demoUser)
        ->for($demoCategory)
        ->create(['type' => 'expense']);

    $otherUser = User::factory()->create();
    $otherCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);
    $otherTransaction = Transaction::factory()
        ->for($otherUser)
        ->for($otherCategory)
        ->create(['type' => 'expense']);
    $this->app['env'] = 'production';

    $this->artisan('demo:purge', ['--force' => true])
        ->expectsOutput("Demonstration account [{$demoUser->email}] and its data were deleted.")
        ->assertSuccessful();

    expect($demoUser->fresh())->toBeNull()
        ->and(Transaction::withTrashed()->whereKey([$activeTransaction->id, $deletedTransaction->id])->exists())->toBeFalse()
        ->and(RecurringTransaction::query()->whereKey($recurringTransaction->id)->exists())->toBeFalse()
        ->and(Budget::query()->whereKey($budget->id)->exists())->toBeFalse()
        ->and(Category::query()->whereKey($demoCategory->id)->exists())->toBeFalse()
        ->and($otherUser->fresh())->not->toBeNull()
        ->and($otherCategory->fresh())->not->toBeNull()
        ->and($otherTransaction->fresh())->not->toBeNull();
});
