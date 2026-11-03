<?php

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

test('a user can register for the mobile API and receives a bearer token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Mobile User',
        'email' => ' MOBILE@EXAMPLE.COM ',
        'password' => 'password',
        'password_confirmation' => 'password',
        'device_name' => 'Android phone',
    ]);

    $response->assertCreated()
        ->assertJsonPath('user.email', 'mobile@example.com')
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('expires_at', fn (string $expiresAt): bool => $expiresAt !== '');

    expect(User::query()->where('email', 'mobile@example.com')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'mobile@example.com')->firstOrFail()->tokens()->count())->toBe(1);
});

test('a user can log in and invalid credentials receive a standardized 401', function () {
    $user = User::factory()->create([
        'email' => 'Mobile@Example.com',
        'password' => 'correct-password',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email' => ' MOBILE@EXAMPLE.COM ',
        'password' => 'correct-password',
        'device_name' => 'Android phone',
    ])->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('token_type', 'Bearer');

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
        'device_name' => 'Android phone',
    ])->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');
});

test('API authentication rejects expired and revoked tokens', function () {
    $user = User::factory()->create();
    $expiredToken = $user->createToken('expired', ['*'], now()->subMinute())->plainTextToken;
    $revokedToken = $user->createToken('revoked')->plainTextToken;
    $user->tokens()->where('name', 'revoked')->delete();

    $this->withToken($expiredToken)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');

    $this->withToken($revokedToken)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');
});

test('refresh rotates the current token and logout-all revokes every token', function () {
    $user = User::factory()->create();
    $oldToken = $user->createToken('Android phone')->plainTextToken;

    $response = $this->withToken($oldToken)
        ->postJson('/api/v1/auth/refresh')
        ->assertOk()
        ->assertJsonPath('token_type', 'Bearer');
    $newToken = $response->json('access_token');

    expect($newToken)->toBeString()
        ->and($newToken)->not->toBe($oldToken)
        ->and($user->tokens()->count())->toBe(1);

    Auth::forgetGuards();
    $this->withToken($oldToken)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized();

    $user->createToken('Tablet');
    $this->withToken($newToken)
        ->postJson('/api/v1/auth/logout-all')
        ->assertOk();

    expect($user->tokens()->count())->toBe(0);
});

test('logout revokes only the current token', function () {
    $user = User::factory()->create();
    $currentToken = $user->createToken('Android phone')->plainTextToken;
    $otherToken = $user->createToken('Tablet')->plainTextToken;

    $this->withToken($currentToken)
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    expect($user->tokens()->count())->toBe(1)
        ->and($user->tokens()->firstOrFail()->name)->toBe('Tablet');

    Auth::forgetGuards();
    $this->withToken($otherToken)
        ->getJson('/api/v1/auth/me')
        ->assertOk();

    Auth::forgetGuards();
    $this->withToken($currentToken)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized();
});

test('API login is rate limited by normalized email and IP', function () {
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'Limit@Example.com',
            'password' => 'wrong-password',
            'device_name' => 'Android phone',
        ])->assertUnauthorized();
    }

    $this->postJson('/api/v1/auth/login', [
        'email' => ' limit@example.com ',
        'password' => 'wrong-password',
        'device_name' => 'Android phone',
    ])->assertTooManyRequests()
        ->assertJsonPath('error.code', 'rate_limited');
});

test('API registration has email and IP rate limits', function () {
    for ($attempt = 0; $attempt < 20; $attempt++) {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Mobile User',
            'email' => "mobile-{$attempt}@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
            'device_name' => 'Android phone',
        ])->assertCreated();
    }

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Another Mobile User',
        'email' => 'another-mobile@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'device_name' => 'Android phone',
    ])->assertTooManyRequests()
        ->assertJsonPath('error.code', 'rate_limited');
});

test('API registration rate limit treats casing variations of one email as the same address', function () {
    $emails = [
        'CaseLimit@example.com',
        'caselimit@example.com',
        'CASELIMIT@example.com',
        'CaseLimit@EXAMPLE.COM',
        'caselimit@EXAMPLE.com',
    ];

    foreach ($emails as $index => $email) {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Mobile User',
            'email' => $email,
            'password' => 'password',
            'password_confirmation' => 'password',
            'device_name' => 'Android phone',
        ]);

        if ($index === 0) {
            $response->assertCreated();
        } else {
            $response->assertUnprocessable();
        }
    }

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Mobile User',
        'email' => ' CASELIMIT@EXAMPLE.COM ',
        'password' => 'password',
        'password_confirmation' => 'password',
        'device_name' => 'Android phone',
    ])->assertTooManyRequests();
});

test('API refresh is rate limited while allowing token rotation until the limit', function () {
    $user = User::factory()->create();
    $token = $user->createToken('Android phone')->plainTextToken;

    for ($attempt = 0; $attempt < 5; $attempt++) {
        Auth::forgetGuards();
        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/refresh')
            ->assertOk();
        $token = $response->json('access_token');
    }

    Auth::forgetGuards();
    $this->withToken($token)
        ->postJson('/api/v1/auth/refresh')
        ->assertTooManyRequests()
        ->assertJsonPath('error.code', 'rate_limited');
});

test('demo API token is short-lived and cannot mutate data', function () {
    config()->set('demo.instance', true);
    config()->set('demo.enabled', true);
    $demoUser = User::factory()->create(['email' => config('demo.email')]);

    $response = $this->postJson('/api/v1/auth/demo', [
        'device_name' => 'Play Store demo',
    ])->assertOk();
    $token = $response->json('access_token');
    $expiresAt = Carbon::parse($response->json('expires_at'));

    expect($expiresAt->isBefore(now()->addMinutes(61)))->toBeTrue();

    $this->withToken($token)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $demoUser->id);

    $this->withToken($token)
        ->postJson('/api/v1/categories', [
            'name' => 'Forbidden',
            'type' => 'expense',
        ])->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');

    expect($demoUser->tokens()->firstOrFail()->abilities)->toBe(['demo:read'])
        ->and($demoUser->categories()->exists())->toBeFalse();
});

test('demo instance disables mobile registration', function () {
    config()->set('demo.instance', true);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Not allowed',
        'email' => 'not-allowed@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'device_name' => 'Android phone',
    ])->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');

    expect(User::query()->where('email', 'not-allowed@example.com')->exists())->toBeFalse();
});

test('web authentication remains available alongside API token authentication', function () {
    $user = User::factory()->create([
        'email' => 'web@example.com',
        'password' => 'correct-password',
    ]);

    $this->get('/login')->assertOk();
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'correct-password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($user);
});
