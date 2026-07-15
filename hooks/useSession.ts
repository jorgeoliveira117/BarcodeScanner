import { useCallback, useState } from 'react';

import { getSessionById } from '../utils/storage';
import { Session } from '../services/storage/types';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  const loadSession = useCallback(async (sessionId: number) => {
    try {
      const sessionData = await getSessionById(sessionId);
      setSession(sessionData);
      return sessionData;
    } catch (error) {
      console.error('Error loading session:', error);
      setSession(null);
      return null;
    }
  }, []);

  return {
    session,
    setSession,
    loadSession,
  };
};
