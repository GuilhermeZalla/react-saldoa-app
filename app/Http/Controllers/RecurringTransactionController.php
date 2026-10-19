<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Models\Category;
use App\Models\RecurringTransaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', RecurringTransaction::class);

        $recurringTransactions = $request->user()->recurringTransactions()
            ->with('category:id,name')
            ->orderByRaw('next_occurrence_date IS NULL')
            ->orderBy('next_occurrence_date')
            ->orderBy('id')
            ->get()
            ->map(fn (RecurringTransaction $recurringTransaction): array => [
                'id' => $recurringTransaction->id,
                'description' => $recurringTransaction->description,
                'amount' => (string) $recurringTransaction->amount,
                'type' => $recurringTransaction->type,
                'frequency' => $recurringTransaction->frequency,
                'startDate' => $recurringTransaction->start_date->format('Y-m-d'),
                'endDate' => $recurringTransaction->end_date?->format('Y-m-d'),
                'nextOccurrenceDate' => $recurringTransaction->next_occurrence_date?->format('Y-m-d'),
                'category' => [
                    'id' => $recurringTransaction->category->id,
                    'name' => $recurringTransaction->category->name,
                ],
            ])
            ->all();

        return Inertia::render('recurring-transactions/index', [
            'recurringTransactions' => $recurringTransactions,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', RecurringTransaction::class);

        return Inertia::render('recurring-transactions/create', [
            'categories' => $this->categoryOptions($request),
            'startDate' => now()->toDateString(),
        ]);
    }

    public function store(StoreRecurringTransactionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $request->user()->recurringTransactions()->create([
            ...$validated,
            'next_occurrence_date' => $validated['start_date'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Recorrência criada com sucesso.',
        ]);

        return to_route('recurring-transactions.index');
    }

    public function edit(Request $request, RecurringTransaction $recurringTransaction): Response
    {
        $this->authorize('update', $recurringTransaction);

        return Inertia::render('recurring-transactions/edit', [
            'categories' => $this->categoryOptions($request),
            'recurringTransaction' => [
                'id' => $recurringTransaction->id,
                'description' => $recurringTransaction->description,
                'amount' => (string) $recurringTransaction->amount,
                'type' => $recurringTransaction->type,
                'frequency' => $recurringTransaction->frequency,
                'categoryId' => $recurringTransaction->category_id,
                'startDate' => $recurringTransaction->start_date->format('Y-m-d'),
                'endDate' => $recurringTransaction->end_date?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(
        UpdateRecurringTransactionRequest $request,
        RecurringTransaction $recurringTransaction,
    ): RedirectResponse {
        $validated = $request->validated();

        $recurringTransaction->update([
            ...$validated,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Recorrência atualizada com sucesso.',
        ]);

        return to_route('recurring-transactions.index');
    }

    public function destroy(RecurringTransaction $recurringTransaction): RedirectResponse
    {
        $this->authorize('delete', $recurringTransaction);

        $recurringTransaction->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Recorrência excluída. Os lançamentos já criados foram mantidos.',
        ]);

        return to_route('recurring-transactions.index');
    }

    /**
     * Get categories owned by the authenticated user.
     *
     * @return array<int, array{id: int, name: string, type: string}>
     */
    private function categoryOptions(Request $request): array
    {
        return $request->user()->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'type'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
            ])
            ->all();
    }
}
