<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard shows budget alerts for warning and exceeded statuses', function () {
    $user = User::factory()->create();

    $okCategory = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Transporte']);
    $warningCategory = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Alimentação']);
    $exceededCategory = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Lazer']);

    Budget::factory()->for($user)->for($okCategory, 'category')->create(['amount' => '1000.00']);
    Budget::factory()->for($user)->for($warningCategory, 'category')->create(['amount' => '1000.00']);
    Budget::factory()->for($user)->for($exceededCategory, 'category')->create(['amount' => '1000.00']);

    // ok: 50%
    Transaction::factory()->for($user)->for($okCategory, 'category')->create([
        'type' => 'expense',
        'amount' => '500.00',
        'date' => now(),
    ]);

    // warning: 85%
    Transaction::factory()->for($user)->for($warningCategory, 'category')->create([
        'type' => 'expense',
        'amount' => '850.00',
        'date' => now(),
    ]);

    // exceeded: 120%
    Transaction::factory()->for($user)->for($exceededCategory, 'category')->create([
        'type' => 'expense',
        'amount' => '1200.00',
        'date' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('budgetAlerts', 2)
            ->where('budgetAlerts.0.category_name', 'Lazer')
            ->where('budgetAlerts.0.percentage', 120)
            ->where('budgetAlerts.0.status', 'exceeded')
            ->where('budgetAlerts.1.category_name', 'Alimentação')
            ->where('budgetAlerts.1.percentage', 85)
            ->where('budgetAlerts.1.status', 'warning'));
});

test('dashboard budget alerts are ordered by percentage descending', function () {
    $user = User::factory()->create();

    $category1 = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Cat 85%']);
    $category2 = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Cat 95%']);
    $category3 = Category::factory()->for($user)->create(['type' => 'expense', 'name' => 'Cat 90%']);

    Budget::factory()->for($user)->for($category1, 'category')->create(['amount' => '1000.00']);
    Budget::factory()->for($user)->for($category2, 'category')->create(['amount' => '1000.00']);
    Budget::factory()->for($user)->for($category3, 'category')->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category1, 'category')->create([
        'type' => 'expense',
        'amount' => '850.00',
        'date' => now(),
    ]);

    Transaction::factory()->for($user)->for($category2, 'category')->create([
        'type' => 'expense',
        'amount' => '950.00',
        'date' => now(),
    ]);

    Transaction::factory()->for($user)->for($category3, 'category')->create([
        'type' => 'expense',
        'amount' => '900.00',
        'date' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('budgetAlerts.0.percentage', 95)
            ->where('budgetAlerts.1.percentage', 90)
            ->where('budgetAlerts.2.percentage', 85));
});

test('dashboard shows hasBudgets as true when user has budgets', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    Budget::factory()->for($user)->for($category, 'category')->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('hasBudgets', true));
});

test('dashboard shows hasBudgets as false when user has no budgets', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('hasBudgets', false));
});

test('dashboard shows empty budget alerts when all budgets are ok', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    Budget::factory()->for($user)->for($category, 'category')->create(['amount' => '1000.00']);

    Transaction::factory()->for($user)->for($category, 'category')->create([
        'type' => 'expense',
        'amount' => '500.00',
        'date' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('hasBudgets', true)
            ->has('budgetAlerts', 0));
});
