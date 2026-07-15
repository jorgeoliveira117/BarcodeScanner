import { useCallback, useState } from 'react';

import {
  ActiveSessionData,
  getActiveSessionData,
} from '../utils/activeSession';
import { getSessionById } from '../utils/storage';
import { Session } from '../services/storage/types';

export const useActiveSession = () => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeSessionData, setActiveSessionData] =
    useState<ActiveSessionData | null>(null);

  const loadActiveSession = useCallback(async () => {
    try {
      const currentActiveSessionData = await getActiveSessionData();

      if (!currentActiveSessionData) {
        setActiveSession(null);
        setActiveSessionData(null);
        return null;
      }

      const session = await getSessionById(currentActiveSessionData.sessionId);

      if (!session) {
        setActiveSession(null);
        setActiveSessionData(null);
        return null;
      }

      setActiveSession(session);
      setActiveSessionData(currentActiveSessionData);
      return session;
    } catch (error) {
      console.error('Error loading active session:', error);
      setActiveSession(null);
      setActiveSessionData(null);
      return null;
    }
  }, []);

  return {
    activeSession,
    activeSessionData,
    loadActiveSession,
  };
};
