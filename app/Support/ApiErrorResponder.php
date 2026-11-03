<?php

namespace App\Support;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ApiErrorResponder
{
    /**
     * Render expected API errors consistently without changing web responses.
     */
    public function render(Throwable $exception, Request $request): ?JsonResponse
    {
        if (! $request->is('api/*')) {
            return null;
        }

        if ($exception instanceof ValidationException) {
            return $this->response(
                'validation_error',
                $exception->getMessage(),
                422,
                $exception->errors(),
            );
        }

        if ($exception instanceof AuthenticationException) {
            return $this->response('unauthenticated', 'Unauthenticated.', 401);
        }

        if ($exception instanceof AuthorizationException) {
            return $this->response('forbidden', 'Forbidden.', 403);
        }

        if ($exception instanceof ModelNotFoundException) {
            return $this->response('not_found', 'Resource not found.', 404);
        }

        if ($exception instanceof HttpExceptionInterface) {
            $status = $exception->getStatusCode();
            $code = match ($status) {
                401 => 'unauthenticated',
                403 => 'forbidden',
                404 => 'not_found',
                429 => 'rate_limited',
                default => 'http_error',
            };
            $message = match ($status) {
                401 => 'Unauthenticated.',
                403 => 'Forbidden.',
                404 => 'Resource not found.',
                429 => 'Too many requests.',
                default => $status >= 500 ? 'Server error.' : $exception->getMessage(),
            };

            return $this->response($code, $message, $status, null, $exception->getHeaders());
        }

        return null;
    }

    /**
     * @param  array<string, array<int, string>>|null  $details
     * @param  array<string, string>  $headers
     */
    private function response(
        string $code,
        string $message,
        int $status,
        ?array $details = null,
        array $headers = [],
    ): JsonResponse {
        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
            ],
        ], $status, $headers);
    }
}
