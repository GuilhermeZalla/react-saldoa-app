<?php

namespace App\Console\Commands;

use App\Models\RecurringTransaction;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('transactions:generate-recurring')]
#[Description('Generate transactions due from recurring transaction rules')]
class GenerateRecurringTransactions extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = now()->toDateString();
        $generatedCount = 0;

        RecurringTransaction::query()
            ->whereNotNull('next_occurrence_date')
            ->whereDate('next_occurrence_date', '<=', $today)
            ->orderBy('id')
            ->chunkById(100, function ($recurringTransactions) use ($today, &$generatedCount): void {
                foreach ($recurringTransactions as $recurringTransaction) {
                    $generatedCount += DB::transaction(function () use ($recurringTransaction, $today): int {
                        $lockedRecurringTransaction = RecurringTransaction::query()
                            ->lockForUpdate()
                            ->find($recurringTransaction->id);

                        if ($lockedRecurringTransaction === null || $lockedRecurringTransaction->next_occurrence_date === null) {
                            return 0;
                        }

                        $occurrenceDate = $lockedRecurringTransaction->next_occurrence_date;
                        $endDate = $lockedRecurringTransaction->end_date;
                        $createdCount = 0;

                        while ($occurrenceDate->toDateString() <= $today
                            && ($endDate === null || $occurrenceDate->lessThanOrEqualTo($endDate))) {
                            $transaction = $lockedRecurringTransaction->transactions()->firstOrNew([
                                'date' => $occurrenceDate->toDateString(),
                            ]);

                            if (! $transaction->exists) {
                                $transaction->user_id = $lockedRecurringTransaction->user_id;
                                $transaction->category_id = $lockedRecurringTransaction->category_id;
                                $transaction->description = $lockedRecurringTransaction->description;
                                $transaction->amount = $lockedRecurringTransaction->amount;
                                $transaction->type = $lockedRecurringTransaction->type;
                                $transaction->save();

                                $createdCount++;
                            }

                            $occurrenceDate = $lockedRecurringTransaction->nextOccurrenceAfter($occurrenceDate);
                        }

                        $hasNextOccurrence = $endDate === null || $occurrenceDate->lessThanOrEqualTo($endDate);

                        $lockedRecurringTransaction->update([
                            'next_occurrence_date' => $hasNextOccurrence ? $occurrenceDate->toDateString() : null,
                        ]);

                        return $createdCount;
                    });
                }
            });

        $this->info("{$generatedCount} recurring transaction(s) generated.");

        return self::SUCCESS;
    }
}
