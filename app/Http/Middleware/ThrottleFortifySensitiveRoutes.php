<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Symfony\Component\HttpFoundation\Response;

class ThrottleFortifySensitiveRoutes
{
    public function __construct(private ThrottleRequests $throttleRequests) {}

    /**
     * Apply route-specific Fortify limiters without changing its web handlers.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $limiter = match ($request->route()?->getName()) {
            'register.store' => 'register',
            'password.email' => 'password-email',
            'password.update' => 'password-update',
            default => null,
        };

        if ($limiter === null) {
            return $next($request);
        }

        return $this->throttleRequests->handle($request, $next, $limiter);
    }
}
