<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoAuthController;
use App\Http\Controllers\PublicAccountDeletionController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome', [
    'canRegister' => ! config('demo.instance'),
]))->name('home');

Route::post('demo-login', [DemoAuthController::class, 'login'])
    ->middleware('guest')
    ->middleware('throttle:5,1')
    ->name('demo.login');

Route::get('account-deletion', [PublicAccountDeletionController::class, 'create'])
    ->name('account-deletion.request');
Route::post('account-deletion', [PublicAccountDeletionController::class, 'store'])
    ->middleware('throttle:account-deletion')
    ->name('account-deletion.send');
Route::get('account-deletion/requested', [PublicAccountDeletionController::class, 'requested'])
    ->name('account-deletion.requested');
Route::get('account-deletion/confirm/{token}', [PublicAccountDeletionController::class, 'confirm'])
    ->middleware('throttle:account-deletion-confirm')
    ->name('account-deletion.confirm');
Route::post('account-deletion/confirm', [PublicAccountDeletionController::class, 'destroy'])
    ->middleware('throttle:account-deletion-confirm')
    ->name('account-deletion.destroy');
Route::get('account-deletion/complete', [PublicAccountDeletionController::class, 'complete'])
    ->name('account-deletion.complete');

Route::middleware(['auth', 'verified', 'demo-instance-read-only'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::post('transactions/{transaction}/restore', [TransactionController::class, 'restore'])
        ->withTrashed()
        ->name('transactions.restore');
    Route::get('transactions/export', [TransactionController::class, 'export'])
        ->name('transactions.export');
    Route::resource('transactions', TransactionController::class)->except(['show']);
    Route::resource('recurring-transactions', RecurringTransactionController::class)
        ->parameters(['recurring-transactions' => 'recurringTransaction'])
        ->except(['show']);
    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
