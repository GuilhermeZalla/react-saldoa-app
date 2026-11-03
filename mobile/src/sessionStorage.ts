import * as SecureStore from 'expo-secure-store';
import type { Session } from './types';

const SESSION_KEY = 'saldoa.mobile.session';

export async function readSession(): Promise<Session | null> {
    const storedSession = await SecureStore.getItemAsync(SESSION_KEY);

    if (storedSession === null) {
        return null;
    }

    try {
        return JSON.parse(storedSession) as Session;
    } catch (error) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        throw new Error('Não foi possível ler a sessão salva.', { cause: error });
    }
}

export async function saveSession(session: Session): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
}
