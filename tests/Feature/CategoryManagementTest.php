<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access category pages or create categories', function () {
    $this->get(route('categories.index'))
        ->assertRedirect(route('login'));

    $this->get(route('categories.create'))
        ->assertRedirect(route('login'));

    $this->post(route('categories.store'), [
        'name' => 'Moradia',
        'type' => 'expense',
    ])->assertRedirect(route('login'));
});

test('a user can create, edit, and delete their categories', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->has('categories', 0));

    $this->get(route('categories.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('categories/create'));

    $this->post(route('categories.store'), [
        'name' => 'Educação',
        'type' => 'expense',
    ])->assertSessionHasNoErrors()
        ->assertRedirect(route('categories.index'));

    $category = Category::query()->where('user_id', $user->id)->firstOrFail();

    $this->get(route('categories.edit', $category))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/edit')
            ->where('category.name', 'Educação'));

    $this->put(route('categories.update', $category), [
        'name' => 'Cursos',
        'type' => 'expense',
    ])->assertSessionHasNoErrors()
        ->assertRedirect(route('categories.index'));

    expect($category->refresh()->name)->toBe('Cursos');

    $this->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'));

    expect($category->fresh())->toBeNull();
});

test('a user cannot view or change another users categories', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($owner)->create([
        'name' => 'Categoria privada',
        'type' => 'expense',
    ]);

    $this->actingAs($otherUser)
        ->get(route('categories.index'))
        ->assertOk()
        ->assertDontSee('Categoria privada');

    $this->get(route('categories.edit', $category))->assertForbidden();

    $this->put(route('categories.update', $category), [
        'name' => 'Categoria alterada',
        'type' => 'income',
    ])->assertForbidden();

    $this->delete(route('categories.destroy', $category))->assertForbidden();

    expect($category->refresh()->name)->toBe('Categoria privada');
});

test('a category with active transactions cannot be deleted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create([
        'type' => 'expense',
    ]);

    Transaction::factory()->for($user)->for($category)->create([
        'type' => 'expense',
    ]);

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.transactionsCount', 1));

    $this->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('inertia.flash_data.toast.message', "N\u{00e3}o \u{00e9} poss\u{00ed}vel excluir uma categoria que possui lan\u{00e7}amentos ativos.");

    expect($category->fresh())->not->toBeNull();
});

test('a category with only soft-deleted transactions can be removed and purged', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $transaction = Transaction::factory()->for($user)->for($category)->create(['type' => 'expense']);
    $transaction->delete();

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.transactionsCount', 0));

    $this->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'));

    expect(Category::query()->find($category->id))->toBeNull()
        ->and(Transaction::withTrashed()->find($transaction->id))->toBeNull();

    $this->post(route('transactions.restore', $transaction->id))->assertNotFound();
});

test('category form requests reject invalid values', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('categories.create'))
        ->post(route('categories.store'), [
            'name' => '',
            'type' => 'transfer',
        ])
        ->assertSessionHasErrors(['name', 'type']);
});
