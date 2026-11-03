<?php

namespace App\Http\Controllers;

use App\Actions\DeleteUserAccount;
use App\Http\Requests\ConfirmAccountDeletionRequest;
use App\Http\Requests\RequestAccountDeletionRequest;
use App\Models\AccountDeletionRequest;
use App\Models\User;
use App\Notifications\AccountDeletionRequested;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicAccountDeletionController extends Controller
{
    public function create(): Response
    {
        abort_if(config('demo.instance'), 404);

        return Inertia::render('account-deletion/request');
    }

    public function store(RequestAccountDeletionRequest $request): RedirectResponse
    {
        abort_if(config('demo.instance'), 404);

        $email = $request->string('email')->toString();
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user !== null) {
            $token = Str::random(64);
            $accountEmail = $user->email;

            DB::transaction(function () use ($accountEmail, $email, $token): void {
                AccountDeletionRequest::query()
                    ->whereRaw('LOWER(email) = ?', [$email])
                    ->delete();
                AccountDeletionRequest::query()->create([
                    'email' => $accountEmail,
                    'token_hash' => hash('sha256', $token),
                    'expires_at' => now()->addHour(),
                ]);
            });

            Notification::route('mail', $accountEmail)->notify(
                new AccountDeletionRequested(route('account-deletion.confirm', ['token' => $token])),
            );
        }

        return to_route('account-deletion.requested');
    }

    public function requested(): Response
    {
        abort_if(config('demo.instance'), 404);

        return Inertia::render('account-deletion/requested');
    }

    public function confirm(string $token): Response
    {
        abort_if(config('demo.instance'), 404);
        abort_unless($this->findValidRequest($token) !== null, 404);

        return Inertia::render('account-deletion/confirm', ['token' => $token]);
    }

    public function destroy(
        ConfirmAccountDeletionRequest $request,
        DeleteUserAccount $deleteUserAccount,
    ): RedirectResponse {
        abort_if(config('demo.instance'), 404);

        $token = $request->string('token')->toString();
        $authenticatedUserId = Auth::id();
        $userId = DB::transaction(function () use ($token, $deleteUserAccount): ?int {
            $deletionRequest = $this->findValidRequest($token, lockForUpdate: true);
            abort_unless($deletionRequest instanceof AccountDeletionRequest, 404);

            $user = User::query()
                ->whereRaw('LOWER(email) = LOWER(?)', [$deletionRequest->email])
                ->lockForUpdate()
                ->first();

            if ($user === null) {
                $deletionRequest->delete();

                return null;
            }

            $userId = $user->id;

            if (Auth::id() === $userId) {
                Auth::logout();
            }

            $deleteUserAccount->execute($user);

            return $userId;
        });

        if ($userId !== null && $userId === $authenticatedUserId && $request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return to_route('account-deletion.complete');
    }

    public function complete(): Response
    {
        abort_if(config('demo.instance'), 404);

        return Inertia::render('account-deletion/complete');
    }

    private function findValidRequest(string $token, bool $lockForUpdate = false): ?AccountDeletionRequest
    {
        $query = AccountDeletionRequest::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('expires_at', '>', now());

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        return $query->first();
    }
}
