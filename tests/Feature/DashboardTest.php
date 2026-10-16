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
            ->where('summary.monthlyComparison.income.previousValue', '0.00')
            ->where('summary.monthlyComparison.income.state', 'none')
            ->where('summary.monthlyComparison.expense.state', 'none')
            ->where('summary.monthlyComparison.balance.state', 'none')
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
            ->where('expensesByCategory.0.id', $housingCategory->id)
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

test('dashboard calculates favorable percentage changes from aggregate monthly totals', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    foreach ([
        ['date' => '2025-04-10', 'amount' => '100.00', 'type' => 'income', 'category' => $incomeCategory],
        ['date' => '2025-04-11', 'amount' => '80.00', 'type' => 'expense', 'category' => $expenseCategory],
        ['date' => '2025-05-10', 'amount' => '112.50', 'type' => 'income', 'category' => $incomeCategory],
        ['date' => '2025-05-11', 'amount' => '60.00', 'type' => 'expense', 'category' => $expenseCategory],
    ] as $transaction) {
        Transaction::factory()->for($user)->for($transaction['category'])->create([
            'amount' => $transaction['amount'],
            'type' => $transaction['type'],
            'date' => $transaction['date'],
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyComparison.income.previousValue', '100.00')
            ->where('summary.monthlyComparison.income.percentageChange', 12.5)
            ->where('summary.monthlyComparison.income.sentiment', 'positive')
            ->where('summary.monthlyComparison.expense.previousValue', '80.00')
            ->where('summary.monthlyComparison.expense.percentageChange', -25)
            ->where('summary.monthlyComparison.expense.sentiment', 'positive')
            ->where('summary.monthlyComparison.balance.previousValue', '20.00')
            ->where('summary.monthlyComparison.balance.percentageChange', 162.5)
            ->where('summary.monthlyComparison.balance.sentiment', 'positive'));
});

test('dashboard marks unfavorable percentage changes and negative balances correctly', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    foreach ([
        ['date' => '2025-05-10', 'amount' => '100.00', 'type' => 'income', 'category' => $incomeCategory],
        ['date' => '2025-05-11', 'amount' => '80.00', 'type' => 'expense', 'category' => $expenseCategory],
        ['date' => '2025-06-10', 'amount' => '75.00', 'type' => 'income', 'category' => $incomeCategory],
        ['date' => '2025-06-11', 'amount' => '100.00', 'type' => 'expense', 'category' => $expenseCategory],
    ] as $transaction) {
        Transaction::factory()->for($user)->for($transaction['category'])->create([
            'amount' => $transaction['amount'],
            'type' => $transaction['type'],
            'date' => $transaction['date'],
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-06']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyComparison.income.percentageChange', -25)
            ->where('summary.monthlyComparison.income.sentiment', 'negative')
            ->where('summary.monthlyComparison.expense.percentageChange', 25)
            ->where('summary.monthlyComparison.expense.sentiment', 'negative')
            ->where('summary.monthlyComparison.balance.previousValue', '20.00')
            ->where('summary.monthlyComparison.balance.percentageChange', -225)
            ->where('summary.monthlyComparison.balance.sentiment', 'negative'));
});

test('dashboard labels nonzero values as new when the previous month is zero', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '100.00',
        'type' => 'income',
        'date' => '2025-08-10',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'amount' => '40.00',
        'type' => 'expense',
        'date' => '2025-08-11',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-08']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyComparison.income.previousValue', '0.00')
            ->where('summary.monthlyComparison.income.state', 'new')
            ->where('summary.monthlyComparison.income.sentiment', 'positive')
            ->where('summary.monthlyComparison.expense.previousValue', '0.00')
            ->where('summary.monthlyComparison.expense.state', 'new')
            ->where('summary.monthlyComparison.expense.sentiment', 'negative')
            ->where('summary.monthlyComparison.balance.previousValue', '0.00')
            ->where('summary.monthlyComparison.balance.state', 'new')
            ->where('summary.monthlyComparison.balance.sentiment', 'positive'));
});

test('dashboard marks equal nonzero monthly totals as an unchanged variation', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    foreach (['2025-09-10', '2025-10-10'] as $date) {
        Transaction::factory()->for($user)->for($incomeCategory)->create([
            'amount' => '100.00',
            'type' => 'income',
            'date' => $date,
        ]);
        Transaction::factory()->for($user)->for($expenseCategory)->create([
            'amount' => '50.00',
            'type' => 'expense',
            'date' => $date,
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-10']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyComparison.income.percentageChange', 0)
            ->where('summary.monthlyComparison.income.state', 'unchanged')
            ->where('summary.monthlyComparison.expense.state', 'unchanged')
            ->where('summary.monthlyComparison.balance.state', 'unchanged'));
});

