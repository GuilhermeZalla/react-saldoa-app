<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('transaction export downloads only the records matching the user and filters', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $category = Category::factory()->for($user)->create(['type' => 'expense']);
    $otherCategory = Category::factory()->for($user)->create(['type' => 'expense']);

    Transaction::factory()->for($user)->for($category)->create([
        'description' => '=HYPERLINK("https://example.com","Plano")',
        'amount' => '125.50',
        'type' => 'expense',
        'date' => '2026-10-05',
    ]);
    Transaction::factory()->for($user)->for($otherCategory)->create([
        'description' => 'Plano de outra categoria',
        'type' => 'expense',
        'date' => '2026-10-06',
    ]);
    Transaction::factory()->for($user)->for($category)->create([
        'description' => 'Plano de outro mês',
        'type' => 'expense',
        'date' => '2026-09-06',
    ]);
    Transaction::factory()->for($otherUser)->create([
        'description' => 'Plano de outra conta',
        'type' => 'expense',
        'date' => '2026-10-06',
    ]);

    $response = $this->actingAs($user)
        ->get(route('transactions.export', [
            'month' => '2026-10',
            'type' => 'expense',
            'category_id' => $category->id,
            'search' => 'Plano',
        ]));

    $response->assertDownload('lancamentos-2026-10.csv');

    $csv = $response->streamedContent();

    expect($csv)
        ->toStartWith("\xEF\xBB\xBF")
        ->toContain('Data;Tipo;Categoria;Descrição;Valor')
        ->toContain("'=HYPERLINK")
        ->toContain('125,50')
        ->not->toContain('outra categoria')
        ->not->toContain('outro mês')
        ->not->toContain('outra conta');
});

test('guests cannot export transactions', function () {
    $this->get(route('transactions.export'))
        ->assertRedirect(route('login'));
});
