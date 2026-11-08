<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? 'Saldoa' }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap');

        body {
            margin: 0;
            padding: 0;
            background-color: #f4f5f7;
            font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
            color: #171a1f;
            line-height: 1.6;
        }

        .wrapper {
            width: 100%;
            padding: 32px 16px;
            background-color: #f4f5f7;
        }

        .card {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #d9dee5;
            overflow: hidden;
        }

        .header {
            padding: 32px 32px 24px;
            background-color: #ffffff;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .logo-mark {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #c85f00, #d46a00);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            font-weight: 600;
            font-size: 16px;
        }

        .app-name {
            font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            font-weight: 600;
            font-size: 20px;
            color: #171a1f;
            letter-spacing: -0.4px;
        }

        .content {
            padding: 0 32px 32px;
        }

        h1 {
            font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            font-weight: 600;
            font-size: 24px;
            color: #171a1f;
            margin: 0 0 16px;
            line-height: 1.3;
        }

        p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #171a1f;
        }

        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #c85f00;
            color: #ffffff;
            text-decoration: none;
            border-radius: 10px;
            font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            border: none;
            cursor: pointer;
            margin-bottom: 24px;
        }

        .button--destructive {
            background-color: #d51f28;
        }

        .notice {
            background-color: #eceff2;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .notice p {
            margin: 0;
            font-size: 14px;
            color: #535d68;
        }

        .notice--warning {
            background-color: #fdf3e3;
        }

        .notice--warning p {
            color: #b45309;
        }

        .footer {
            padding: 24px 32px 32px;
            border-top: 1px solid #d9dee5;
        }

        .footer p {
            margin: 0 0 8px;
            font-size: 13px;
            color: #535d68;
        }

        .footer a {
            color: #c85f00;
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .wrapper {
                padding: 16px 12px;
            }

            .header {
                padding: 24px 24px 20px;
            }

            .content {
                padding: 0 24px 24px;
            }

            h1 {
                font-size: 22px;
            }

            p {
                font-size: 15px;
            }

            .button {
                width: 100%;
                padding: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <div class="logo">
                    <div class="logo-mark">S</div>
                    <span class="app-name">Saldoa</span>
                </div>
            </div>

            <div class="content">
                {{ $slot }}
            </div>

            <div class="footer">
                @isset($footerNotes)
                    @foreach($footerNotes as $note)
                        <p>{{ $note }}</p>
                    @endforeach
                @else
                    <p>Saldoa &mdash; Controle financeiro pessoal</p>
                    <p>Se você não solicitou esta ação, ignore esta mensagem.</p>
                @endisset
            </div>
        </div>
    </div>
</body>
</html>