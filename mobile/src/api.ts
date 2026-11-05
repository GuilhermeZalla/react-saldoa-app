import { getLocale, t } from './i18n';
import type { ApiErrorPayload, Session } from './types';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
        public readonly details?: Record<string, string[]>,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

type RequestOptions = {
    token?: string;
    method?: string;
    body?: unknown;
};

const API_REQUEST_TIMEOUT_MS = 15_000;

export function configuredApiUrl(isDemo: boolean): string | null {
    const apiUrl = isDemo
        ? process.env.EXPO_PUBLIC_API_URL_DEMO
        : process.env.EXPO_PUBLIC_API_URL;
    const normalizedUrl = apiUrl?.trim().replace(/\/+$/, '');

    if (!normalizedUrl) {
        return null;
    }

    try {
        const parsedUrl = new URL(normalizedUrl);

        const allowsLocalHttp =
            __DEV__ || process.env.EXPO_PUBLIC_LOCAL_APK === 'true';

        return (parsedUrl.protocol === 'https:' ||
            (allowsLocalHttp && parsedUrl.protocol === 'http:')) &&
            parsedUrl.pathname === '/' &&
            parsedUrl.search === '' &&
            parsedUrl.hash === ''
            ? normalizedUrl
            : null;
    } catch {
        return null;
    }
}

async function withRequestTimeout<T>(
    request: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        API_REQUEST_TIMEOUT_MS,
    );

    try {
        return await request(controller.signal);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                t(
                    'A API não respondeu em 15 segundos. Verifique se o servidor está ativo e acessível pelo celular.',
                ),
                0,
                'request_timeout',
            );
        }
        if (error instanceof SyntaxError) {
            throw new ApiError(
                t(
                    'O servidor encontrou um problema. Tente novamente mais tarde.',
                ),
                0,
                'invalid_response',
            );
        }
        throw new ApiError(
            t('Não foi possível conectar à API. Verifique sua conexão.'),
            0,
            'network_error',
        );
    } finally {
        clearTimeout(timeout);
    }
}

export async function apiRequest<T>(
    apiUrl: string,
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    return withRequestTimeout(async (signal) => {
        const response = await fetch(`${apiUrl}/api/v1${path}`, {
            method: options.method ?? 'GET',
            headers: {
                Accept: 'application/json',
                'Accept-Language': getLocale(),
                ...(options.body === undefined
                    ? {}
                    : { 'Content-Type': 'application/json' }),
                ...(options.token === undefined
                    ? {}
                    : { Authorization: `Bearer ${options.token}` }),
            },
            ...(options.body === undefined
                ? {}
                : { body: JSON.stringify(options.body) }),
            signal,
        });
        const contentType = response.headers.get('content-type') ?? '';
        const payload = contentType.includes('application/json')
            ? ((await response.json()) as ApiErrorPayload & T)
            : null;
        if (!response.ok) {
            const apiError = payload as ApiErrorPayload | null;
            throw new ApiError(
                apiErrorMessage(
                    apiError,
                    response.status,
                    path === '/auth/login',
                ),
                response.status,
                apiError?.error?.code,
                apiError?.error?.details,
            );
        }
        return payload as T;
    });
}

export function apiErrorMessage(
    payload: ApiErrorPayload | null,
    status: number,
    signingIn = false,
): string {
    if (status === 401) {
        return t(
            signingIn
                ? 'E-mail ou senha incorretos.'
                : 'Sua sessão expirou. Entre novamente.',
        );
    }
    if (status === 403) {
        return t('Você não tem permissão para esta ação.');
    }
    if (status === 404) {
        return t('O recurso solicitado não está disponível.');
    }
    if (status === 429) {
        return t('Muitas tentativas. Aguarde um momento e tente novamente.');
    }
    if (status >= 500) {
        return t(
            'O servidor encontrou um problema. Tente novamente mais tarde.',
        );
    }
    if (status === 422) {
        const details = payload?.error?.details ?? {};
        if (getLocale() === 'pt-BR') {
            return (
                Object.values(details)[0]?.[0] ??
                t('Verifique os dados informados.')
            );
        }
        const fieldLabels: Record<string, string> = {
            email: 'E-mail',
            password: 'Senha',
            password_confirmation: 'Confirmar senha',
            name: 'Nome',
            description: 'Descrição',
            amount: 'Valor',
            category_id: 'Categoria',
            date: 'Data',
            start_date: 'Data de início',
            frequency: 'Frequência',
        };
        const fields = Object.keys(details).map((field) =>
            t(fieldLabels[field] ?? 'Verifique os dados informados.'),
        );
        return fields.length
            ? t('Verifique os dados informados em: {fields}.', {
                  fields: fields.join(', '),
              })
            : t('Verifique os dados informados.');
    }
    if (
        payload?.error?.code === 'category_in_use' ||
        payload?.error?.code === 'category_has_transactions'
    ) {
        return t(
            'Não é possível excluir uma categoria que ainda possui lançamentos ou recorrências.',
        );
    }
    return getLocale() === 'pt-BR' && payload?.error?.message
        ? payload.error.message
        : t('Não foi possível concluir a solicitação.');
}

export function sessionRequest<T>(
    session: Session,
    path: string,
    options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
    return apiRequest<T>(session.apiUrl, path, {
        ...options,
        token: session.accessToken,
    });
}

export async function apiTextRequest(
    session: Session,
    path: string,
): Promise<string> {
    return withRequestTimeout(async (signal) => {
        const response = await fetch(`${session.apiUrl}/api/v1${path}`, {
            signal,
            headers: {
                'Accept-Language': getLocale(),
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
        if (!response.ok) {
            throw new ApiError(
                response.status === 401
                    ? t('Sua sessão expirou. Entre novamente.')
                    : t('Não foi possível exportar os dados.'),
                response.status,
            );
        }
        return await response.text();
    });
}
