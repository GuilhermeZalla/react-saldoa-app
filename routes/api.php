<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RecurringTransactionController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('auth/register', [AuthController::class, 'register'])
        ->middleware('throttle:api-register')
        ->name('auth.register');
    Route::post('auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:api-login')
        ->name('auth.login');
    Route::post('auth/demo', [AuthController::class, 'demo'])
        ->middleware('throttle:api-demo')
        ->name('auth.demo');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::post('auth/logout-all', [AuthController::class, 'logoutAll'])->name('auth.logout-all');
        Route::post('auth/refresh', [AuthController::class, 'refresh'])
            ->middleware('throttle:api-refresh')
            ->name('auth.refresh');
    });

    Route::middleware(['auth:sanctum', 'demo-instance-read-only'])->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('transactions/export', [TransactionController::class, 'export'])
            ->name('transactions.export');
        Route::post('transactions/{transaction}/restore', [TransactionController::class, 'restore'])
            ->withTrashed()
            ->name('transactions.restore');
        Route::apiResource('transactions', TransactionController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('budgets', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('recurring-transactions', RecurringTransactionController::class)
            ->parameters(['recurring-transactions' => 'recurringTransaction']);

        Route::get('account/export', [AccountController::class, 'export'])->name('account.export');
        Route::delete('account', [AccountController::class, 'destroy'])->name('account.destroy');
    });
});
