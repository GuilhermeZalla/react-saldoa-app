<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Password Reset Email
$resetMail = new App\Mail\PasswordResetLink(
    'Guilherme Zalla',
    'guilherme@example.com',
    'https://saldoa-app.duckdns.org/reset-password/exemplo-token?email=guilherme%40example.com',
    'exemplo-token'
);
$resetHtml = $resetMail->render();
file_put_contents(__DIR__ . '/../docs/email-preview-password-reset.html', $resetHtml);

// 2. Account Deletion Email
$deletionMail = new App\Mail\AccountDeletionConfirmation(
    'Guilherme Zalla',
    'guilherme@example.com',
    'https://saldoa-app.duckdns.org/account-deletion/confirm/exemplo-token-exclusao'
);
$deletionHtml = $deletionMail->render();
file_put_contents(__DIR__ . '/../docs/email-preview-account-deletion.html', $deletionHtml);

echo "Email previews generated:\n";
echo "- docs/email-preview-password-reset.html (" . strlen($resetHtml) . " bytes)\n";
echo "- docs/email-preview-account-deletion.html (" . strlen($deletionHtml) . " bytes)\n";
