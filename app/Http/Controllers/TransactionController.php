<?php

namespace App\Http\Controllers;

use App\Actions\ExportTransactionsCsv;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Transaction;
use App\Queries\TransactionQuery;
use App\Support\DecimalAmount;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TransactionQuery $transactionQuery,
        private ExportTransactionsCsv $exportTransactionsCsv,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Transaction::class);

        $filters = $this->transactionQuery->filtersFor($request, $request->user());
        $monthStart = Carbon::parse($filters['month'].'-01')->startOfMonth();

        $query = $this->transactionQuery->filteredTransactions($request->user(), $filters);

        $totals = (clone $query)->selectRaw(
            'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income_total, '
            .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense_total, '
            .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE -amount END), 0) AS balance_total',
            ['income', 'expense', 'income'],
        )->first();

        $transactions = (clone $query)
            ->with('category:id,name')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(10)
            ->appends($filters)
            ->through(fn (Transaction $transaction): array => [
                'id' => $transaction->id,
                'description' => $transaction->description,
                'amount' => (string) $transaction->amount,
                'type' => $transaction->type,
                'date' => $transaction->date->format('Y-m-d'),
                'formattedDate' => $transaction->date->format('d/m/Y'),
                'category' => [
                    'id' => $transaction->category->id,
                    'name' => $transaction->category->name,
                ],
            ]);

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'categories' => $this->categoryOptions($request),
            'filters' => $filters,
            'monthNavigation' => [
                'current' => $filters['month'],
                'previous' => $monthStart->copy()->subMonth()->format('Y-m'),
                'next' => $monthStart->copy()->addMonth()->format('Y-m'),
                'default' => now()->format('Y-m'),
            ],
            'summary' => [
                'income' => DecimalAmount::format($totals->income_total),
                'expense' => DecimalAmount::format($totals->expense_total),
                'balance' => DecimalAmount::format($totals->balance_total),
            ],
        ]);
    }

    /**
     * Export the filtered transactions as a spreadsheet-friendly CSV file.
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Transaction::class);

        $filters = $this->transactionQuery->filtersFor($request, $request->user());
        $transactions = $this->transactionQuery->filteredTransactions($request->user(), $filters)
            ->with('category:id,name')
            ->orderBy('date')
            ->orderBy('id');

        return $this->exportTransactionsCsv->execute($transactions, 'lancamentos-'.$filters['month'].'.csv');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Transaction::class);

        return Inertia::render('transactions/create', [
            'categories' => $this->categoryOptions($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $request->user()->transactions()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lançamento criado com sucesso.',
        ]);

        return to_route('transactions.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Transaction $transaction): Response
    {
        $this->authorize('update', $transaction);

        return Inertia::render('transactions/edit', [
            'transaction' => [
                'id' => $transaction->id,
                'description' => $transaction->description,
                'amount' => (string) $transaction->amount,
                'type' => $transaction->type,
                'categoryId' => $transaction->category_id,
                'date' => $transaction->date->format('Y-m-d'),
            ],
            'categories' => $this->categoryOptions($request),
            'filters' => $this->transactionQuery->filtersFor($request, $request->user()),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $transaction->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lançamento atualizado com sucesso.',
        ]);

        return to_route('transactions.index', $this->transactionQuery->filtersFor($request, $request->user()));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorize('delete', $transaction);

        $transaction->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lançamento excluído',
            'duration' => 8000,
            'action' => [
                'label' => 'Desfazer',
                'url' => route('transactions.restore', [
                    'transaction' => $transaction->id,
                    ...$this->transactionQuery->filtersFor($request, $request->user()),
                ]),
                'method' => 'post',
            ],
        ]);

        return to_route('transactions.index', $this->transactionQuery->filtersFor($request, $request->user()));
    }

    /**
     * Restore a soft-deleted transaction.
     */
    public function restore(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorize('restore', $transaction);

        if (! $transaction->trashed()) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Este lançamento já está ativo.',
                'duration' => 3000,
            ]);

            return to_route('transactions.index', $this->transactionQuery->filtersFor($request, $request->user()));
        }

        $transaction->restore();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lançamento restaurado.',
            'duration' => 3000,
        ]);

        return to_route('transactions.index', $this->transactionQuery->filtersFor($request, $request->user()));
    }

    /**
     * Get categories owned by the authenticated user for the transaction forms.
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
