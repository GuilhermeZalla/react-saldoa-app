<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Support\DecimalAmount;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use LogicException;
use stdClass;

class DashboardDataService
{
    /**
     * Normalize a dashboard month parameter.
     */
    public function normalizeMonth(mixed $month): string
    {
        if (! is_string($month)
            || preg_match('/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/D', $month) !== 1) {
            return now()->format('Y-m');
        }

        return $month;
    }

    /**
     * Build all values rendered by the web dashboard or returned by the API.
     *
     * @return array<string, mixed>
     */
    public function forMonth(User $user, string $month): array
    {
        $monthStart = Carbon::parse($month.'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $previousMonthStart = $monthStart->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $monthStart->copy()->subDay();
        $chartStart = $monthStart->copy()->subMonths(5)->startOfMonth();
        $dateRange = [$monthStart->toDateString(), $monthEnd->toDateString()];
        $previousMonthDateRange = [
            $previousMonthStart->toDateString(),
            $previousMonthEnd->toDateString(),
        ];

        $allTimeTotals = $user->transactions()
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount WHEN type = ? THEN -amount ELSE 0 END), 0) AS balance_total',
                ['income', 'expense', 'income', 'expense'],
            )
            ->first();

        $monthTotals = $user->transactions()
            ->whereBetween('date', $dateRange)
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount WHEN type = ? THEN -amount ELSE 0 END), 0) AS balance_total, '
                .'COUNT(*) AS transaction_count',
                ['income', 'expense', 'income', 'expense'],
            )
            ->first();

        $previousMonthTotals = $user->transactions()
            ->whereBetween('date', $previousMonthDateRange)
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount WHEN type = ? THEN -amount ELSE 0 END), 0) AS balance_total',
                ['income', 'expense', 'income', 'expense'],
            )
            ->first();

        $categoryExpenses = $user->transactions()
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->where('categories.user_id', $user->id)
            ->whereBetween('transactions.date', $dateRange)
            ->where('transactions.type', 'expense')
            ->selectRaw(
                'categories.id AS category_id, categories.name AS category_name, SUM(transactions.amount) AS total',
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->toBase()
            ->get()
            ->map(fn (stdClass $row): array => [
                'id' => (int) $row->category_id,
                'name' => (string) $row->category_name,
                'value' => DecimalAmount::format($row->total),
                'total' => DecimalAmount::format($row->total),
            ])
            ->all();

        $monthExpression = $this->monthExpression();
        $monthlyTotals = $user->transactions()
            ->whereBetween('transactions.date', [
                $chartStart->toDateString(),
                $monthEnd->toDateString(),
            ])
            ->selectRaw($monthExpression.' AS month_key')
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income_total, '
                .'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense_total',
                ['income', 'expense'],
            )
            ->groupByRaw($monthExpression)
            ->get()
            ->keyBy('month_key');

        $monthlyTrend = collect(range(0, 5))
            ->map(function (int $monthOffset) use ($chartStart, $monthlyTotals): array {
                $monthDate = $chartStart->copy()->addMonths($monthOffset);
                $monthKey = $monthDate->format('Y-m');
                $totals = $monthlyTotals->get($monthKey);

                return [
                    'month' => $monthKey,
                    'label' => $this->monthLabel($monthDate, 'M/Y'),
                    'income' => DecimalAmount::format(data_get($totals, 'income_total', 0)),
                    'expense' => DecimalAmount::format(data_get($totals, 'expense_total', 0)),
                ];
            })
            ->all();

        $recentTransactions = $user->transactions()
            ->with([
                'category' => function (BelongsTo $query) use ($user): void {
                    $query->where('categories.user_id', $user->id)
                        ->select(['id', 'name']);
                },
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(5)
            ->get(['id', 'category_id', 'description', 'amount', 'type', 'date'])
            ->map(fn (Transaction $transaction): array => [
                'id' => $transaction->id,
                'description' => $transaction->description,
                'amount' => (string) $transaction->amount,
                'type' => $transaction->type,
                'date' => $transaction->date->format('Y-m-d'),
                'formattedDate' => $transaction->date->format('d/m/Y'),
                'category' => $transaction->category->name ?? 'Categoria indisponível',
            ])
            ->all();

        return [
            'filters' => [
                'month' => $month,
            ],
            'monthNavigation' => [
                'current' => $month,
                'previous' => $monthStart->copy()->subMonth()->format('Y-m'),
                'next' => $monthStart->copy()->addMonth()->format('Y-m'),
                'label' => $this->monthLabel($monthStart, 'F \d\e Y'),
            ],
            'summary' => [
                'overallBalance' => DecimalAmount::format(data_get($allTimeTotals, 'balance_total', 0)),
                'monthlyIncome' => DecimalAmount::format(data_get($monthTotals, 'income_total', 0)),
                'monthlyExpense' => DecimalAmount::format(data_get($monthTotals, 'expense_total', 0)),
                'monthlyBalance' => DecimalAmount::format(data_get($monthTotals, 'balance_total', 0)),
                'monthlyComparison' => [
                    'income' => $this->compareMonthlyAmounts(
                        data_get($monthTotals, 'income_total', 0),
                        data_get($previousMonthTotals, 'income_total', 0),
                        'income',
                    ),
                    'expense' => $this->compareMonthlyAmounts(
                        data_get($monthTotals, 'expense_total', 0),
                        data_get($previousMonthTotals, 'expense_total', 0),
                        'expense',
                    ),
                    'balance' => $this->compareMonthlyAmounts(
                        data_get($monthTotals, 'balance_total', 0),
                        data_get($previousMonthTotals, 'balance_total', 0),
                        'balance',
                    ),
                ],
            ],
            'expensesByCategory' => $categoryExpenses,
            'monthlyTrend' => $monthlyTrend,
            'recentTransactions' => $recentTransactions,
            'hasTransactionsInMonth' => (int) data_get($monthTotals, 'transaction_count', 0) > 0,
            'hasTransactionsInChartRange' => $monthlyTotals->isNotEmpty(),
            'budgetAlerts' => $this->budgetAlerts($user, $monthStart),
            'hasBudgets' => $user->budgets()->exists(),
        ];
    }

    /**
     * @return array<int, array{category_name: string, percentage: float, status: string}>
     */
    private function budgetAlerts(User $user, Carbon $monthStart): array
    {
        $summary = (new BudgetSummaryService)->getSummary($user, (int) $monthStart->format('Y'), (int) $monthStart->format('m'));

        return $summary
            ->filter(fn (array $item): bool => in_array($item['status']->value, ['warning', 'exceeded']))
            ->sortByDesc(fn (array $item): float => (float) $item['percentage'])
            ->map(fn (array $item): array => [
                'category_name' => $item['budget']->category->name,
                'percentage' => (float) $item['percentage'],
                'status' => $item['status']->value,
            ])
            ->values()
            ->all();
    }

    /** @return literal-string */
    private function monthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', transactions.date)",
            'mysql', 'mariadb' => "DATE_FORMAT(transactions.date, '%Y-%m')",
            'pgsql' => "TO_CHAR(transactions.date, 'YYYY-MM')",
            default => throw new LogicException('The current database driver cannot group transactions by month.'),
        };
    }

    private function monthLabel(Carbon $month, string $format): string
    {
        $month->locale('pt_BR');

        return $month->translatedFormat($format);
    }

    /**
     * @param  'income'|'expense'|'balance'  $metric
     * @return array{previousValue: string, percentageChange: float|null, state: 'none'|'new'|'unchanged'|'percentage', sentiment: 'positive'|'negative'|'neutral'}
     */
    private function compareMonthlyAmounts(mixed $currentAmount, mixed $previousAmount, string $metric): array
    {
        $currentMinorUnits = DecimalAmount::minorUnits($currentAmount);
        $previousMinorUnits = DecimalAmount::minorUnits($previousAmount);
        $differenceMinorUnits = $currentMinorUnits - $previousMinorUnits;

        if ($previousMinorUnits === 0) {
            return [
                'previousValue' => DecimalAmount::format($previousAmount),
                'percentageChange' => null,
                'state' => $currentMinorUnits === 0 ? 'none' : 'new',
                'sentiment' => $currentMinorUnits === 0
                    ? 'neutral'
                    : $this->sentimentForNewAmount($currentMinorUnits, $metric),
            ];
        }

        if ($differenceMinorUnits === 0) {
            return [
                'previousValue' => DecimalAmount::format($previousAmount),
                'percentageChange' => 0.0,
                'state' => 'unchanged',
                'sentiment' => 'neutral',
            ];
        }

        $percentageChange = round(
            ($differenceMinorUnits / abs($previousMinorUnits)) * 100,
            1,
        );
        $isFavorable = match ($metric) {
            'income', 'balance' => $differenceMinorUnits > 0,
            'expense' => $differenceMinorUnits < 0,
        };

        return [
            'previousValue' => DecimalAmount::format($previousAmount),
            'percentageChange' => $percentageChange,
            'state' => 'percentage',
            'sentiment' => $isFavorable ? 'positive' : 'negative',
        ];
    }

    /**
     * @param  'income'|'expense'|'balance'  $metric
     * @return 'positive'|'negative'
     */
    private function sentimentForNewAmount(int $amountInMinorUnits, string $metric): string
    {
        return match ($metric) {
            'income' => $amountInMinorUnits > 0 ? 'positive' : 'negative',
            'expense' => $amountInMinorUnits > 0 ? 'negative' : 'positive',
            'balance' => $amountInMinorUnits > 0 ? 'positive' : 'negative',
        };
    }
}
