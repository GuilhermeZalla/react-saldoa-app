<?php

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetSummaryService;

test('a user can create a budget for an expense category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'amount' => '1500.00',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $budget = Budget::query()->where('user_id', $user->id)->firstOrFail();

    expect($budget->amount)->toBe('1500.00')
        ->and($budget->category_id)->toBe($category->id)
        ->and($budget->user_id)->toBe($user->id);
});

test('a budget requires an amount greater than zero', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'amount' => '0',
        ])
        ->assertSessionHasErrors(['amount']);

    $this->post(route('budgets.store'), [
        'category_id' => $category->id,
        'amount' => '-10.00',
    ])->assertSessionHasErrors(['amount']);

    expect(Budget::query()->count())->toBe(0);
});

test('a budget cannot be created for an income category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->income()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'amount' => '500.00',
        ])
        ->assertSessionHasErrors(['category_id']);

    expect(Budget::query()->count())->toBe(0);
});

test('a budget cannot be created for a category belonging to another user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherCategory = Category::factory()->for($otherUser)->expense()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $otherCategory->id,
            'amount' => '500.00',
        ])
        ->assertSessionHasErrors(['category_id']);

    expect(Budget::query()->count())->toBe(0);
});

test('a budget cannot be created for a nonexistent category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => 999999,
            'amount' => '500.00',
        ])
        ->assertSessionHasErrors(['category_id']);

    expect(Budget::query()->count())->toBe(0);
});

test('a user cannot create duplicate budgets for the same category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();

    Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'amount' => '2000.00',
        ])
        ->assertSessionHasErrors(['category_id']);

    expect(Budget::query()->count())->toBe(1);
});

test('a user can update a budget amount', function () {
    $user = User::factory()->create();
    $budget = Budget::factory()->for($user)->create(['amount' => '1000.00']);

    $this->actingAs($user)
        ->put(route('budgets.update', $budget), [
            'amount' => '2500.00',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($budget->refresh()->amount)->toBe('2500.00');
});

test('updating a budget ignores category_id changes', function () {
    $user = User::factory()->create();
    $originalCategory = Category::factory()->for($user)->expense()->create();
    $otherCategory = Category::factory()->for($user)->expense()->create();
    $budget = Budget::factory()->for($user)->for($originalCategory)->create(['amount' => '1000.00']);

    $this->actingAs($user)
        ->put(route('budgets.update', $budget), [
            'category_id' => $otherCategory->id,
            'amount' => '2000.00',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $budget->refresh();

    expect($budget->category_id)->toBe($originalCategory->id)
        ->and($budget->amount)->toBe('2000.00');
});

test('a user can delete a budget', function () {
    $user = User::factory()->create();
    $budget = Budget::factory()->for($user)->create();

    $this->actingAs($user)
        ->delete(route('budgets.destroy', $budget))
        ->assertRedirect();

    expect(Budget::query()->find($budget->id))->toBeNull();
});

test('another user receives 403 when trying to update a budget', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $budget = Budget::factory()->for($owner)->create(['amount' => '1000.00']);

    $this->actingAs($otherUser)
        ->put(route('budgets.update', $budget), [
            'amount' => '5000.00',
        ])
        ->assertForbidden();

    expect($budget->refresh()->amount)->toBe('1000.00');
});

test('another user receives 403 when trying to delete a budget', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $budget = Budget::factory()->for($owner)->create();

    $this->actingAs($otherUser)
        ->delete(route('budgets.destroy', $budget))
        ->assertForbidden();

    expect(Budget::query()->find($budget->id))->not->toBeNull();
});

test('budget summary calculates spent amount from active transactions only', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    $budget = Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '200.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '300.00',
        'type' => 'expense',
        'date' => '2025-06-20',
    ]);

    $deletedTransaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '150.00',
        'type' => 'expense',
        'date' => '2025-06-25',
    ]);
    $deletedTransaction->delete();

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    expect($summary)->toHaveCount(1);

    $item = $summary->first();

    expect($item['amount'])->toBe('1000.00')
        ->and($item['spent'])->toBe('500.00')
        ->and($item['percentage'])->toBe(50.0);
});

