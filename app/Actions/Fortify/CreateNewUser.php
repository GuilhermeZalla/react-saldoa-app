<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        abort_if(config('demo.instance'), 404);

        $validated = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return $this->createValidated($validated);
    }

    /**
     * Create a user from data validated by a Form Request.
     *
     * @param  array<string, mixed>  $input
     */
    public function createValidated(array $input): User
    {
        if (
            ! isset($input['name'], $input['email'], $input['password'])
            || ! is_string($input['name'])
            || ! is_string($input['email'])
            || ! is_string($input['password'])
        ) {
            throw new InvalidArgumentException('Validated registration data is incomplete.');
        }

        return User::create([
            'name' => $input['name'],
            'email' => Str::lower(trim($input['email'])),
            'password' => $input['password'],
        ]);
    }
}
