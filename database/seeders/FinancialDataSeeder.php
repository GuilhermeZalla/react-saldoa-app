<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class FinancialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => 'password'],
        );

        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        /** @var array<string, 'income'|'expense'> $categoryDefinitions */
        $categoryDefinitions = [
            'Salário' => 'income',
            'Freelance' => 'income',
            'Moradia' => 'expense',
            'Alimentação' => 'expense',
            'Transporte' => 'expense',
        ];

        /** @var array<string, Category> $categories */
        $categories = [];

        foreach ($categoryDefinitions as $name => $type) {
            $categories[$name] = $user->categories()->firstOrCreate(
                ['name' => $name],
                ['type' => $type],
            );
        }

        $today = now();

        /**
         * @var array<int, array{
         *     category: Category,
         *     description: string,
         *     amount: string,
         *     type: 'income'|'expense',
         *     date: string
         * }> $sampleTransactions
         */
        $sampleTransactions = [
            [
                'category' => $categories['Salário'],
                'description' => 'Salário mensal',
                'amount' => '4500.00',
                'type' => 'income',
                'date' => $today->copy()->startOfMonth()->toDateString(),
            ],
            [
                'category' => $categories['Freelance'],
                'description' => 'Projeto freelance',
                'amount' => '750.00',
                'type' => 'income',
                'date' => $today->copy()->subDays(3)->toDateString(),
            ],
            [
                'category' => $categories['Moradia'],
                'description' => 'Aluguel',
                'amount' => '1600.00',
                'type' => 'expense',
                'date' => $today->copy()->startOfMonth()->toDateString(),
            ],
            [
                'category' => $categories['Alimentação'],
                'description' => 'Supermercado',
                'amount' => '320.50',
                'type' => 'expense',
                'date' => $today->copy()->subDay()->toDateString(),
            ],
            [
                'category' => $categories['Transporte'],
                'description' => 'Transporte público',
                'amount' => '85.00',
                'type' => 'expense',
                'date' => $today->toDateString(),
            ],
        ];

        foreach ($sampleTransactions as $sampleTransaction) {
            $user->transactions()->firstOrCreate(
                [
                    'description' => $sampleTransaction['description'],
                    'date' => $sampleTransaction['date'],
                ],
                [
                    'category_id' => $sampleTransaction['category']->id,
                    'amount' => $sampleTransaction['amount'],
                    'type' => $sampleTransaction['type'],
                ],
            );
        }

        foreach (range(1, 5) as $monthsAgo) {
            $sampleMonth = $today->copy()->startOfMonth()->subMonths($monthsAgo);
            $monthKey = $sampleMonth->format('Y-m');

            $user->transactions()->firstOrCreate(
                [
                    'description' => 'Salário mensal - '.$monthKey,
                    'date' => $sampleMonth->copy()->addDays(4)->toDateString(),
                ],
                [
                    'category_id' => $categories['Salário']->id,
                    'amount' => '4500.00',
                    'type' => 'income',
                ],
            );

            $user->transactions()->firstOrCreate(
                [
                    'description' => 'Despesas de alimentação - '.$monthKey,
                    'date' => $sampleMonth->copy()->addDays(14)->toDateString(),
                ],
                [
                    'category_id' => $categories['Alimentação']->id,
                    'amount' => '320.50',
                    'type' => 'expense',
                ],
            );
        }
    }
}
