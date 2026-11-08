<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountDeletionConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $confirmationUrl,
    ) {
        $this->subject = 'Confirme a exclusão da sua conta Saldoa';
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build(): self
    {
        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($this->subject)
            ->view('emails.account-deletion')
            ->with([
                'name' => $this->name,
                'email' => $this->email,
                'confirmationUrl' => $this->confirmationUrl,
                'subject' => $this->subject,
            ]);
    }
}
