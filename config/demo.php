<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo Login
    |--------------------------------------------------------------------------
    |
    | When enabled, users can log in to a demonstration account with one click
    | from the login page without entering credentials.
    |
    */

    'enabled' => env('DEMO_LOGIN_ENABLED', false),

    'instance' => env('DEMO_INSTANCE', false),

    'email' => env('DEMO_USER_EMAIL', 'demo@exemplo.com'),

    'token_expiration' => (int) env('DEMO_TOKEN_EXPIRATION', 60),

];
