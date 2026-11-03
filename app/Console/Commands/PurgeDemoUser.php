<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('demo:purge {--force : Run the command without confirmation}')]
#[Description('Delete the demonstration account and all of its data')]
class PurgeDemoUser extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $demoUser = User::query()
            ->where('email', config('demo.email'))
            ->first();

        if ($demoUser === null) {
            $this->info('No demonstration account was found.');

            return self::SUCCESS;
        }

        if (! $this->option('force')
            && ! $this->confirm("Delete the demonstration account [{$demoUser->email}] and all of its data?", false)) {
            $this->warn('Demo account purge canceled.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($demoUser): void {
            $demoUser->transactions()->withTrashed()->forceDelete();
            $demoUser->recurringTransactions()->delete();
            $demoUser->budgets()->delete();
            $demoUser->categories()->delete();
            $demoUser->delete();
        });

        $this->info("Demonstration account [{$demoUser->email}] and its data were deleted.");

        return self::SUCCESS;
    }
}
