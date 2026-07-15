import { useCallback, useState } from 'react';

import { deleteSession, getSessions } from '../utils/storage';
import { Session } from '../services/storage/types';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = useCallback(async () => {
    try {
      const allSessions = await getSessions();
      setSessions(allSessions);
      return allSessions;
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
      return [] as Session[];
    }
  }, []);

  const deleteAndRefreshSession = useCallback(
    async (sessionId: number) => {
      await deleteSession(sessionId);
      await loadSessions();
    },
    [loadSessions],
  );

  return {
    sessions,
    setSessions,
    loadSessions,
    deleteAndRefreshSession,
  };
};
