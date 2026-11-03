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

test('demo login is unavailable in production even when enabled', function () {
    config()->set('demo.enabled', true);
    config()->set('demo.instance', false);
    $this->app['env'] = 'production';

    User::factory()->create([
        'email' => config('demo.email'),
    ]);

    $csrfToken = 'demo-production-test-token';

    $this->withSession(['_token' => $csrfToken])
        ->withHeader('X-CSRF-TOKEN', $csrfToken)
        ->post(route('demo.login'))
        ->assertNotFound();

    $this->assertGuest();
});

test('demo login is available in production on an explicitly isolated demo instance', function () {
    config()->set('demo.enabled', true);
    config()->set('demo.instance', true);
    $this->app['env'] = 'production';

    $demoUser = User::factory()->create([
        'email' => config('demo.email'),
    ]);
    $csrfToken = 'isolated-demo-login-test-token';

    $this->withSession(['_token' => $csrfToken])
        ->withHeader('X-CSRF-TOKEN', $csrfToken)
        ->post(route('demo.login'))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($demoUser);
});

test('authenticated user is redirected when trying demo login', function () {
    config()->set('demo.enabled', true);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('demo.login'))
        ->assertRedirect();

    $this->assertAuthenticatedAs($user);
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

test('demo instance accounts can read web pages but cannot mutate financial data', function () {
    config()->set('demo.enabled', false);
    config()->set('demo.instance', true);

    $demoUser = User::factory()->create([
        'email' => config('demo.email'),
    ]);

    $this->actingAs($demoUser)
        ->get(route('categories.index'))
        ->assertOk();

    $this->post(route('categories.store'), [
        'name' => 'Nova categoria',
        'type' => 'expense',
    ])->assertForbidden();

    expect($demoUser->categories()->exists())->toBeFalse();
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
