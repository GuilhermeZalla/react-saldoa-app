<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockDemoUserChanges
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(
            (config('demo.enabled') || config('demo.instance'))
                && $request->user()?->email === config('demo.email'),
            403,
        );

        return $next($request);
    }
}
