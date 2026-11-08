<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetLink extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $resetUrl,
        public string $token = '',
    ) {
        $this->subject = 'Redefinição de senha — Saldoa';
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
            ->view('emails.password-reset')
            ->with([
                'name' => $this->name,
                'email' => $this->email,
                'resetUrl' => $this->resetUrl,
                'subject' => $this->subject,
            ]);
    }
}
