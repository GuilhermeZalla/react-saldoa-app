<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests must sign in to open contextual help', function () {
    $this->get(route('help'))->assertRedirect(route('login'));
});

test('authenticated users can open contextual help', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('help'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('help'));
});

test('privacy policy is publicly available in Portuguese by default', function () {
    $this->get(route('privacy-policy'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('privacy-policy')
            ->where('language', 'pt-BR'));
});

test('privacy policy supports the English language', function () {
    $this->get(route('privacy-policy', ['lang' => 'en']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('privacy-policy')
            ->where('language', 'en'));
});

test('the complementary PDF guide is accessible without a browser session', function () {
    $response = $this->get(route('guide'))
        ->assertOk()
        ->assertDownload('guia-de-uso-saldoa.pdf')
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('Content-Language', 'pt-BR');

    expect($response->baseResponse->getFile()->getFilename())->toBe('guia-de-uso-saldoa.pdf');
});

test('the PDF guide follows the requested language with Portuguese as fallback', function (string|array $language, string $filename, string $contentLanguage) {
    $response = $this->get(route('guide', ['lang' => $language]))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('Content-Language', $contentLanguage);

    $response->assertDownload($filename);
    expect($response->baseResponse->getFile()->getFilename())->toBe($filename);
})->with([
    'Portuguese' => ['pt-BR', 'guia-de-uso-saldoa.pdf', 'pt-BR'],
    'English' => ['en', 'use-guide-saldoa-en.pdf', 'en'],
    'unsupported language' => ['es', 'guia-de-uso-saldoa.pdf', 'pt-BR'],
    'file path instead of language' => ['../../.env', 'guia-de-uso-saldoa.pdf', 'pt-BR'],
    'array instead of language' => [['en'], 'guia-de-uso-saldoa.pdf', 'pt-BR'],
]);

test('desktop guides download in the requested language without a browser session', function (string $language, string $filename, string $contentLanguage) {
    $this->get(route('guide', ['platform' => 'desktop', 'lang' => $language]))
        ->assertOk()
        ->assertDownload($filename)
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('Content-Language', $contentLanguage);
})->with([
    'Portuguese desktop' => ['pt-BR', 'guia-de-uso-saldoa-desktop.pdf', 'pt-BR'],
    'English desktop' => ['en', 'use-guide-saldoa-desktop-en.pdf', 'en'],
    'unsupported desktop language' => ['es', 'guia-de-uso-saldoa-desktop.pdf', 'pt-BR'],
]);

test('unsupported guide platforms fall back to the mobile guide', function (string|array $platform) {
    $this->get(route('guide', ['platform' => $platform]))
        ->assertOk()
        ->assertDownload('guia-de-uso-saldoa.pdf');
})->with([
    'unknown platform' => ['watch'],
    'path instead of platform' => ['../../.env'],
    'array instead of platform' => [['desktop']],
]);
