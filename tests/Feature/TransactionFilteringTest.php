<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('transactions can be filtered by month and year', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'income']);

    Transaction::factory()->for($user)->for($category)->create([
        'description' => 'Receita de maio',
        'amount' => '100.00',
        'type' => 'income',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($category)->create([
        'description' => 'Receita de abril',
        'amount' => '200.00',
        'type' => 'income',
        'date' => '2025-04-10',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.index', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.description', 'Receita de maio')
            ->where('filters.month', '2025-05')
            ->where('summary.income', '100.00'));
});

test('transactions can be filtered by type', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'description' => 'Pagamento',
        'amount' => '150.00',
        'type' => 'income',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Aluguel',
        'amount' => '50.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.index', [
            'month' => '2025-05',
            'type' => 'income',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.description', 'Pagamento')
            ->where('filters.type', 'income')
            ->where('summary.income', '150.00')
            ->where('summary.expense', '0.00')
            ->where('summary.balance', '150.00'));
});

test('transactions can be filtered by a category owned by the user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $selectedCategory = Category::factory()->for($user)->create([
        'name' => 'Moradia',
        'type' => 'expense',
    ]);
    $otherCategory = Category::factory()->for($user)->create([
        'name' => 'Transporte',
        'type' => 'expense',
    ]);
    $privateCategory = Category::factory()->for($otherUser)->create([
        'name' => 'Categoria privada',
        'type' => 'expense',
    ]);

    Transaction::factory()->for($user)->for($selectedCategory)->create([
        'description' => 'Aluguel',
        'amount' => '900.00',
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($otherCategory)->create([
        'description' => 'Ônibus',
        'amount' => '20.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);
    Transaction::factory()->for($otherUser)->for($privateCategory)->create([
        'description' => 'Outro usuário',
        'amount' => '5000.00',
        'type' => 'expense',
        'date' => '2025-05-12',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.index', [
            'month' => '2025-05',
            'type' => 'expense',
            'category_id' => $selectedCategory->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.description', 'Aluguel')
            ->where('transactions.data.0.type', 'expense')
            ->where('filters.month', '2025-05')
            ->where('filters.type', 'expense')
            ->where('filters.category_id', (string) $selectedCategory->id)
            ->where('summary.expense', '900.00')
            ->where('summary.balance', '-900.00')
            ->has('categories', 2)
            ->where('categories.0.name', 'Moradia')
            ->where('categories.1.name', 'Transporte'));
});

test('month, type, category, and description filters can be combined', function () {
    $user = User::factory()->create();
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherExpenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);

    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Compra no mercado',
        'amount' => '42.50',
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($otherExpenseCategory)->create([
        'description' => 'Compra no mercado',
        'amount' => '15.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Conta de energia',
        'amount' => '80.00',
        'type' => 'expense',
        'date' => '2025-05-12',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'description' => 'Compra no mercado',
        'amount' => '33.00',
        'type' => 'expense',
        'date' => '2025-04-10',
    ]);
    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'description' => 'Compra no mercado',
        'amount' => '300.00',
        'type' => 'income',
        'date' => '2025-05-13',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.index', [
            'month' => '2025-05',
            'type' => 'expense',
            'category_id' => $expenseCategory->id,
            'search' => 'mercado',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.description', 'Compra no mercado')
            ->where('summary.income', '0.00')
            ->where('summary.expense', '42.50')
            ->where('summary.balance', '-42.50'));
});

test('transaction summaries include only the authenticated users transactions', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create(['type' => 'income']);
    $expenseCategory = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherIncomeCategory = Category::factory()->for($otherUser)->create(['type' => 'income']);
    $otherExpenseCategory = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($incomeCategory)->create([
        'amount' => '100.00',
        'type' => 'income',
        'date' => '2025-05-10',
    ]);
    Transaction::factory()->for($user)->for($expenseCategory)->create([
        'amount' => '30.00',
        'type' => 'expense',
        'date' => '2025-05-11',
    ]);
    Transaction::factory()->for($otherUser)->for($otherIncomeCategory)->create([
        'amount' => '800.00',
        'type' => 'income',
        'date' => '2025-05-12',
    ]);
    Transaction::factory()->for($otherUser)->for($otherExpenseCategory)->create([
        'amount' => '200.00',
        'type' => 'expense',
        'date' => '2025-05-13',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.index', ['month' => '2025-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 2)
            ->where('summary.income', '100.00')
            ->where('summary.expense', '30.00')
            ->where('summary.balance', '70.00'));
});

test('filters stay in the URL while editing and deleting a transaction', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->for($category)->create([
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);
    $filters = [
        'month' => '2025-05',
        'type' => 'expense',
        'category_id' => (string) $category->id,
        'search' => 'mercado',
    ];

    $this->actingAs($user)
        ->get(route('transactions.edit', [
            'transaction' => $transaction->id,
            ...$filters,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.month', '2025-05')
            ->where('filters.type', 'expense')
            ->where('filters.category_id', (string) $category->id)
            ->where('filters.search', 'mercado'));

    $this->put(route('transactions.update', [
        'transaction' => $transaction->id,
        ...$filters,
    ]), [
        'description' => 'Mercado atualizado',
        'amount' => '25.00',
        'type' => 'expense',
        'category_id' => $category->id,
        'date' => '2025-05-10',
    ])->assertSessionHasNoErrors()
        ->assertRedirect(route('transactions.index', $filters));

    $this->delete(route('transactions.destroy', [
        'transaction' => $transaction->id,
        ...$filters,
    ]))->assertRedirect(route('transactions.index', $filters));
});

test('pagination links keep the active filters', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);

    foreach (range(1, 11) as $day) {
        Transaction::factory()->for($user)->for($category)->create([
            'description' => 'Despesa recorrente',
            'type' => 'expense',
            'date' => sprintf('2025-05-%02d', $day),
        ]);
    }

    $this->actingAs($user)
        ->get(route('transactions.index', [
            'month' => '2025-05',
            'type' => 'expense',
            'category_id' => $category->id,
            'search' => 'recorrente',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('transactions.last_page', 2)
            ->where('transactions.links.0.label', '&laquo; Anterior')
            ->where('transactions.links.3.label', 'Próxima &raquo;')
            ->where('transactions.links.3.url', fn (string $url): bool => str_contains($url, 'month=2025-05')
                && str_contains($url, 'type=expense')
                && str_contains($url, 'category_id='.$category->id)
                && str_contains($url, 'search=recorrente')));
});
