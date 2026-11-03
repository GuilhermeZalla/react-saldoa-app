<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureApiRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    private function configureApiRateLimiting(): void
    {
        RateLimiter::for('api-login', fn (Request $request): Limit => $this->emailIpLimit($request, 'login'));
        RateLimiter::for('api-register', fn (Request $request): array => [
            $this->emailIpLimit($request, 'register'),
            Limit::perMinute(20)->by('api-register:ip:'.$request->ip()),
        ]);
        RateLimiter::for('api-refresh', fn (Request $request): Limit => $this->emailIpLimit(
            $request,
            'refresh',
            $request->user()?->email,
        ));
        RateLimiter::for('api-demo', fn (Request $request): Limit => Limit::perMinute(5)
            ->by('api-demo:'.$request->ip()));
        RateLimiter::for('account-deletion', fn (Request $request): Limit => $this->emailIpLimit(
            $request,
            'account-deletion',
        )->perHour(3));
        RateLimiter::for('account-deletion-confirm', fn (Request $request): Limit => Limit::perMinute(10)
            ->by('account-deletion-confirm:'.$request->ip()));
    }

    private function emailIpLimit(Request $request, string $scope, ?string $email = null): Limit
    {
        $normalizedEmail = Str::lower(trim((string) ($email ?? $request->input('email'))));
        $key = hash('sha256', $scope.'|'.$normalizedEmail.'|'.$request->ip());

        return Limit::perMinute(5)->by($key);
    }
}
