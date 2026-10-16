<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use App\Services\BudgetSummaryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Budget::class);

        $user = $request->user();
        $month = $request->query('month', now()->format('Y-m'));
        [$year, $monthNumber] = explode('-', $month);

        $summary = (new BudgetSummaryService())->getSummary($user, (int) $year, (int) $monthNumber);

        $budgets = $summary->map(function (array $item): array {
            return [
                'id' => $item['budget']->id,
                'category_id' => $item['budget']->category_id,
                'category_name' => $item['budget']->category->name,
                'amount' => $item['amount'],
                'spent' => $item['spent'],
                'percentage' => (float) $item['percentage'],
                'status' => $item['status']->value,
            ];
        })->values()->all();

        $budgetedCategoryIds = $budgets
            ? array_column($budgets, 'category_id')
            : [];

        $categoriesWithoutBudget = Category::query()
            ->where('user_id', $user->id)
            ->where('type', 'expense')
            ->when(!empty($budgetedCategoryIds), function ($query) use ($budgetedCategoryIds) {
                $query->whereNotIn('id', $budgetedCategoryIds);
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
            'categoriesWithoutBudget' => $categoriesWithoutBudget,
            'currentMonth' => $month,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBudgetRequest $request): RedirectResponse
    {
        $request->user()->budgets()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Meta criada com sucesso.',
        ]);

        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBudgetRequest $request, Budget $budget): RedirectResponse
    {
        $budget->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Meta atualizada com sucesso.',
        ]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget): RedirectResponse
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Meta excluída com sucesso.',
        ]);

        return back();
    }
}
