<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventDemoInstanceWrites
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $isDemoUser = config('demo.instance') && $user?->email === config('demo.email');

        if ($isDemoUser) {
            if ($request->is('api/*')) {
                abort_unless($user->tokenCan('demo:read'), 403);
            }

            abort_if(! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true), 403);
        }

        return $next($request);
    }
}
