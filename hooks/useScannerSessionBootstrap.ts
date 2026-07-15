import { useEffect, useState } from 'react';

import { Session } from '../services/storage/types';
import { getActiveSessionId, setActiveSession } from '../utils/activeSession';

interface UseScannerSessionBootstrapOptions {
  routeSessionId?: number;
  loadSettings: () => void;
  initializeSounds: () => void;
  loadSession: (sessionId: number) => Promise<Session | null>;
  onNoSessionSelected: () => void;
}

export const useScannerSessionBootstrap = ({
  routeSessionId,
  loadSettings,
  initializeSounds,
  loadSession,
  onNoSessionSelected,
}: UseScannerSessionBootstrapOptions) => {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    routeSessionId ?? null,
  );

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      loadSettings();
      initializeSounds();

      let sessionIdToUse: number | null | undefined = routeSessionId;
      console.log(
        '🎯 ScannerScreen mounted with route sessionId:',
        routeSessionId,
      );

      if (sessionIdToUse === null || sessionIdToUse === undefined) {
        console.log(
          '🔍 No sessionId in route params, checking for active session...',
        );
        const activeSessionId = await getActiveSessionId();
        console.log('📋 Active session from storage:', activeSessionId);
        sessionIdToUse = activeSessionId;
      }

      if (sessionIdToUse === null || sessionIdToUse === undefined) {
        console.log('❌ No sessionId provided or found in storage');
        onNoSessionSelected();
        return;
      }

      if (!isMounted) {
        return;
      }

      console.log('✅ Using sessionId:', sessionIdToUse);
      setCurrentSessionId(sessionIdToUse);

      const sessionData = await loadSession(sessionIdToUse);
      if (sessionData) {
        console.log('📄 Session data loaded:', sessionData.name);
        console.log('🎯 Expected code types:', sessionData.expectedCodeTypes);
      } else {
        console.log('❌ Failed to load session data for ID:', sessionIdToUse);
      }

      console.log('🔧 Setting active session to:', sessionIdToUse);
      setActiveSession(sessionIdToUse);
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [
    initializeSounds,
    loadSession,
    loadSettings,
    onNoSessionSelected,
    routeSessionId,
  ]);

  return {
    currentSessionId,
    setCurrentSessionId,
  };
};
