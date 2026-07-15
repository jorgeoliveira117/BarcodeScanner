import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearActiveSession,
  getActiveSessionId,
} from '../../utils/activeSession';
import { SESSIONS_KEY, Session, validateSessionCodes } from './types';

export const getSessions = async (): Promise<Session[]> => {
  try {
    const savedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
    return savedSessions ? JSON.parse(savedSessions) : [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

export const getSessionById = async (
  sessionId: number,
): Promise<Session | null> => {
  try {
    const sessions = await getSessions();
    return sessions.find(session => session.id === sessionId) || null;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    return null;
  }
};

export const createSession = async (
  sessionData: Omit<Session, 'id' | 'barcodes'>,
): Promise<Session> => {
  try {
    const validation = validateSessionCodes(
      sessionData.expectedCodeTypes,
      sessionData.codesToIgnore,
    );

    if (!validation.isValid) {
      throw new Error(
        `Cannot ignore expected code types. Conflicting types: ${validation.conflicts.join(
          ', ',
        )}`,
      );
    }

    const existingSessions = await getSessions();

    let id = existingSessions.length;
    let isIdUnique = false;

    while (!isIdUnique) {
      isIdUnique = !existingSessions.some(session => session.id === id);
      if (!isIdUnique) {
        id++;
      }
    }

    const newSession: Session = {
      ...sessionData,
      id,
      folderName: `${id}-${sessionData.name
        .replace(/\s+/g, '_')
        .toLowerCase()}`,
      barcodes: [],
    };

    const updatedSessions = [newSession, ...existingSessions];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    return newSession;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const modifySession = async (
  sessionId: number,
  updates: Partial<Omit<Session, 'id' | 'folderName' | 'barcodes'>>,
): Promise<Session> => {
  try {
    const sessions = await getSessions();
    const sessionIndex = sessions.findIndex(
      session => session.id === sessionId,
    );

    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const currentSession = sessions[sessionIndex];
    const updatedSession = { ...currentSession, ...updates };

    if (updates.expectedCodeTypes || updates.codesToIgnore) {
      const validation = validateSessionCodes(
        updatedSession.expectedCodeTypes,
        updatedSession.codesToIgnore,
      );

      if (!validation.isValid) {
        throw new Error(
          `Cannot ignore expected code types. Conflicting types: ${validation.conflicts.join(
            ', ',
          )}`,
        );
      }
    }

    sessions[sessionIndex] = updatedSession;
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return updatedSession;
  } catch (error) {
    console.error('Error modifying session:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  try {
    const sessions = await getSessions();
    const updatedSessions = sessions.filter(
      session => session.id !== sessionId,
    );
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));

    const activeSessionId = await getActiveSessionId();
    if (activeSessionId === sessionId) {
      await clearActiveSession();
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};
