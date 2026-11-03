<?php

namespace App\Queries;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TransactionQuery
{
    /**
     * Normalize filters from the current URL and restrict category IDs to the user.
     *
     * @return array{month: string, type: string, category_id: string, search: string}
     */
    public function filtersFor(Request $request, User $user): array
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

        if (is_string($requestedCategoryId)) {
            $validatedCategoryId = filter_var($requestedCategoryId, FILTER_VALIDATE_INT);

            if ($validatedCategoryId !== false
                && $validatedCategoryId > 0
                && $user->categories()->whereKey($validatedCategoryId)->exists()) {
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

    /**
     * Build the user's transaction query using normalized list filters.
     *
     * @param  array{month: string, type: string, category_id: string, search: string}  $filters
     * @return Builder<Transaction>
     */
    public function filteredTransactions(User $user, array $filters): Builder
    {
        $monthStart = Carbon::parse($filters['month'].'-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();

        $query = $user->transactions()->getQuery()
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

        return $query;
    }
}
