<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class DemoAuthController extends Controller
{
    /**
     * Log in to the demonstration account.
     */
    public function login(): RedirectResponse
    {
        abort_unless(config('demo.enabled'), 404);

        $demoUser = User::query()
            ->where('email', config('demo.email'))
            ->first();

        abort_if($demoUser === null, 404);

        Auth::login($demoUser);

        session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
