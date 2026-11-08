import { t } from './i18n';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type PropsWithChildren,
} from 'react';
import { Alert, AppState } from 'react-native';
import { ApiError, sessionRequest } from './api';
import { clearSession, readSession, saveSession } from './sessionStorage';
import type { Session, User } from './types';
import { isSessionExpired, sessionExpiresAt } from './sessionLifetime';

type SessionContextValue = {
    session: Session | null;
    loading: boolean;
    authenticate: (session: Session) => Promise<void>;
    logout: () => Promise<void>;
    accountDeleted: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    async function restoreSession(isCurrent: () => boolean): Promise<void> {
        let currentSession: Session | null = null;
        try {
            const storedSession = await readSession();

            if (storedSession === null) {
                return;
            }

            if (isSessionExpired(storedSession)) {
                await clearSession();
                return;
            }
            currentSession = storedSession;

            const response = await sessionRequest<{ data: User }>(
                currentSession,
                '/auth/me',
            );
            if (isSessionExpired(currentSession)) {
                await clearSession();
                return;
            }
            const restoredSession = { ...currentSession, user: response.data };
            await saveSession(restoredSession);
            if (isCurrent()) {
                setSession(restoredSession);
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                await clearSession();
            } else if (
                isCurrent() &&
                currentSession !== null &&
                !isSessionExpired(currentSession)
            ) {
                setSession(currentSession);
            }

            if (
                isCurrent() &&
                !(error instanceof ApiError && error.status === 401)
            ) {
                Alert.alert(
                    t('Não foi possível restaurar a sessão'),
                    error instanceof ApiError
                        ? error.message
                        : t('Tente entrar novamente.'),
                );
            }
        } finally {
            if (isCurrent()) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        let isMounted = true;
        void Promise.resolve().then(() => restoreSession(() => isMounted));

        return () => {
            isMounted = false;
        };
    }, []);

    const authenticate = useCallback(async (nextSession: Session) => {
        await saveSession(nextSession);
        setSession(nextSession);
    }, []);

    useEffect(() => {
        if (session === null) return;
        function expireSession(): void {
            if (session !== null && isSessionExpired(session)) {
                setSession(null);
                void clearSession();
                Alert.alert(t('Sua sessão expirou. Entre novamente.'));
            }
        }
        const timeout = setTimeout(
            expireSession,
            Math.max(0, sessionExpiresAt(session) - Date.now()),
        );
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') expireSession();
        });
        return () => {
            clearTimeout(timeout);
            subscription.remove();
        };
    }, [session]);

    const logout = useCallback(async () => {
        if (session !== null) {
            try {
                await sessionRequest(session, '/auth/logout', {
                    method: 'POST',
                });
            } catch (error) {
                if (!(error instanceof ApiError && error.status === 401)) {
                    Alert.alert(
                        t('Sessão encerrada neste dispositivo'),
                        t(
                            'A API não confirmou a revogação. A sessão salva localmente foi removida.',
                        ),
                    );
                }
            }
        }

        await clearSession();
        setSession(null);
    }, [session]);

    const accountDeleted = useCallback(async () => {
        await clearSession();
        setSession(null);
        Alert.alert(
            t('Conta excluída'),
            t('Sua conta e seus dados foram removidos.'),
        );
    }, []);

    return (
        <SessionContext.Provider
            value={{ session, loading, authenticate, logout, accountDeleted }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);

    if (context === null) {
        throw new Error('useSession must be used within a SessionProvider.');
    }

    return context;
}
