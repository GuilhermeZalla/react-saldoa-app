<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Transaction::class);

        $filters = $this->filtersFor($request);
        $monthStart = Carbon::parse($filters['month'].'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $query = $request->user()->transactions()
            ->whereBetween('date', [
                $monthStart->toDateString(),
                $monthEnd->toDateString(),
            ]);

        if ($filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if ($filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        if ($filters['search'] !== '') {
            $query->where('description', 'like', '%'.$filters['search'].'%');
        }

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
                'income' => $this->decimalAmount($totals->income_total),
                'expense' => $this->decimalAmount($totals->expense_total),
                'balance' => $this->decimalAmount($totals->balance_total),
            ],
        ]);
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
            'filters' => $this->filtersFor($request),
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

        return to_route('transactions.index', $this->filtersFor($request));
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
                    ...$this->filtersFor($request),
                ]),
                'method' => 'post',
            ],
        ]);

        return to_route('transactions.index', $this->filtersFor($request));
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

            return to_route('transactions.index', $this->filtersFor($request));
        }

        $transaction->restore();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lançamento restaurado.',
            'duration' => 3000,
        ]);

        return to_route('transactions.index', $this->filtersFor($request));
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

    /**
     * Normalize filters from the current URL and restrict category IDs to the user.
     *
     * @return array{month: string, type: string, category_id: string, search: string}
     */
    private function filtersFor(Request $request): array
    {
        $month = $request->query('month');

        if (! is_string($month)
            || preg_match('/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/D', $month) !== 1) {
            $month = now()->format('Y-m');
        }

        $type = $request->query('type', 'all');

        if (! is_string($type) || ! in_array($type, ['all', 'income', 'expense'], true)) {
            $type = 'all';
        }

        $categoryId = 'all';
        $requestedCategoryId = $request->query('category_id');

        if (is_string($requestedCategoryId) || is_int($requestedCategoryId)) {
            $validatedCategoryId = filter_var($requestedCategoryId, FILTER_VALIDATE_INT);

            if ($validatedCategoryId !== false
                && $validatedCategoryId > 0
                && $request->user()->categories()->whereKey($validatedCategoryId)->exists()) {
                $categoryId = (string) $validatedCategoryId;
            }
        }

        $search = $request->query('search', '');
        $search = is_string($search) ? mb_substr(trim($search), 0, 255) : '';

        return [
            'month' => $month,
            'type' => $type,
            'category_id' => $categoryId,
            'search' => $search,
        ];
    }

    private function decimalAmount(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
