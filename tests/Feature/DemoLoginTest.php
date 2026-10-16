<?php

use App\Models\User;

test('demo login works when enabled and user exists', function () {
    config()->set('demo.enabled', true);
    
    $demoUser = User::factory()->create([
        'email' => config('demo.email'),
    ]);

    $this->post(route('demo.login'))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($demoUser);
});

test('demo login returns 404 when disabled', function () {
    config()->set('demo.enabled', false);

    User::factory()->create([
        'email' => config('demo.email'),
    ]);

    $this->post(route('demo.login'))
        ->assertNotFound();
});

test('demo login returns 404 when demo user does not exist', function () {
    config()->set('demo.enabled', true);

    // Não cria o usuário demo

    $this->post(route('demo.login'))
        ->assertNotFound();
});

test('demo login respects throttle', function () {
    config()->set('demo.enabled', true);
    
    User::factory()->create([
        'email' => config('demo.email'),
    ]);

    // Primeiras 5 requisições devem funcionar
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('demo.login'))->assertRedirect();
        $this->post(route('logout'));
    }

    // 6ª deve falhar por throttle
    $this->post(route('demo.login'))
        ->assertStatus(429);
});

test('login page shows demo button when enabled', function () {
    config()->set('demo.enabled', true);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->where('demoLoginEnabled', true));
});

test('login page hides demo button when disabled', function () {
    config()->set('demo.enabled', false);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->where('demoLoginEnabled', false));
});