test('dashboard compares January with December of the previous year for the current user only', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherIncomeCategory = Category::factory()->for($otherUser)->create(['type' => 'income']);
    $otherExpenseCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    foreach ([
        [$user, $incomeCategory, '100.00', 'income', '2024-12-10'],
        [$user, $expenseCategory, '200.00', 'expense', '2024-12-11'],
        [$user, $incomeCategory, '150.00', 'income', '2025-01-10'],
        [$user, $expenseCategory, '150.00', 'expense', '2025-01-11'],
        [$user, $incomeCategory, '900.00', 'income', '2024-11-10'],
        [$user, $expenseCategory, '900.00', 'expense', '2025-12-10'],
        [$otherUser, $otherIncomeCategory, '10000.00', 'income', '2024-12-10'],
        [$otherUser, $otherExpenseCategory, '10.00', 'expense', '2024-12-11'],
        [$otherUser, $otherIncomeCategory, '8000.00', 'income', '2025-01-10'],
        [$otherUser, $otherExpenseCategory, '10.00', 'expense', '2025-01-11'],
    ] as [$transactionUser, $category, $amount, $type, $date]) {
        Transaction::factory()->for($transactionUser)->for($category)->create([
            'amount' => $amount,
            'type' => $type,
            'date' => $date,
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-01']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyIncome', '150.00')
            ->where('summary.monthlyExpense', '150.00')
            ->where('summary.monthlyComparison.income.previousValue', '100.00')
            ->where('summary.monthlyComparison.income.percentageChange', 50)
            ->where('summary.monthlyComparison.expense.previousValue', '200.00')
            ->where('summary.monthlyComparison.expense.percentageChange', -25)
            ->where('summary.monthlyComparison.balance.previousValue', '-100.00')
            ->where('summary.monthlyComparison.balance.percentageChange', 100)
            ->where('summary.monthlyComparison.balance.sentiment', 'positive'));
});

test('dashboard measures a worsening negative balance against its absolute previous value', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '100.00',
        'type' => 'income',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'amount' => '200.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);
    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '100.00',
        'type' => 'income',
        'date' => '2025-06-10',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'amount' => '300.00',
        'type' => 'expense',
        'date' => '2025-06-11',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-06']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.monthlyComparison.balance.previousValue', '-100.00')
            ->where('summary.monthlyComparison.balance.percentageChange', -100)
            ->where('summary.monthlyComparison.balance.sentiment', 'negative'));
});

test('dashboard aggregates exclude soft-deleted transactions from every widget', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    $activeTransactions = [
        ['description' => 'January income', 'amount' => '10.00', 'type' => 'income', 'date' => '2025-01-10', 'category' => $incomeCategory],
        ['description' => 'March expense', 'amount' => '5.00', 'type' => 'expense', 'date' => '2025-03-10', 'category' => $expenseCategory],
        ['description' => 'May income', 'amount' => '50.00', 'type' => 'income', 'date' => '2025-05-10', 'category' => $incomeCategory],
        ['description' => 'May expense', 'amount' => '20.00', 'type' => 'expense', 'date' => '2025-05-11', 'category' => $expenseCategory],
        ['description' => 'June income', 'amount' => '100.00', 'type' => 'income', 'date' => '2025-06-10', 'category' => $incomeCategory],
        ['description' => 'June expense', 'amount' => '25.00', 'type' => 'expense', 'date' => '2025-06-11', 'category' => $expenseCategory],
    ];

    foreach ($activeTransactions as $attributes) {
        $category = $attributes['category'];
        unset($attributes['category']);

        Transaction::factory()->for($user)->for($category)->create($attributes);
    }

    $deletedTransactions = [
        ['description' => 'Deleted February income', 'amount' => '700.00', 'type' => 'income', 'date' => '2025-02-10', 'category' => $incomeCategory],
        ['description' => 'Deleted May income', 'amount' => '500.00', 'type' => 'income', 'date' => '2025-05-12', 'category' => $incomeCategory],
        ['description' => 'Deleted May expense', 'amount' => '400.00', 'type' => 'expense', 'date' => '2025-05-13', 'category' => $expenseCategory],
        ['description' => 'Deleted June income', 'amount' => '900.00', 'type' => 'income', 'date' => '2025-06-29', 'category' => $incomeCategory],
        ['description' => 'Deleted June expense', 'amount' => '600.00', 'type' => 'expense', 'date' => '2025-06-30', 'category' => $expenseCategory],
    ];

    foreach ($deletedTransactions as $attributes) {
        $category = $attributes['category'];
        unset($attributes['category']);

        Transaction::factory()->for($user)->for($category)->create($attributes)->delete();
    }

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2025-06']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.overallBalance', '110.00')
            ->where('summary.monthlyIncome', '100.00')
            ->where('summary.monthlyExpense', '25.00')
            ->where('summary.monthlyBalance', '75.00')
            ->where('summary.monthlyComparison.income.previousValue', '50.00')
            ->where('summary.monthlyComparison.income.percentageChange', 100)
            ->where('summary.monthlyComparison.expense.previousValue', '20.00')
            ->where('summary.monthlyComparison.expense.percentageChange', 25)
            ->where('summary.monthlyComparison.balance.previousValue', '30.00')
            ->where('summary.monthlyComparison.balance.percentageChange', 150)
            ->has('expensesByCategory', 1)
            ->where('expensesByCategory.0.id', $expenseCategory->id)
            ->where('expensesByCategory.0.total', '25.00')
            ->has('monthlyTrend', 6)
            ->where('monthlyTrend.0.month', '2025-01')
            ->where('monthlyTrend.0.income', 10)
            ->where('monthlyTrend.1.month', '2025-02')
            ->where('monthlyTrend.1.income', 0)
            ->where('monthlyTrend.4.income', 50)
            ->where('monthlyTrend.4.expense', 20)
            ->where('monthlyTrend.5.income', 100)
            ->where('monthlyTrend.5.expense', 25)
            ->has('recentTransactions', 5)
            ->where('recentTransactions.0.description', 'June expense')
            ->where('recentTransactions.1.description', 'June income')
            ->where('recentTransactions.4.description', 'March expense'));
});
