<?php

namespace App\Actions;

use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;

class ExportUserData
{
    /**
     * Return a serializable export without authentication secrets.
     *
     * @return array{
     *     profile: array{id: int, name: string, email: string, email_verified_at: string|null, created_at: string|null, updated_at: string|null},
     *     categories: array<int, array{id: int, name: string, type: string, created_at: string|null, updated_at: string|null}>,
     *     transactions: array<int, array{id: int, category_id: int, description: string, amount: string, type: string, date: string, created_at: string|null, updated_at: string|null, deleted_at: string|null}>,
     *     budgets: array<int, array{id: int, category_id: int, amount: string, created_at: string|null, updated_at: string|null}>,
     *     recurring_transactions: array<int, array{id: int, category_id: int, description: string, amount: string, type: string, frequency: string, start_date: string, end_date: string|null, next_occurrence_date: string|null, created_at: string|null, updated_at: string|null}>
     * }
     */
    public function execute(User $user): array
    {
        return [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
                'updated_at' => $user->updated_at?->toISOString(),
            ],
            'categories' => $user->categories()
                ->orderBy('id')
                ->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type,
                    'created_at' => $category->created_at?->toISOString(),
                    'updated_at' => $category->updated_at?->toISOString(),
                ])
                ->all(),
            'transactions' => $user->transactions()
                ->withTrashed()
                ->orderBy('id')
                ->get()
                ->map(fn (Transaction $transaction): array => [
                    'id' => $transaction->id,
                    'category_id' => $transaction->category_id,
                    'description' => $transaction->description,
                    'amount' => (string) $transaction->amount,
                    'type' => $transaction->type,
                    'date' => $transaction->date->toDateString(),
                    'created_at' => $transaction->created_at?->toISOString(),
                    'updated_at' => $transaction->updated_at?->toISOString(),
                    'deleted_at' => $transaction->deleted_at?->toISOString(),
                ])
                ->all(),
            'budgets' => $user->budgets()
                ->orderBy('id')
                ->get()
                ->map(fn (Budget $budget): array => [
                    'id' => $budget->id,
                    'category_id' => $budget->category_id,
                    'amount' => (string) $budget->amount,
                    'created_at' => $budget->created_at?->toISOString(),
                    'updated_at' => $budget->updated_at?->toISOString(),
                ])
                ->all(),
            'recurring_transactions' => $user->recurringTransactions()
                ->orderBy('id')
                ->get()
                ->map(fn (RecurringTransaction $recurringTransaction): array => [
                    'id' => $recurringTransaction->id,
                    'category_id' => $recurringTransaction->category_id,
                    'description' => $recurringTransaction->description,
                    'amount' => (string) $recurringTransaction->amount,
                    'type' => $recurringTransaction->type,
                    'frequency' => $recurringTransaction->frequency,
                    'start_date' => $recurringTransaction->start_date->toDateString(),
                    'end_date' => $recurringTransaction->end_date?->toDateString(),
                    'next_occurrence_date' => $recurringTransaction->next_occurrence_date?->toDateString(),
                    'created_at' => $recurringTransaction->created_at?->toISOString(),
                    'updated_at' => $recurringTransaction->updated_at?->toISOString(),
                ])
                ->all(),
        ];
    }
}
