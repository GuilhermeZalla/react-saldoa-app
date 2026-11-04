import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type PropsWithChildren,
} from 'react';
import { Alert } from 'react-native';
import { ApiError, sessionRequest } from './api';
import { clearSession, readSession, saveSession } from './sessionStorage';
import type { Session, User } from './types';

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
        try {
            const storedSession = await readSession();

            if (storedSession === null) {
                return;
            }

            let currentSession = storedSession;
            const expirationTime = Date.parse(storedSession.expiresAt);

            if (
                !storedSession.isDemo &&
                Number.isFinite(expirationTime) &&
                expirationTime - Date.now() < 7 * 24 * 60 * 60 * 1000
            ) {
                const refreshedToken = await sessionRequest<{
                    access_token: string;
                    expires_at: string;
                }>(storedSession, '/auth/refresh', { method: 'POST' });
                currentSession = {
                    ...storedSession,
                    accessToken: refreshedToken.access_token,
                    expiresAt: refreshedToken.expires_at,
                };
                await saveSession(currentSession);
            }

            const response = await sessionRequest<{ data: User }>(
                currentSession,
                '/auth/me',
            );
            const restoredSession = { ...currentSession, user: response.data };
            await saveSession(restoredSession);
            if (isCurrent()) {
                setSession(restoredSession);
            }
        } catch (error) {
            await clearSession();

            if (
                isCurrent() &&
                !(error instanceof ApiError && error.status === 401)
            ) {
                Alert.alert(
                    'Não foi possível restaurar a sessão',
                    error instanceof ApiError
                        ? error.message
                        : 'Tente entrar novamente.',
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

    const logout = useCallback(async () => {
        if (session !== null) {
            try {
                await sessionRequest(session, '/auth/logout', {
                    method: 'POST',
                });
            } catch (error) {
                if (!(error instanceof ApiError && error.status === 401)) {
                    Alert.alert(
                        'Sessão encerrada neste dispositivo',
                        'A API não confirmou a revogação. A sessão salva localmente foi removida.',
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
            'Conta excluída',
            'Sua conta e seus dados foram removidos.',
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
