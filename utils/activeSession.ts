import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_SESSION_KEY = 'activeSession';

export interface ActiveSessionData {
  sessionId: number;
  lastAccessed: string;
}

// Set the active session
export const setActiveSession = async (sessionId: number): Promise<void> => {
  try {
    const activeSessionData: ActiveSessionData = {
      sessionId,
      lastAccessed: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      ACTIVE_SESSION_KEY,
      JSON.stringify(activeSessionData),
    );

    console.log(`Active session set to: ${sessionId}`);
  } catch (error) {
    console.error('Error setting active session:', error);
  }
};

// Get the active session ID
export const getActiveSessionId = async (): Promise<number | null> => {
  try {
    const activeSessionData = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);

    if (activeSessionData) {
      const parsed: ActiveSessionData = JSON.parse(activeSessionData);
      return parsed.sessionId;
    }

    return null;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
};

// Get the full active session data
export const getActiveSessionData =
  async (): Promise<ActiveSessionData | null> => {
    try {
      const activeSessionData = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);

      if (activeSessionData) {
        return JSON.parse(activeSessionData);
      }

      return null;
    } catch (error) {
      console.error('Error getting active session data:', error);
      return null;
    }
  };

// Clear the active session
export const clearActiveSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    console.log('Active session cleared');
  } catch (error) {
    console.error('Error clearing active session:', error);
  }
};

// Check if a session ID is the current active session
export const isActiveSession = async (sessionId: number): Promise<boolean> => {
  try {
    const activeSessionId = await getActiveSessionId();
    return activeSessionId === sessionId;
  } catch (error) {
    console.error('Error checking if session is active:', error);
    return false;
  }
};
