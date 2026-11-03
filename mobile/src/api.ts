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

        return (parsedUrl.protocol === 'https:' ||
            (__DEV__ && parsedUrl.protocol === 'http:')) &&
            parsedUrl.pathname === '/' &&
            parsedUrl.search === '' &&
            parsedUrl.hash === ''
            ? normalizedUrl
            : null;
    } catch {
        return null;
    }
}

export async function apiRequest<T>(
    apiUrl: string,
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(`${apiUrl}/api/v1${path}`, {
            method: options.method ?? 'GET',
            headers: {
                Accept: 'application/json',
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
        });
    } catch {
        throw new ApiError(
            'Não foi possível conectar à API. Verifique a URL e sua conexão.',
            0,
            'network_error',
        );
    }

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
        ? ((await response.json()) as ApiErrorPayload & T)
        : null;

    if (!response.ok) {
        const apiError = payload as ApiErrorPayload | null;

        throw new ApiError(
            firstValidationMessage(apiError?.error?.details) ??
                apiError?.error?.message ??
                (response.status === 401
                    ? 'Sua sessão expirou. Entre novamente.'
                    : 'Não foi possível concluir a solicitação.'),
            response.status,
            apiError?.error?.code,
            apiError?.error?.details,
        );
    }

    return payload as T;
}

function firstValidationMessage(
    details: Record<string, string[]> | undefined,
): string | null {
    const firstFieldErrors = Object.values(details ?? {})[0];

    return firstFieldErrors?.[0] ?? null;
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
    let response: Response;

    try {
        response = await fetch(`${session.apiUrl}/api/v1${path}`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });
    } catch {
        throw new ApiError(
            'Não foi possível conectar à API. Verifique sua conexão.',
            0,
            'network_error',
        );
    }

    if (!response.ok) {
        throw new ApiError(
            response.status === 401
                ? 'Sua sessão expirou. Entre novamente.'
                : 'Não foi possível exportar os dados.',
            response.status,
        );
    }

    return response.text();
}
