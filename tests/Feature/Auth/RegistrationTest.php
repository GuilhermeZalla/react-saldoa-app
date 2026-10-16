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
