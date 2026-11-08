@component('emails.layout', ['subject' => $subject])

    <h1>Confirme a exclusão da sua conta</h1>

    <p>Olá, {{ $name }}!</p>

    <p>Recebemos uma solicitação para excluir sua conta Saldoa e todos os dados financeiros associados.</p>

    <a href="{{ $confirmationUrl }}" class="button button--destructive">Confirmar exclusão da conta</a>

    <div class="notice notice--warning">
        <p>Esta solicitação expira em uma hora. Se você não fez este pedido, ignore esta mensagem e sua conta permanecerá intacta.</p>
    </div>

@endcomponent