test('budget summary returns zero spent when there are no transactions in the month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '800.00']);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    expect($summary)->toHaveCount(1);

    $item = $summary->first();

    expect($item['spent'])->toBe('0.00')
        ->and($item['percentage'])->toBe(0.0);
});

test('budget summary percentage can exceed 100 percent', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '250.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['percentage'])->toBe(250.0)
        ->and($item['spent'])->toBe('250.00');
});

test('budget summary includes transactions on the first and last day of the month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-06-01',
    ]);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '200.00',
        'type' => 'expense',
        'date' => '2025-06-30',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['spent'])->toBe('300.00');
});

test('budget summary excludes transactions from other months', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '500.00',
        'type' => 'expense',
        'date' => '2025-05-31',
    ]);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '500.00',
        'type' => 'expense',
        'date' => '2025-07-01',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['spent'])->toBe('100.00');
});

test('budget summary excludes transactions from other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    $otherCategory = Category::factory()->for($otherUser)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    Transaction::factory()->for($otherUser)->for($otherCategory)->create([
        'amount' => '999.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['spent'])->toBe('100.00');
});

test('deleting a category also removes its budget via cascade', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    $budget = Budget::factory()->for($user)->for($category)->create();

    expect(Budget::query()->find($budget->id))->not->toBeNull();

    $category->delete();

    expect(Budget::query()->find($budget->id))->toBeNull();
});

test('guests cannot access budget routes', function () {
    $this->post(route('budgets.store'), [])
        ->assertRedirect(route('login'));

    $budget = Budget::factory()->create();

    $this->put(route('budgets.update', $budget), [])
        ->assertRedirect(route('login'));

    $this->delete(route('budgets.destroy', $budget))
        ->assertRedirect(route('login'));
});

test('budget summary ignores soft-deleted transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $deletedTransaction = Transaction::factory()->for($user)->for($category)->create([
        'amount' => '500.00',
        'type' => 'expense',
        'date' => '2025-06-20',
    ]);
    $deletedTransaction->delete();

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['spent'])->toBe('100.00');
    expect($item['status'])->toBe(BudgetStatus::Ok);
});

test('budget status is ok below 80%', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '79.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['percentage'])->toBe(79.0);
    expect($item['status'])->toBe(BudgetStatus::Ok);
});

test('budget status is warning from 80% up to below 100%', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '80.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['percentage'])->toBe(80.0);
    expect($item['status'])->toBe(BudgetStatus::Warning);
});

test('budget status is exceeded at 100% and above', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['percentage'])->toBe(100.0);
    expect($item['status'])->toBe(BudgetStatus::Exceeded);
});

test('budget status is exceeded when spending is above 100%', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    Transaction::factory()->for($user)->for($category)->create([
        'amount' => '150.00',
        'type' => 'expense',
        'date' => '2025-06-15',
    ]);

    $service = new BudgetSummaryService;
    $summary = $service->getSummary($user, 2025, 6);

    $item = $summary->first();

    expect($item['percentage'])->toBe(150.0);
    expect($item['status'])->toBe(BudgetStatus::Exceeded);
});

test('a user cannot update a budget belonging to another user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    $budget = Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    $response = $this->actingAs($otherUser)
        ->put(route('budgets.update', $budget), ['amount' => '9999.00']);

    $response->assertStatus(403);

    expect($budget->fresh()->amount)->toBe('100.00');
});

test('a user cannot delete a budget belonging to another user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    $budget = Budget::factory()->for($user)->for($category)->create(['amount' => '100.00']);

    $response = $this->actingAs($otherUser)
        ->delete(route('budgets.destroy', $budget));

    $response->assertStatus(403);

    expect(Budget::query()->find($budget->id))->not->toBeNull();
});
