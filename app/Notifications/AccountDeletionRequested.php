<?php

namespace App\Notifications;

use App\Mail\AccountDeletionConfirmation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AccountDeletionRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $confirmationUrl) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): AccountDeletionConfirmation
    {
        return new AccountDeletionConfirmation(
            name: $notifiable->name ?? '',
            email: $notifiable->email ?? '',
            confirmationUrl: $this->confirmationUrl,
        );
    }
}
