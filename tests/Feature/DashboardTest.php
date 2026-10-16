<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\FinancialDataSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('filters.month', now()->format('Y-m'))
            ->has('summary')
            ->has('monthlyTrend', 6));
});

test('dashboard shows an empty state and navigation for a month without transactions', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('monthNavigation.current', '2025-05')
            ->where('monthNavigation.previous', '2025-04')
            ->where('monthNavigation.next', '2025-06')
            ->where('summary.overallBalance', '0.00')
            ->where('summary.monthlyIncome', '0.00')
            ->where('summary.monthlyExpense', '0.00')
            ->where('summary.monthlyBalance', '0.00')
            ->has('expensesByCategory', 0)
            ->has('monthlyTrend', 6)
            ->has('recentTransactions', 0)
            ->where('hasTransactionsInMonth', false)
            ->where('hasTransactionsInChartRange', false));
});

test('sensitive authentication fields are not shared through Inertia props', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->missing('auth.user.password')
            ->missing('auth.user.remember_token')
            ->missing('auth.user.two_factor_secret')
            ->missing('auth.user.two_factor_recovery_codes'));
});

test('dashboard totals use all time for the general balance and the selected month for period values', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherIncomeCategory = Category::factory()->for($otherUser)->create(['type' => 'income']);
    $otherExpenseCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'description' => 'Salário de maio',
        'amount' => '1000.00',
        'type' => 'income',
        'date' => '2025-05-05',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Compras de maio',
        'amount' => '100.00',
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'description' => 'Salário de abril',
        'amount' => '200.00',
        'type' => 'income',
        'date' => '2025-04-05',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Compras de abril',
        'amount' => '50.00',
        'type' => 'expense',
        'date' => '2025-04-10',
    ]);
    Transaction::factory()->for($otherUser)->for($otherIncomeCategory)->create([
        'description' => 'Receita privada',
        'amount' => '9000.00',
        'type' => 'income',
        'date' => '2025-05-05',
    ]);
    Transaction::factory()->for($otherUser)->for($otherExpenseCategory)->create([
        'description' => 'Despesa privada',
        'amount' => '6000.00',
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('monthNavigation.label', 'maio de 2025')
            ->where('summary.overallBalance', '1050.00')
            ->where('summary.monthlyIncome', '1000.00')
            ->where('summary.monthlyExpense', '100.00')
            ->where('summary.monthlyBalance', '900.00')
            ->where('monthlyTrend.5.income', 1000)
            ->where('monthlyTrend.5.expense', 100)
            ->where('hasTransactionsInMonth', true)
            ->where('hasTransactionsInChartRange', true)
            ->has('recentTransactions', 4)
            ->has('expensesByCategory', 1)
            ->where('expensesByCategory.0.total', '100.00'));
});

test('dashboard groups the selected months expenses by category', function () {
    $user = User::factory()->create();
    $foodCategory = Category::factory()->for($user)->create([
        'name' => 'Alimentação',
        'type' => 'expense',
    ]);
    $housingCategory = Category::factory()->for($user)->create([
        'name' => 'Moradia',
        'type' => 'expense',
    ]);
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);

    foreach (['25.00', '35.50'] as $amount) {
        Transaction::factory()->for($user)->for($foodCategory)->create([
            'amount' => $amount,
            'type' => 'expense',
            'date' => '2025-05-10',
        ]);
    }

    Transaction::factory()->for($user)->for($housingCategory)->create([
        'amount' => '800.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);
    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '2000.00',
        'type' => 'income',
        'date' => '2025-05-12',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('expensesByCategory', 2)
            ->where('expensesByCategory.0.name', 'Moradia')
            ->where('expensesByCategory.0.total', '800.00')
            ->where('expensesByCategory.1.name', 'Alimentação')
            ->where('expensesByCategory.1.total', '60.50'));
});

test('dashboard returns the six monthly totals ending with the selected month', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    $months = [
        ['month' => '2024-12', 'amount' => '10.00', 'type' => 'expense', 'category' => $expenseCategory],
        ['month' => '2025-01', 'amount' => '100.00', 'type' => 'income', 'category' => $incomeCategory],
        ['month' => '2025-02', 'amount' => '200.00', 'type' => 'income', 'category' => $incomeCategory],
        ['month' => '2025-03', 'amount' => '30.00', 'type' => 'expense', 'category' => $expenseCategory],
        ['month' => '2025-04', 'amount' => '300.00', 'type' => 'income', 'category' => $incomeCategory],
        ['month' => '2025-05', 'amount' => '50.00', 'type' => 'expense', 'category' => $expenseCategory],
    ];

    foreach ($months as $sample) {
        Transaction::factory()->for($user)->for($sample['category'])->create([
            'amount' => $sample['amount'],
            'type' => $sample['type'],
            'date' => $sample['month'].'-10',
        ]);
    }

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '999.00',
        'type' => 'income',
        'date' => '2025-06-10',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('monthlyTrend', 6)
            ->where('monthlyTrend.0.month', '2024-12')
            ->where('monthlyTrend.0.expense', 10)
            ->where('monthlyTrend.5.month', '2025-05')
            ->where('monthlyTrend.5.expense', 50));
});

test('dashboard shows demo data when browsing a seeded previous month', function () {
    $this->seed(FinancialDataSeeder::class);
    $user = User::query()->where('email', 'test@example.com')->firstOrFail();
    $previousMonth = now()->subMonth()->format('Y-m');

    expect($user->email_verified_at)->not->toBeNull();

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => $previousMonth]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyIncome', '4500.00')
            ->where('summary.monthlyExpense', '320.50')
            ->where('hasTransactionsInMonth', true)
            ->where('hasTransactionsInChartRange', true));
});
