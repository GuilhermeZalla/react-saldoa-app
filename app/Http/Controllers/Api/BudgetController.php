<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use App\Services\BudgetSummaryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, BudgetSummaryService $budgetSummary): JsonResponse
    {
        $this->authorize('viewAny', Budget::class);
        $month = $request->query('month');

        if (! is_string($month) || preg_match('/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/D', $month) !== 1) {
            $month = now()->format('Y-m');
        }

        [$year, $monthNumber] = array_map('intval', explode('-', $month));
        $summary = $budgetSummary->getSummary($request->user(), $year, $monthNumber);
        $budgets = $summary->map(fn (array $item): array => [
            'id' => $item['budget']->id,
            'category_id' => $item['budget']->category_id,
            'category_name' => $item['budget']->category->name,
            'amount' => (string) $item['amount'],
            'spent' => (string) $item['spent'],
            'percentage' => (float) $item['percentage'],
            'status' => $item['status']->value,
        ])->values();
        $budgetedCategoryIds = $budgets->pluck('category_id')->all();
        $categoriesWithoutBudget = $request->user()->categories()
            ->where('type', 'expense')
            ->when($budgetedCategoryIds !== [], fn ($query) => $query->whereNotIn('id', $budgetedCategoryIds))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ]);

        return response()->json([
            'data' => $budgets,
            'month' => $month,
            'categories_without_budget' => $categoriesWithoutBudget,
        ]);
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $budget = $request->user()->budgets()->create($request->validated());

        return response()->json(['data' => $this->serialize($budget->load('category'))], 201);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): JsonResponse
    {
        $budget->update($request->validated());

        return response()->json(['data' => $this->serialize($budget->load('category'))]);
    }

    public function destroy(Budget $budget): JsonResponse
    {
        $this->authorize('delete', $budget);
        $budget->delete();

        return response()->json(status: 204);
    }

    /**
     * @return array{id: int, category_id: int, category_name: string, amount: string}
     */
    private function serialize(Budget $budget): array
    {
        return [
            'id' => $budget->id,
            'category_id' => $budget->category_id,
            'category_name' => $budget->category->name,
            'amount' => (string) $budget->amount,
        ];
    }
}
