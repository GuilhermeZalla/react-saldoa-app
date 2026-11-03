<?php

namespace App\Http\Controllers\Api;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\IssueApiToken;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DemoLoginRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(
        RegisterRequest $request,
        CreateNewUser $createNewUser,
        IssueApiToken $issueApiToken,
    ): JsonResponse {
        $result = DB::transaction(function () use ($request, $createNewUser, $issueApiToken): array {
            $user = $createNewUser->createValidated([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->toString(),
                'password' => $request->string('password')->toString(),
            ]);

            return [
                'user' => $user,
                'token' => $issueApiToken->execute($user, $request->string('device_name')->toString()),
            ];
        });

        return $this->tokenResponse($request, $result['user'], $result['token'], 201);
    }

    public function login(LoginRequest $request, IssueApiToken $issueApiToken): JsonResponse
    {
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$request->string('email')->toString()])
            ->first();

        if ($user === null || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw new AuthenticationException;
        }

        $token = $issueApiToken->execute($user, $request->string('device_name')->toString());

        return $this->tokenResponse($request, $user, $token, 200);
    }

    public function demo(DemoLoginRequest $request, IssueApiToken $issueApiToken): JsonResponse
    {
        abort_unless(config('demo.instance') && config('demo.enabled'), 404);

        $user = User::query()
            ->where('email', config('demo.email'))
            ->firstOrFail();
        $token = $issueApiToken->execute($user, $request->string('device_name')->toString());

        return $this->tokenResponse($request, $user, $token, 200);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $accessToken = $request->user()->currentAccessToken();
        $accessToken->delete();

        return response()->json(['message' => 'Sessão encerrada.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Todas as sessões foram encerradas.']);
    }

    public function refresh(Request $request, IssueApiToken $issueApiToken): JsonResponse
    {
        $user = $request->user();
        $accessToken = $user->currentAccessToken();

        $token = DB::transaction(function () use ($accessToken, $issueApiToken, $user): array {
            $deviceName = $accessToken->name;
            $accessToken->delete();

            return $issueApiToken->execute($user, $deviceName);
        });

        return response()->json($token);
    }

    /**
     * @param  array{access_token: string, token_type: 'Bearer', expires_at: string}  $token
     */
    private function tokenResponse(
        Request $request,
        User $user,
        array $token,
        int $status,
    ): JsonResponse {
        return response()->json([
            'user' => (new UserResource($user))->resolve($request),
            ...$token,
        ], $status);
    }
}
