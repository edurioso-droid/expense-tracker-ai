import * as SecureStore from 'expo-secure-store';
import { UserSession, SkinId } from '../types/deposit';

const SESSION_KEY = 'copal_session_v1';
const FOUNDER_THRESHOLD = 1000;

let _sessionCache: UserSession | null = null;

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateSession(): Promise<UserSession> {
  if (_sessionCache) return _sessionCache;

  const stored = await SecureStore.getItemAsync(SESSION_KEY);

  if (stored) {
    _sessionCache = JSON.parse(stored) as UserSession;
    return _sessionCache;
  }

  const session: UserSession = {
    sessionId: generateId(),
    ownedSkins: ['void'],
    unlockedFeatures: [],
    depositCount: 0,
    lastDepositAt: null,
    isFounder: false,   // se actualiza desde el servidor al registrar
  };

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  _sessionCache = session;
  return session;
}

export async function updateSession(patch: Partial<UserSession>): Promise<UserSession> {
  const current = await getOrCreateSession();
  const updated = { ...current, ...patch };
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(updated));
  _sessionCache = updated;
  return updated;
}

export async function incrementDepositCount(): Promise<UserSession> {
  const session = await getOrCreateSession();
  return updateSession({
    depositCount: session.depositCount + 1,
    lastDepositAt: Date.now(),
  });
}

export async function unlockSkin(skinId: SkinId): Promise<void> {
  const session = await getOrCreateSession();
  if (!session.ownedSkins.includes(skinId)) {
    await updateSession({ ownedSkins: [...session.ownedSkins, skinId] });
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  _sessionCache = null;
}
