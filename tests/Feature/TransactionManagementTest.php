<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access transaction pages or create transactions', function () {
    $this->get(route('transactions.index'))
        ->assertRedirect(route('login'));

    $this->get(route('transactions.create'))
        ->assertRedirect(route('login'));

    $this->post(route('transactions.store'), [])
        ->assertRedirect(route('login'));
});

test('a user can create, edit, and delete their transactions', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'income',
    ]);

    $this->actingAs($user)
        ->get(route('transactions.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions/create')
            ->has('categories', 1)
            ->where('categories.0.id', $category->id));

    $this->post(route('transactions.store'), [
        'description' => 'Salário',
        'amount' => '1234.56',
        'type' => 'income',
        'category_id' => $category->id,
        'date' => '2025-05-06',
    ])->assertSessionHasNoErrors()
        ->assertRedirect(route('transactions.index'));

    $transaction = Transaction::query()->where('user_id', $user->id)->firstOrFail();

    expect($transaction->amount)->toBe('1234.56')
        ->and($transaction->user_id)->toBe($user->id);

    $filters = [
        'month' => '2025-05',
        'type' => 'all',
        'category_id' => 'all',
        'search' => '',
    ];

    $this->get(route('transactions.index', $filters))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions/index')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.amount', '1234.56')
            ->where('transactions.data.0.formattedDate', '06/05/2025')
            ->where('transactions.data.0.category.name', $category->name));

    $this->get(route('transactions.edit', [
        'transaction' => $transaction->id,
        ...$filters,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions/edit')
            ->where('transaction.description', 'Salário'));

    $this->put(route('transactions.update', [
        'transaction' => $transaction->id,
        ...$filters,
    ]), [
        'description' => 'Salário atualizado',
        'amount' => '2500.00',
        'type' => 'income',
        'category_id' => $category->id,
        'date' => '2025-05-07',
    ])->assertSessionHasNoErrors()
        ->assertRedirect(route('transactions.index', $filters));

    expect($transaction->refresh()->description)->toBe('Salário atualizado')
        ->and($transaction->amount)->toBe('2500.00');

    $this->delete(route('transactions.destroy', [
        'transaction' => $transaction->id,
        ...$filters,
    ]))->assertRedirect(route('transactions.index', $filters));

    expect(Transaction::withTrashed()->find($transaction->id)?->trashed())->toBeTrue();
});

test('a user can restore a deleted transaction and the undo toast keeps the active filters', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->for($category)->create([
        'description' => 'Mercado para restaurar',
        'type' => 'expense',
        'date' => '2025-05-10',
    ]);
    $filters = [
        'month' => '2025-05',
        'type' => 'expense',
        'category_id' => (string) $category->id,
        'search' => 'Mercado',
    ];

    $this->actingAs($user)
        ->delete(route('transactions.destroy', [
            'transaction' => $transaction->id,
            ...$filters,
        ]))
        ->assertRedirect(route('transactions.index', $filters))
        ->assertSessionHas('inertia.flash_data.toast.duration', 8000)
        ->assertSessionHas('inertia.flash_data.toast.message', "Lan\u{00e7}amento exclu\u{00ed}do")
        ->assertSessionHas('inertia.flash_data.toast.action.label', 'Desfazer')
        ->assertSessionHas('inertia.flash_data.toast.action.method', 'post')
        ->assertSessionHas('inertia.flash_data.toast.action.url', route('transactions.restore', [
            'transaction' => $transaction->id,
            ...$filters,
        ]));

    $this->post(route('transactions.restore', [
        'transaction' => $transaction->id,
        ...$filters,
    ]))
        ->assertRedirect(route('transactions.index', $filters))
        ->assertSessionHas('inertia.flash_data.toast.message', "Lan\u{00e7}amento restaurado.");

    expect($transaction->fresh())->not->toBeNull();
});

test('restoring a transaction that is already active responds safely', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'income']);
    $transaction = Transaction::factory()->for($user)->for($category)->create();

    $this->actingAs($user)
        ->post(route('transactions.restore', [
            'transaction' => $transaction->id,
            'month' => '2025-05',
            'type' => 'income',
            'category_id' => 'all',
            'search' => '',
        ]))
        ->assertRedirect(route('transactions.index', [
            'month' => '2025-05',
            'type' => 'income',
            'category_id' => 'all',
            'search' => '',
        ]))
        ->assertSessionHas('inertia.flash_data.toast.message', "Este lan\u{00e7}amento j\u{00e1} est\u{00e1} ativo.");

    expect($transaction->fresh())->not->toBeNull();
});

