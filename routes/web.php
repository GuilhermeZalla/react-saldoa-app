<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoAuthController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('demo-login', [DemoAuthController::class, 'login'])
    ->middleware('guest')
    ->middleware('throttle:5,1')
    ->name('demo.login');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::post('transactions/{transaction}/restore', [TransactionController::class, 'restore'])
        ->withTrashed()
        ->name('transactions.restore');
    Route::resource('transactions', TransactionController::class)->except(['show']);
    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
