<?php

use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('demo data seeder creates a usable account and three months of data idempotently', function () {
    $this->seed(DatabaseSeeder::class);

    $demoUser = User::query()->where('email', 'demo@exemplo.com')->firstOrFail();

    expect($demoUser->name)->toBe('Usuário de Demonstração')
        ->and(Hash::check('demo1234', $demoUser->password))->toBeTrue()
        ->and($demoUser->categories()->count())->toBe(8)
        ->and($demoUser->transactions()->count())->toBe(30);

    $transactionMonths = $demoUser->transactions()
        ->get()
        ->map(fn (Transaction $transaction): string => $transaction->date->format('Y-m'))
        ->unique();

    expect($transactionMonths)->toHaveCount(3);

    $this->seed(DatabaseSeeder::class);

    expect($demoUser->categories()->count())->toBe(8)
        ->and($demoUser->transactions()->count())->toBe(30);
});
