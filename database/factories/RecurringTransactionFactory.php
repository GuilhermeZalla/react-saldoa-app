<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $startDate = fake()->dateTimeBetween('today', '+1 year')->format('Y-m-d');

        return [
            'user_id' => User::factory(),
            'category_id' => function (array $attributes) use ($type): CategoryFactory {
                $user = User::query()->findOrFail($attributes['user_id']);

                return Category::factory()
                    ->for($user)
                    ->state(['type' => $type]);
            },
            'description' => fake()->sentence(3),
            'amount' => fake()->randomFloat(2, 1, 5000),
            'type' => $type,
            'frequency' => fake()->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'start_date' => $startDate,
            'end_date' => null,
            'next_occurrence_date' => $startDate,
        ];
    }
}
