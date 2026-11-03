<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeletionRequested extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
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

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirme a exclusão da sua conta Saldoa')
            ->greeting('Olá!')
            ->line('Recebemos uma solicitação para excluir sua conta e os dados financeiros associados.')
            ->line('A solicitação expira em uma hora. Se você não fez este pedido, ignore esta mensagem.')
            ->action('Confirmar exclusão da conta', $this->confirmationUrl);
    }
}