test('a transaction requires an amount greater than zero', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'expense',
    ]);

    $this->actingAs($user)
        ->from(route('transactions.create'))
        ->post(route('transactions.store'), [
            'description' => 'Conta de luz',
            'amount' => '0',
            'type' => 'expense',
            'category_id' => $category->id,
            'date' => '2025-05-06',
        ])
        ->assertSessionHasErrors(['amount']);

    expect(Transaction::query()->count())->toBe(0);
});

test('a transaction rejects an invalid date with a Portuguese validation message', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'expense',
    ]);

    $this->actingAs($user)
        ->from(route('transactions.create'))
        ->post(route('transactions.store'), [
            'description' => 'Conta de luz',
            'amount' => '50.00',
            'type' => 'expense',
            'category_id' => $category->id,
            'date' => 'não é uma data',
        ])
        ->assertSessionHasErrors(['date']);

    expect(session('errors')->getBag('default')->first('date'))
        ->toBe('Informe uma data válida.');
});

test('a user cannot view or change another users transactions', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($owner)->create([
        'type' => 'expense',
    ]);
    $transaction = Transaction::factory()->for($owner)->for($category)->create([
        'description' => 'Lançamento privado',
        'type' => 'expense',
    ]);

    $this->actingAs($otherUser)
        ->get(route('transactions.index', ['month' => '2025-05']))
        ->assertOk()
        ->assertDontSee('Lançamento privado');

    $this->get(route('transactions.edit', $transaction))->assertForbidden();

    $this->put(route('transactions.update', $transaction), [
        'description' => 'Tentativa de alteração',
        'amount' => '10.00',
        'type' => 'expense',
        'category_id' => $category->id,
        'date' => '2025-05-06',
    ])->assertForbidden();

    $this->delete(route('transactions.destroy', $transaction))->assertForbidden();

    $transaction->delete();

    $this->post(route('transactions.restore', $transaction))->assertForbidden();

    expect(Transaction::withTrashed()->findOrFail($transaction->id)->description)->toBe('Lançamento privado');
});

test('a transaction must use a category owned by the user with the same type', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $incomeCategory = Category::factory()->for($user)->create([
        'type' => 'income',
    ]);
    $otherUsersCategory = Category::factory()->for($otherUser)->create([
        'type' => 'expense',
    ]);

    $this->actingAs($user)
        ->from(route('transactions.create'))
        ->post(route('transactions.store'), [
            'description' => 'Categoria incompatível',
            'amount' => '10.00',
            'type' => 'expense',
            'category_id' => $incomeCategory->id,
            'date' => '2025-05-06',
        ])
        ->assertSessionHasErrors(['category_id']);

    $this->post(route('transactions.store'), [
        'description' => 'Categoria de outra pessoa',
        'amount' => '10.00',
        'type' => 'expense',
        'category_id' => $otherUsersCategory->id,
        'date' => '2025-05-06',
    ])->assertSessionHasErrors(['category_id']);

    expect(Transaction::query()->count())->toBe(0);
});

test('transactions are paginated and ordered by most recent date first', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'expense',
    ]);

    foreach (range(1, 12) as $day) {
        Transaction::factory()->for($user)->for($category)->create([
            'date' => sprintf('2025-01-%02d', $day),
            'type' => 'expense',
        ]);
    }

    $this->actingAs($user)
        ->get(route('transactions.index', ['month' => '2025-01']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 10)
            ->where('transactions.current_page', 1)
            ->where('transactions.last_page', 2)
            ->where('transactions.data.0.formattedDate', '12/01/2025'));
});

test('restoring a transaction that does not exist returns not found', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('transactions.restore', 999999))
        ->assertNotFound();
});

test('a transaction cannot be restored after its category was removed permanently', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()
        ->for($user)
        ->for($category)
        ->create(['type' => 'expense']);

    $this->actingAs($user);

    $this->delete(route('transactions.destroy', $transaction));
    $this->delete(route('categories.destroy', $category));

    $this->post(route('transactions.restore', $transaction->id))->assertNotFound();
});
