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

    'email' => env('DEMO_USER_EMAIL', 'demo@exemplo.com'),

];
