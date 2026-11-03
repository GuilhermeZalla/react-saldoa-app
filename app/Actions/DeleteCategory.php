<?php

namespace App\Actions;

use App\Models\Category;
use Illuminate\Support\Facades\DB;

class DeleteCategory
{
    public function execute(Category $category): bool
    {
        return DB::transaction(function () use ($category): bool {
            if ($category->transactions()->exists() || $category->recurringTransactions()->exists()) {
                return false;
            }

            $category->transactions()->onlyTrashed()->forceDelete();

            return (bool) $category->delete();
        });
    }
}
