<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoAuthController;
use App\Http\Controllers\PublicAccountDeletionController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

Route::get('/', fn () => Inertia::render('welcome', [
    'canRegister' => ! config('demo.instance'),
]))->name('home');

Route::get('guide', function (Request $request): BinaryFileResponse {
    $isEnglish = $request->query('lang') === 'en';
    $isDesktop = $request->query('platform') === 'desktop';
    $filename = match (true) {
        $isDesktop && $isEnglish => 'use-guide-saldoa-desktop-en.pdf',
        $isDesktop => 'guia-de-uso-saldoa-desktop.pdf',
        $isEnglish => 'use-guide-saldoa-en.pdf',
        default => 'guia-de-uso-saldoa.pdf',
    };

    return response()->download(base_path('docs/'.$filename), $filename, [
        'Content-Type' => 'application/pdf',
        'Content-Language' => $isEnglish ? 'en' : 'pt-BR',
    ]);
})->name('guide');

Route::get('privacy-policy', function (Request $request): Response {
    return Inertia::render('privacy-policy', [
        'language' => $request->query('lang') === 'en' ? 'en' : 'pt-BR',
    ]);
})->name('privacy-policy');

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
    Route::get('help', fn () => Inertia::render('help'))->name('help');
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
