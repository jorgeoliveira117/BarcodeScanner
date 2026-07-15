import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearActiveSession,
  getActiveSessionData,
  getActiveSessionId,
  isActiveSession,
  setActiveSession,
} from '../utils/activeSession';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('activeSession utils', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('stores and retrieves active session id', async () => {
    await setActiveSession(42);

    const sessionId = await getActiveSessionId();

    expect(sessionId).toBe(42);
  });

  it('returns full active session payload with timestamp', async () => {
    await setActiveSession(7);

    const data = await getActiveSessionData();

    expect(data).not.toBeNull();
    expect(data?.sessionId).toBe(7);
    expect(typeof data?.lastAccessed).toBe('string');
    expect(new Date(data!.lastAccessed).toString()).not.toBe('Invalid Date');
  });

  it('clears active session data', async () => {
    await setActiveSession(99);
    await clearActiveSession();

    const sessionId = await getActiveSessionId();
    const sessionData = await getActiveSessionData();

    expect(sessionId).toBeNull();
    expect(sessionData).toBeNull();
  });

  it('checks if a session is active', async () => {
    await setActiveSession(12);

    expect(await isActiveSession(12)).toBe(true);
    expect(await isActiveSession(13)).toBe(false);
  });
});
