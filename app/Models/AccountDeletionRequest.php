<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $email
 * @property string $token_hash
 * @property Carbon $expires_at
 */
#[Fillable(['email', 'token_hash', 'expires_at'])]
class AccountDeletionRequest extends Model
{
    /**
     * Get the model's attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }
}
