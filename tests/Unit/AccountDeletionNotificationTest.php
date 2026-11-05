<?php

use App\Notifications\AccountDeletionRequested;
use Illuminate\Contracts\Queue\ShouldQueue;

test('account deletion emails are queued instead of blocking the public request', function () {
    $notification = new AccountDeletionRequested('https://saldoa.example/account-deletion/confirm/test-token');

    expect($notification)->toBeInstanceOf(ShouldQueue::class)
        ->and($notification->via(new stdClass))->toBe(['mail']);
});
