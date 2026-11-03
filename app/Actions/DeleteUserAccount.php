<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteUserAccount
{
    public function execute(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $user->tokens()->delete();
            $user->transactions()->withTrashed()->forceDelete();
            $user->recurringTransactions()->delete();
            $user->budgets()->delete();
            $user->categories()->delete();

            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            DB::table('account_deletion_requests')->where('email', $user->email)->delete();

            $user->delete();
        });
    }
}
