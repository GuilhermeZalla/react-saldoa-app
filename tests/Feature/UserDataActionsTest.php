<?php

use App\Actions\DeleteUserAccount;
use App\Actions\ExportUserData;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Support\DecimalAmount;

test('account deletion removes active and trashed transactions before related data', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);
    $activeTransaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '15.25',
        'type' => 'expense',
    ]);
    $deletedTransaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '10.00',
        'type' => 'expense',
    ]);
    $deletedTransaction->delete();
    $otherTransaction = Transaction::factory()->for($otherUser)->for($otherCategory)->create([
        'type' => 'expense',
    ]);
    $recurringTransaction = RecurringTransaction::factory()->for($user)->for($category)->create([
        'type' => 'expense',
    ]);
    $budget = Budget::factory()->for($user)->for($category)->create();

    app(DeleteUserAccount::class)->execute($user);

    expect(User::query()->find($user->id))->toBeNull()
        ->and(Transaction::withTrashed()->find($activeTransaction->id))->toBeNull()
        ->and(Transaction::withTrashed()->find($deletedTransaction->id))->toBeNull()
        ->and(RecurringTransaction::query()->find($recurringTransaction->id))->toBeNull()
        ->and(Budget::query()->find($budget->id))->toBeNull()
        ->and(Category::query()->find($category->id))->toBeNull()
        ->and($otherTransaction->fresh())->not->toBeNull()
        ->and($otherCategory->fresh())->not->toBeNull()
        ->and($otherUser->fresh())->not->toBeNull();
});

test('user data export is serializable and omits password hashes', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '123.45',
        'type' => 'expense',
    ]);
    $transaction->delete();
    $budget = Budget::factory()->for($user)->for($category)->create(['amount' => '500.25']);
    $recurringTransaction = RecurringTransaction::factory()->for($user)->for($category)->create([
        'amount' => '50.10',
        'type' => 'expense',
    ]);

    $export = app(ExportUserData::class)->execute($user);

    expect($export['profile'])
        ->toHaveKey('email', $user->email)
        ->not->toHaveKey('password')
        ->and($export['categories'])->toHaveCount(1)
        ->and($export['transactions'])->toHaveCount(1)
        ->and($export['transactions'][0]['amount'])->toBe('123.45')
        ->and($export['transactions'][0]['deleted_at'])->not->toBeNull()
        ->and($export['budgets'][0]['id'])->toBe($budget->id)
        ->and($export['budgets'][0]['amount'])->toBe('500.25')
        ->and($export['recurring_transactions'][0]['id'])->toBe($recurringTransaction->id)
        ->and($export['recurring_transactions'][0]['amount'])->toBe('50.10')
        ->and(json_encode($export))->toBeString();
});

test('decimal amounts are formatted to cents without float arithmetic', function () {
    expect(DecimalAmount::format('123456789.10'))->toBe('123456789.10')
        ->and(DecimalAmount::format('0.1'))->toBe('0.10')
        ->and(DecimalAmount::format('-3.456'))->toBe('-3.46')
        ->and(DecimalAmount::minorUnits('-10.25'))->toBe(-1025);
});
