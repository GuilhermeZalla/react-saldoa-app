<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Carbon;

class IssueApiToken
{
    /**
     * Issue an expiring bearer token, restricting demo accounts to read-only access.
     *
     * @return array{access_token: string, token_type: 'Bearer', expires_at: string}
     */
    public function execute(User $user, string $deviceName): array
    {
        $isDemoAccount = config('demo.instance')
            && $user->email === config('demo.email');
        $expirationMinutes = $isDemoAccount
            ? (int) config('demo.token_expiration')
            : min(14400, (int) config('sanctum.expiration'));
        $expiresAt = Carbon::now()->addMinutes($expirationMinutes);
        $abilities = $isDemoAccount ? ['demo:read'] : ['*'];

        $issuedToken = $user->createToken($deviceName, $abilities, $expiresAt);

        return [
            'access_token' => $issuedToken->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toISOString(),
        ];
    }
}
