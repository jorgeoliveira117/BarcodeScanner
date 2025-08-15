import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { CodeType } from 'react-native-vision-camera';
import { getActiveSessionId, clearActiveSession } from './activeSession';

export const BARCODE_TYPES: CodeType[] = [
  'code-128',
  'code-39',
  'code-93',
  'codabar',
  'ean-13',
  'ean-8',
  'itf',
  'upc-e',
  'upc-a',
  'qr',
  'pdf-417',
  'aztec',
  'data-matrix',
];

export interface Barcode {
  id: string;
  value: string;
  type: CodeType;
  timestamp: string;
  photoPath?: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface Session {
  id: number; // Unique and can't be changed
  folderName: string; // Unique and can't be changed
  barcodes: Barcode[];
  name: string;
  location: string;
  gpsLocation?: GPSLocation;
  expectedCodeTypes: CodeType[];
  expectedCodes: number;
  codesToIgnore: CodeType[];
  autosavePictures: boolean;
}

const SESSIONS_KEY = 'sessions';

// Validation function to ensure codesToIgnore doesn't conflict with expectedCodeTypes
export const validateSessionCodes = (
  expectedCodeTypes: CodeType[],
  codesToIgnore: CodeType[],
): { isValid: boolean; conflicts: CodeType[] } => {
  const conflicts = codesToIgnore.filter(ignoreType =>
    expectedCodeTypes.includes(ignoreType),
  );

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
};

// Session management functions
export const createSession = async (
  sessionData: Omit<Session, 'id' | 'barcodes'>,
): Promise<Session> => {
  try {
    // Validate that codesToIgnore doesn't conflict with expectedCodeTypes
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
      id: id,
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

    // Validate codes if either expectedCodeTypes or codesToIgnore is being updated
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

export const addBarcodeToSession = async (
  sessionId: number,
  barcode: Omit<Barcode, 'id'>,
): Promise<Barcode> => {
  try {
    const sessions = await getSessions();
    const sessionIndex = sessions.findIndex(
      session => session.id === sessionId,
    );

    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const session = sessions[sessionIndex];

    // Check if the barcode type should be ignored
    if (session.codesToIgnore.includes(barcode.type)) {
      throw new Error(
        `Barcode type '${barcode.type}' is configured to be ignored for this session`,
      );
    }

    const newBarcode: Barcode = {
      ...barcode,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    sessions[sessionIndex].barcodes = [
      newBarcode,
      ...sessions[sessionIndex].barcodes,
    ];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return newBarcode;
  } catch (error) {
    console.error('Error adding barcode to session:', error);
    throw error;
  }
};

export const removeBarcodeFromSession = async (
  sessionId: number,
  barcodeId: string,
): Promise<void> => {
  try {
    const sessions = await getSessions();
    const sessionIndex = sessions.findIndex(
      session => session.id === sessionId,
    );

    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    sessions[sessionIndex].barcodes = sessions[sessionIndex].barcodes.filter(
      barcode => barcode.id !== barcodeId,
    );

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error removing barcode from session:', error);
    throw error;
  }
};

export const getBarcodesFromSession = async (
  sessionId: number,
): Promise<Barcode[]> => {
  try {
    const session = await getSessionById(sessionId);
    return session ? session.barcodes : [];
  } catch (error) {
    console.error('Error getting barcodes from session:', error);
    return [];
  }
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  try {
    const sessions = await getSessions();
    const updatedSessions = sessions.filter(
      session => session.id !== sessionId,
    );
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));

    // Clear active session if the deleted session was active
    const activeSessionId = await getActiveSessionId();
    if (activeSessionId === sessionId) {
      await clearActiveSession();
    }

    console.log('Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

export const exportSessionToCSV = async (
  sessionId: number,
): Promise<string> => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const barcodes = session.barcodes;
    let header = 'ID,Value,Type,Timestamp,Date,Time';

    // Add GPS columns if session has GPS location
    if (session.gpsLocation) {
      header +=
        ',Session_Latitude,Session_Longitude,Session_GPS_Accuracy,Session_GPS_Timestamp';
    }
    header += '\n';

    const rows = barcodes
      .map(barcode => {
        const date = new Date(barcode.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0];
        let row = `"${barcode.id}","${barcode.value}","${barcode.type}","${barcode.timestamp}","${dateStr}","${timeStr}"`;

        // Add GPS data if available
        if (session.gpsLocation) {
          row += `,"${session.gpsLocation.latitude}","${
            session.gpsLocation.longitude
          }","${session.gpsLocation.accuracy || 'N/A'}","${
            session.gpsLocation.timestamp
          }"`;
        }

        return row;
      })
      .join('\n');

    const csvContent = header + rows;
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${session.folderName}_${currentDate}.csv`;
    const downloadPath = RNFS.DownloadDirectoryPath;
    const filePath = `${downloadPath}/${filename}`;

    await RNFS.writeFile(filePath, csvContent, 'utf8');
    return filePath;
  } catch (error) {
    console.error('Error exporting session to CSV:', error);
    throw error;
  }
};

// Get statistics about scanned barcodes in a session
export const getSessionBarcodeStats = async (sessionId: number) => {
  try {
    const barcodes = await getBarcodesFromSession(sessionId);
    const totalCount = barcodes.length;

    // Count by type
    const typeCount: { [key: string]: number } = {};
    barcodes.forEach(barcode => {
      typeCount[barcode.type] = (typeCount[barcode.type] || 0) + 1;
    });

    // Get date range
    const timestamps = barcodes.map(b => new Date(b.timestamp).getTime());
    const earliestScan =
      timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const latestScan =
      timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    return {
      totalCount,
      typeCount,
      earliestScan,
      latestScan,
    };
  } catch (error) {
    console.error('Error getting session barcode stats:', error);
    return {
      totalCount: 0,
      typeCount: {},
      earliestScan: null,
      latestScan: null,
    };
  }
};

// Get statistics across all sessions
export const getAllSessionsStats = async () => {
  try {
    const sessions = await getSessions();
    const totalSessions = sessions.length;
    let totalBarcodes = 0;
    const typeCount: { [key: string]: number } = {};
    const allTimestamps: number[] = [];

    sessions.forEach(session => {
      totalBarcodes += session.barcodes.length;
      session.barcodes.forEach(barcode => {
        typeCount[barcode.type] = (typeCount[barcode.type] || 0) + 1;
        allTimestamps.push(new Date(barcode.timestamp).getTime());
      });
    });

    const earliestScan =
      allTimestamps.length > 0 ? new Date(Math.min(...allTimestamps)) : null;
    const latestScan =
      allTimestamps.length > 0 ? new Date(Math.max(...allTimestamps)) : null;

    return {
      totalSessions,
      totalBarcodes,
      typeCount,
      earliestScan,
      latestScan,
    };
  } catch (error) {
    console.error('Error getting all sessions stats:', error);
    return {
      totalSessions: 0,
      totalBarcodes: 0,
      typeCount: {},
      earliestScan: null,
      latestScan: null,
    };
  }
};
