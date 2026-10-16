<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can view their budgets for the current month', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $category1 = Category::factory()->for($user)->create(['type' => 'expense']);
    $category2 = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    Budget::factory()->for($user)->for($category1, 'category')->create(['amount' => '1000.00']);
    Budget::factory()->for($user)->for($category2, 'category')->create(['amount' => '500.00']);
    Budget::factory()->for($otherUser)->for($otherCategory, 'category')->create(['amount' => '300.00']);

    $this->actingAs($user)
        ->get(route('budgets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('budgets/index')
            ->has('budgets', 2)
            ->where('budgets.0.category_id', $category1->id)
            ->where('budgets.1.category_id', $category2->id));
});

test('budget index shows only expense categories without budget', function () {
    $user = User::factory()->create();

    $expenseCategory1 = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Alimentação']);
    $expenseCategory2 = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Transporte']);
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income', 'name' => 'Salário']);

    Budget::factory()->for($user)->for($expenseCategory1, 'category')->create();

    $this->actingAs($user)
        ->get(route('budgets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('budgets/index')
            ->has('budgets', 1)
            ->has('categoriesWithoutBudget', 1)
            ->where('categoriesWithoutBudget.0.id', $expenseCategory2->id)
            ->where('categoriesWithoutBudget.0.name', 'Transporte'));
});

test('budget index calculates spent amount and status correctly', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $budget = Budget::factory()->for($user)->for($category, 'category')->create(['amount' => '1000.00']);

    // Criar transações do mês atual
    Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '300.00',
        'date' => now()->startOfMonth(),
    ]);

    Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '200.00',
        'date' => now()->startOfMonth()->addDays(5),
    ]);

    // Criar transação de outro mês (não deve contar)
    Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '500.00',
        'date' => now()->subMonth(),
    ]);

    $this->actingAs($user)
        ->get(route('budgets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('budgets/index')
            ->has('budgets', 1)
            ->where('budgets.0.spent', '500.00')
            ->where('budgets.0.percentage', 50)
            ->where('budgets.0.status', 'ok'));
});

test('budget index ignores soft deleted transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    Budget::factory()->for($user)->for($category, 'category')->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '300.00',
        'date' => now(),
    ]);

    $deletedTransaction = Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '500.00',
        'date' => now(),
    ]);
    $deletedTransaction->delete(); // soft delete

    $this->actingAs($user)
        ->get(route('budgets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('budgets.0.spent', '300.00')
            ->where('budgets.0.percentage', 30)
            ->where('budgets.0.status', 'ok'));
});
