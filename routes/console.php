<?php

use App\Console\Commands\GenerateRecurringTransactions;
use App\Models\AccountDeletionRequest;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::call(fn () => AccountDeletionRequest::query()->where('expires_at', '<=', now())->delete())
    ->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(GenerateRecurringTransactions::class)
    ->everyMinute()
    ->withoutOverlapping();

if (config('demo.instance')) {
    Schedule::command('demo:reset --force')
        ->dailyAt('03:00')
        ->withoutOverlapping();
}
