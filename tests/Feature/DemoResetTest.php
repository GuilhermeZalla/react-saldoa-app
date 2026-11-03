<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('demo reset replaces all data for the configured demo account', function () {
    $demoUser = User::factory()->create(['email' => config('demo.email')]);
    $category = Category::factory()->for($demoUser)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($demoUser)->for($category)->create([
        'type' => 'expense',
    ]);

    $this->artisan('demo:reset', ['--force' => true])
        ->expectsOutput("Demo account to reset: {$demoUser->email}")
        ->expectsOutput('Transactions: 1')
        ->expectsOutput('Categories: 1')
        ->expectsOutput('Demonstration account and sample data were reset.')
        ->assertSuccessful();

    $resetDemoUser = User::query()->where('email', config('demo.email'))->firstOrFail();

    expect($resetDemoUser->id)->not->toBe($demoUser->id)
        ->and(Transaction::withTrashed()->find($transaction->id))->toBeNull()
        ->and($resetDemoUser->categories()->count())->toBe(8)
        ->and($resetDemoUser->transactions()->count())->toBe(30);
});

test('demo reset cannot run in production unless the instance is explicitly isolated', function () {
    config()->set('demo.instance', false);
    $this->app['env'] = 'production';

    $this->artisan('demo:reset')
        ->expectsOutput('Demo reset is only available locally, in testing, or on an isolated DEMO_INSTANCE.')
        ->assertFailed();
});
