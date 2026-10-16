<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $transactionType = fake()->randomElement(['income', 'expense']);

        return [
            'user_id' => User::factory(),
            'category_id' => function (array $attributes) use ($transactionType): CategoryFactory {
                $user = User::query()->findOrFail($attributes['user_id']);

                return Category::factory()
                    ->for($user)
                    ->state(['type' => $transactionType]);
            },
            'description' => fake()->sentence(3),
            'amount' => fake()->randomFloat(2, 1, 5000),
            'type' => $transactionType,
            'date' => fake()->date(),
        ];
    }
}
