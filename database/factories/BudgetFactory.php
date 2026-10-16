<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => function (array $attributes): CategoryFactory {
                $user = User::query()->findOrFail($attributes['user_id']);

                return Category::factory()
                    ->for($user)
                    ->expense();
            },
            'amount' => fake()->randomFloat(2, 100, 5000),
        ];
    }
}
