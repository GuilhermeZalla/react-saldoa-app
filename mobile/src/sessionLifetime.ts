import type { Session } from './types';

export const SESSION_LIFETIME_MS = 10 * 24 * 60 * 60 * 1000;

export function sessionExpiresAt(session: Session): number {
    const authenticatedAt = Date.parse(session.authenticatedAt ?? '');
    const expiresAt = Date.parse(session.expiresAt);
    if (!Number.isFinite(authenticatedAt) || !Number.isFinite(expiresAt))
        return 0;
    return Math.min(expiresAt, authenticatedAt + SESSION_LIFETIME_MS);
}

export function isSessionExpired(session: Session, now = Date.now()): boolean {
    return sessionExpiresAt(session) <= now;
}
