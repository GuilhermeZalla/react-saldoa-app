<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('registration validation messages are shown in Portuguese', function () {
    $this->post(route('register.store'), [
        'name' => '',
        'email' => 'email-invalido',
        'password' => 'senha-segura',
        'password_confirmation' => 'senha-diferente',
    ])->assertSessionHasErrors(['name', 'email', 'password']);

    $errors = session('errors')->getBag('default');

    expect($errors->first('name'))->toBe('O campo nome é obrigatório.')
        ->and($errors->first('email'))->toBe('Informe um endereço de e-mail válido.')
        ->and($errors->first('password'))->toBe('A confirmação de senha não confere.');
});

test('registration is rate limited by email and ip', function () {
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'limited-registration@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect();

        if ($this->isAuthenticated()) {
            $this->post(route('logout'));
        }
    }

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'limited-registration@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(429);
});

test('registration is rate limited by ip across different email addresses', function () {
    for ($attempt = 0; $attempt < 20; $attempt++) {
        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => "ip-limit-{$attempt}@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect();

        if ($this->isAuthenticated()) {
            $this->post(route('logout'));
        }
    }

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'another-ip-limit@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(429);
});

test('registration rate limit treats email casing variations as the same address', function () {
    foreach ([
        'CaseLimit@example.com',
        'caselimit@example.com',
        'CASELIMIT@example.com',
        'CaseLimit@EXAMPLE.COM',
        'caselimit@EXAMPLE.com',
    ] as $email) {
        $this->post(route('register.store'), [
            'email' => $email,
        ])->assertSessionHasErrors(['name', 'password']);
    }

    $this->post(route('register.store'), [
        'email' => 'CASELIMIT@EXAMPLE.COM',
    ])->assertStatus(429);
});

test('short passwords show a minimum length message instead of a translation key', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'short-password@example.com',
        'password' => '123',
        'password_confirmation' => '123',
    ])->assertSessionHasErrors(['password' => 'O campo senha deve ter pelo menos 8 caracteres.']);
});
