<?php

use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

test('user can create a recurring transaction using their category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $startDate = now()->toDateString();

    $this->actingAs($user)
        ->post(route('recurring-transactions.store'), [
            'description' => 'Aluguel',
            'amount' => '1800.00',
            'type' => 'expense',
            'category_id' => $category->id,
            'frequency' => 'monthly',
            'start_date' => $startDate,
            'end_date' => null,
        ])
        ->assertRedirect(route('recurring-transactions.index'))
        ->assertSessionHasNoErrors();

    $recurringTransaction = RecurringTransaction::query()->firstOrFail();

    expect($recurringTransaction->user_id)->toBe($user->id)
        ->and($recurringTransaction->category_id)->toBe($category->id)
        ->and($recurringTransaction->description)->toBe('Aluguel')
        ->and($recurringTransaction->frequency)->toBe('monthly')
        ->and($recurringTransaction->start_date->format('Y-m-d'))->toBe($startDate)
        ->and($recurringTransaction->next_occurrence_date->format('Y-m-d'))->toBe($startDate);
});

test('recurring rules are private and another user cannot update them', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($owner)->create(['type' => 'income']);
    $recurringTransaction = RecurringTransaction::factory()
        ->for($owner)
        ->for($category)
        ->create([
            'type' => 'income',
            'start_date' => now()->toDateString(),
            'next_occurrence_date' => now()->toDateString(),
        ]);

    $this->actingAs($owner)
        ->get(route('recurring-transactions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('recurring-transactions/index')
            ->has('recurringTransactions', 1));

    $this->actingAs($otherUser)
        ->put(route('recurring-transactions.update', $recurringTransaction), [
            'description' => 'Conta invadida',
            'amount' => '1.00',
            'type' => 'income',
            'category_id' => Category::factory()->for($otherUser)->create(['type' => 'income'])->id,
            'frequency' => 'monthly',
            'end_date' => null,
        ])
        ->assertForbidden();

    expect($recurringTransaction->refresh()->description)->not->toBe('Conta invadida');
});

test('recurring command generates each monthly occurrence once without drifting month end', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-31 10:00:00'));

    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $recurringTransaction = RecurringTransaction::factory()
        ->for($user)
        ->for($category)
        ->create([
            'type' => 'expense',
            'frequency' => 'monthly',
            'start_date' => '2026-10-31',
            'end_date' => '2026-12-31',
            'next_occurrence_date' => '2026-10-31',
        ]);

    $this->artisan('transactions:generate-recurring')->assertSuccessful();
    $this->artisan('transactions:generate-recurring')->assertSuccessful();

    expect($recurringTransaction->transactions()->count())->toBe(1)
        ->and($recurringTransaction->refresh()->next_occurrence_date->toDateString())->toBe('2026-11-30');

    $this->travelTo(CarbonImmutable::parse('2026-11-30 10:00:00'));
    $this->artisan('transactions:generate-recurring')->assertSuccessful();

    expect($recurringTransaction->transactions()->orderBy('date')->pluck('date')->map(fn ($date) => substr((string) $date, 0, 10))->all())
        ->toBe(['2026-10-31', '2026-11-30'])
        ->and($recurringTransaction->refresh()->next_occurrence_date->toDateString())->toBe('2026-12-31');

    $this->travelTo(CarbonImmutable::parse('2026-12-31 10:00:00'));
    $this->artisan('transactions:generate-recurring')->assertSuccessful();

    expect($recurringTransaction->transactions()->count())->toBe(3)
        ->and($recurringTransaction->refresh()->next_occurrence_date)->toBeNull();

    $this->travelTo(CarbonImmutable::parse('2027-01-31 10:00:00'));
    $this->artisan('transactions:generate-recurring')->assertSuccessful();

    expect($recurringTransaction->transactions()->count())->toBe(3);
});

test('recurring transaction cannot use another users category', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($otherUser)->create(['type' => 'expense']);

    $this->actingAs($user)
        ->from(route('recurring-transactions.create'))
        ->post(route('recurring-transactions.store'), [
            'description' => 'Despesa de outra pessoa',
            'amount' => '20.00',
            'type' => 'expense',
            'category_id' => $category->id,
            'frequency' => 'weekly',
            'start_date' => now()->toDateString(),
            'end_date' => null,
        ])
        ->assertSessionHasErrors('category_id');

    expect(RecurringTransaction::query()->count())->toBe(0)
        ->and(Transaction::query()->count())->toBe(0);
});
