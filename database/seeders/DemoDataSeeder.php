<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed an idempotent demonstration account with three months of data.
     */
    public function run(): void
    {
        $today = now();
        $demoUser = User::query()->updateOrCreate(
            ['email' => 'demo@exemplo.com'],
            [
                'name' => 'Usuário de Demonstração',
                'password' => 'demo1234',
            ],
        );

        if ($demoUser->email_verified_at === null) {
            $demoUser->forceFill(['email_verified_at' => $today])->save();
        }

        /** @var array<string, 'income'|'expense'> $categoryDefinitions */
        $categoryDefinitions = [
            'Salário' => 'income',
            'Freelance' => 'income',
            'Moradia' => 'expense',
            'Serviços' => 'expense',
            'Alimentação' => 'expense',
            'Transporte' => 'expense',
            'Saúde' => 'expense',
            'Lazer' => 'expense',
        ];

        /** @var array<string, Category> $categories */
        $categories = [];

        foreach ($categoryDefinitions as $name => $type) {
            $categories[$name] = $demoUser->categories()->updateOrCreate(
                ['name' => $name],
                ['type' => $type],
            );
        }

        /** @var array<int, array<string, string>> $monthlyAmounts */
        $monthlyAmounts = [
            [
                'salary' => '6200.00',
                'freelance' => '780.00',
                'rent' => '1850.00',
                'energy' => '174.80',
                'groceries' => '625.40',
                'transport' => '189.00',
                'internet' => '109.90',
                'health' => '83.50',
                'leisure' => '198.00',
                'phone' => '59.90',
            ],
            [
                'salary' => '6200.00',
                'freelance' => '520.00',
                'rent' => '1850.00',
                'energy' => '203.15',
                'groceries' => '578.30',
                'transport' => '210.00',
                'internet' => '109.90',
                'health' => '46.70',
                'leisure' => '245.00',
                'phone' => '59.90',
            ],
            [
                'salary' => '6200.00',
                'freelance' => '940.00',
                'rent' => '1850.00',
                'energy' => '188.60',
                'groceries' => '642.75',
                'transport' => '176.00',
                'internet' => '109.90',
                'health' => '112.40',
                'leisure' => '165.00',
                'phone' => '59.90',
            ],
        ];

        /**
         * @var array<int, array{
         *     category: string,
         *     description: string,
         *     amount: string,
         *     type: 'income'|'expense',
         *     day: int
         * }> $transactionTemplates
         */
        $transactionTemplates = [
            ['category' => 'Salário', 'description' => 'Salário mensal', 'amount' => 'salary', 'type' => 'income', 'day' => 1],
            ['category' => 'Freelance', 'description' => 'Projeto freelance', 'amount' => 'freelance', 'type' => 'income', 'day' => 6],
            ['category' => 'Moradia', 'description' => 'Aluguel', 'amount' => 'rent', 'type' => 'expense', 'day' => 2],
            ['category' => 'Serviços', 'description' => 'Conta de energia', 'amount' => 'energy', 'type' => 'expense', 'day' => 5],
            ['category' => 'Alimentação', 'description' => 'Supermercado', 'amount' => 'groceries', 'type' => 'expense', 'day' => 8],
            ['category' => 'Transporte', 'description' => 'Transporte público', 'amount' => 'transport', 'type' => 'expense', 'day' => 10],
            ['category' => 'Serviços', 'description' => 'Internet residencial', 'amount' => 'internet', 'type' => 'expense', 'day' => 9],
            ['category' => 'Saúde', 'description' => 'Farmácia', 'amount' => 'health', 'type' => 'expense', 'day' => 12],
            ['category' => 'Lazer', 'description' => 'Cinema e lazer', 'amount' => 'leisure', 'type' => 'expense', 'day' => 14],
            ['category' => 'Serviços', 'description' => 'Plano de celular', 'amount' => 'phone', 'type' => 'expense', 'day' => 4],
        ];

        $currentMonth = $today->copy()->startOfMonth();

        foreach ([2, 1, 0] as $monthIndex => $monthsAgo) {
            $sampleMonth = $currentMonth->copy()->subMonths($monthsAgo);

            foreach ($transactionTemplates as $transactionTemplate) {
                $transactionDate = $sampleMonth->copy()->day($transactionTemplate['day']);

                if ($transactionDate->greaterThan($today)) {
                    $transactionDate = $today;
                }

                $transactionAttributes = [
                    'category_id' => $categories[$transactionTemplate['category']]->id,
                    'description' => $transactionTemplate['description'],
                    'amount' => $monthlyAmounts[$monthIndex][$transactionTemplate['amount']],
                    'type' => $transactionTemplate['type'],
                    'date' => $transactionDate->toDateString(),
                ];

                $existingTransaction = $demoUser->transactions()
                    ->where('description', $transactionTemplate['description'])
                    ->whereBetween('date', [
                        $sampleMonth->toDateString(),
                        $sampleMonth->copy()->endOfMonth()->toDateString(),
                    ])
                    ->first();

                if ($existingTransaction instanceof Transaction) {
                    $existingTransaction->update($transactionAttributes);
                } else {
                    $demoUser->transactions()->create($transactionAttributes);
                }
            }
        }
    }
}
