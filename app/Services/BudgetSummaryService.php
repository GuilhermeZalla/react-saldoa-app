<?php

namespace App\Services;

use App\Enums\BudgetStatus;
use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BudgetSummaryService
{
    /**
     * Get the budget summary for a given month.
     *
     * Returns a collection of budget summaries, each containing:
     * - budget: the Budget model (with category loaded)
     * - amount: the budget amount as a string (decimal)
     * - spent: total spent in the month as a string (decimal), 0.00 if none
     * - percentage: percentage used, not rounded (can exceed 100)
     * - status: BudgetStatus enum derived from the unrounded percentage
     *
     * @return Collection<int, array{budget: Budget, amount: numeric-string&uppercase-string, spent: numeric-string, percentage: float, status: BudgetStatus}>
     */
    public function getSummary(User $user, int $year, int $month): Collection
    {
        $startOfMonth = Carbon::create($year, $month, 1)->startOfDay();
        $endOfMonth = $startOfMonth->copy()->endOfMonth()->endOfDay();

        $budgets = $user->budgets()
            ->with('category')
            ->get();

        if ($budgets->isEmpty()) {
            return collect();
        }

        $categoryIds = $budgets->pluck('category_id');

        $spending = Transaction::query()
            ->select('category_id', DB::raw('SUM(amount) as total_spent'))
            ->where('user_id', $user->id)
            ->whereIn('category_id', $categoryIds)
            ->whereDate('date', '>=', $startOfMonth->format('Y-m-d'))
            ->whereDate('date', '<=', $endOfMonth->format('Y-m-d'))
            ->groupBy('category_id')
            ->pluck('total_spent', 'category_id');

        return $budgets->map(function ($budget) use ($spending): array {
            $spent = (string) $spending->get($budget->category_id, '0.00');
            $amount = (string) $budget->amount;

            $percentage = bccomp($amount, '0', 2) > 0
                ? (float) $spent * 100.0 / (float) $amount
                : 0.0;

            return [
                'budget' => $budget,
                'amount' => $amount,
                'spent' => number_format((float) $spent, 2, '.', ''),
                'percentage' => $percentage,
                'status' => BudgetStatus::fromPercentage($percentage),
            ];
        });
    }
}
