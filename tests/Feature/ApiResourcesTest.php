<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('mobile API exposes user-scoped financial data and serializes money as decimal strings', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '12.50',
        'type' => 'expense',
        'date' => now()->toDateString(),
    ]);
    $token = $user->createToken('Android phone')->plainTextToken;
    $this->withToken($token);

    $this->getJson('/api/v1/transactions')
        ->assertOk()
        ->assertJsonPath('data.0.id', $transaction->id)
        ->assertJsonPath('data.0.amount', '12.50');

    $dashboard = $this->getJson('/api/v1/dashboard?month='.now()->format('Y-m'))->assertOk();
    expect($dashboard->json('data.summary.monthlyExpense'))->toBe('12.50')
        ->and($dashboard->json('data.recentTransactions.0.amount'))->toBe('12.50');

    $export = $this->get('/api/v1/transactions/export?month='.now()->format('Y-m'));
    $export->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $this->getJson('/api/v1/account/export')
        ->assertOk()
        ->assertJsonPath('data.transactions.0.amount', '12.50')
        ->assertJsonMissingPath('data.profile.password');
});

test('mobile API creates categories, transactions, budgets, and recurring transactions', function () {
    $user = User::factory()->create();
    $token = $user->createToken('Android phone')->plainTextToken;
    $headers = ['Authorization' => 'Bearer '.$token];

    $categoryResponse = $this->withHeaders($headers)->postJson('/api/v1/categories', [
        'name' => 'Alimentação',
        'type' => 'expense',
    ])->assertCreated();
    $categoryId = $categoryResponse->json('data.id');

    $this->postJson('/api/v1/transactions', [
        'description' => 'Mercado',
        'amount' => '45.90',
        'type' => 'expense',
        'category_id' => $categoryId,
        'date' => now()->toDateString(),
    ])->assertCreated()
        ->assertJsonPath('data.amount', '45.90');

    $this->postJson('/api/v1/budgets', [
        'category_id' => $categoryId,
        'amount' => '300.00',
    ])->assertCreated()
        ->assertJsonPath('data.amount', '300.00');

    $this->postJson('/api/v1/recurring-transactions', [
        'description' => 'Compra mensal',
        'amount' => '75.25',
        'type' => 'expense',
        'category_id' => $categoryId,
        'frequency' => 'monthly',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => null,
    ])->assertCreated()
        ->assertJsonPath('data.amount', '75.25');

    $this->getJson('/api/v1/categories')
        ->assertOk()
        ->assertJsonPath('data.0.id', $categoryId);
    $this->getJson('/api/v1/budgets')
        ->assertOk()
        ->assertJsonPath('data.0.amount', '300.00');
    $this->getJson('/api/v1/recurring-transactions')
        ->assertOk()
        ->assertJsonPath('data.0.amount', '75.25');
});

test('mobile API denies access to another users resources and formats validation errors', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($owner)->create();
    $token = $otherUser->createToken('Android phone')->plainTextToken;

    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');

    $this->withToken($token)
        ->getJson('/api/v1/categories/'.$category->id)
        ->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');

    $this->postJson('/api/v1/categories', [
        'name' => '',
        'type' => 'invalid',
    ])->assertUnprocessable()
        ->assertJsonPath('error.code', 'validation_error')
        ->assertJsonStructure(['error' => ['details' => ['name', 'type']]]);
});

test('mobile account deletion requires the password and removes the account data', function () {
    $user = User::factory()->create(['password' => 'current-password']);
    $category = Category::factory()->for($user)->create();
    $transaction = Transaction::factory()->for($user)->for($category)->create();
    $transaction->delete();
    $token = $user->createToken('Android phone')->plainTextToken;

    $this->withToken($token)
        ->deleteJson('/api/v1/account', ['password' => 'wrong-password'])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'validation_error');

    $this->deleteJson('/api/v1/account', ['password' => 'current-password'])
        ->assertOk();

    expect(User::query()->find($user->id))->toBeNull()
        ->and(Transaction::withTrashed()->find($transaction->id))->toBeNull();
});
