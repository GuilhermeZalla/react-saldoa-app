<?php

namespace App\Console\Commands;

use App\Actions\DeleteUserAccount;
use App\Models\User;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('demo:reset {--force : Run the command without confirmation}')]
#[Description('Reset the isolated demonstration account and its sample data')]
class ResetDemoInstance extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DeleteUserAccount $deleteUserAccount, DemoDataSeeder $demoDataSeeder): int
    {
        if (! app()->environment(['local', 'testing']) && ! config('demo.instance')) {
            $this->error('Demo reset is only available locally, in testing, or on an isolated DEMO_INSTANCE.');

            return self::FAILURE;
        }

        $demoUser = User::query()
            ->where('email', config('demo.email'))
            ->first();

        if ($demoUser !== null) {
            $this->line("Demo account to reset: {$demoUser->email}");
            $this->line('Records to delete:');
            $this->line('Transactions: '.$demoUser->transactions()->withTrashed()->count());
            $this->line('Recurring transactions: '.$demoUser->recurringTransactions()->count());
            $this->line('Budgets: '.$demoUser->budgets()->count());
            $this->line('Categories: '.$demoUser->categories()->count());

            if (! $this->option('force')
                && ! $this->confirm("Delete and recreate the demonstration account [{$demoUser->email}]?", false)) {
                $this->warn('Demo reset canceled.');

                return self::SUCCESS;
            }

            $deleteUserAccount->execute($demoUser);
        }

        $demoDataSeeder->run();
        $this->info('Demonstration account and sample data were reset.');

        return self::SUCCESS;
    }
}
