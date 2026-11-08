import { t } from './i18n';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from './types';
import { isSessionExpired } from './sessionLifetime';

const SESSION_KEY = 'saldoa.mobile.session';
let webSession: string | null = null;

export async function readSession(): Promise<Session | null> {
    const storedSession =
        Platform.OS === 'web'
            ? webSession
            : await SecureStore.getItemAsync(SESSION_KEY);

    if (storedSession === null) {
        return null;
    }

    try {
        const session = JSON.parse(storedSession) as Session;
        if (isSessionExpired(session)) {
            await deleteStoredSession();
            return null;
        }
        return session;
    } catch (error) {
        await deleteStoredSession();
        throw new Error(t('Não foi possível ler a sessão salva.'), {
            cause: error,
        });
    }
}

export async function saveSession(session: Session): Promise<void> {
    const serializedSession = JSON.stringify(session);

    if (Platform.OS === 'web') {
        webSession = serializedSession;

        return;
    }

    await SecureStore.setItemAsync(SESSION_KEY, serializedSession);
}

export async function clearSession(): Promise<void> {
    await deleteStoredSession();
}

async function deleteStoredSession(): Promise<void> {
    if (Platform.OS === 'web') {
        webSession = null;

        return;
    }

    await SecureStore.deleteItemAsync(SESSION_KEY);
}
