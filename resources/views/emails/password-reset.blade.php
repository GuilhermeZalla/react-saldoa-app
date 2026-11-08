@component('emails.layout', ['subject' => $subject])

    <h1>Redefinição de senha</h1>

    <p>Olá, {{ $name }}!</p>

    <p>Você solicitou a redefinição da senha da sua conta Saldoa. Clique no botão abaixo para criar uma nova senha:</p>

    <a href="{{ $resetUrl }}" class="button">Redefinir minha senha</a>

    <div class="notice">
        <p>Este link expira em 60 minutos. Se você não solicitou esta redefinição, ignore este e-mail e sua senha permanecerá inalterada.</p>
    </div>

@endcomponent