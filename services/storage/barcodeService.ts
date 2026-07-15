import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

import { getSessionById, getSessions } from './sessionService';
import { Barcode, SESSIONS_KEY } from './types';

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

    if (session.codesToIgnore.includes(barcode.type)) {
      throw new Error(
        `Barcode type '${barcode.type}' is configured to be ignored for this session`,
      );
    }

    const newBarcode: Barcode = {
      ...barcode,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    sessions[sessionIndex].barcodes = [newBarcode, ...session.barcodes];
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

export const getSessionBarcodeStats = async (sessionId: number) => {
  try {
    const barcodes = await getBarcodesFromSession(sessionId);
    const totalCount = barcodes.length;
    const typeCount: { [key: string]: number } = {};

    barcodes.forEach(barcode => {
      typeCount[barcode.type] = (typeCount[barcode.type] || 0) + 1;
    });

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

export const exportSessionToCSV = async (
  sessionId: number,
): Promise<string> => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const rows = session.barcodes.map(barcode => barcode.value).join('\n');
    const csvContent = `Seriali\n${rows}`;
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${session.folderName}_${currentDate}.csv`;
    const filePath = `${RNFS.DownloadDirectoryPath}/${filename}`;

    await RNFS.writeFile(filePath, csvContent, 'utf8');
    return filePath;
  } catch (error) {
    console.error('Error exporting session to CSV:', error);
    throw error;
  }
};

export const exportSessionToJSON = async (
  sessionId: number,
): Promise<string> => {
  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const sessionStats = await getSessionBarcodeStats(sessionId);
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        sessionId: session.id,
        sessionName: session.name,
      },
      session: {
        id: session.id,
        name: session.name,
        folderName: session.folderName,
        location: session.location,
        gpsLocation: session.gpsLocation,
        expectedCodeTypes: session.expectedCodeTypes,
        expectedCodes: session.expectedCodes,
        codesToIgnore: session.codesToIgnore,
        autosavePictures: session.autosavePictures,
        barcodes: session.barcodes.map(barcode => ({
          id: barcode.id,
          value: barcode.value,
          type: barcode.type,
          timestamp: barcode.timestamp,
          photoPath: barcode.photoPath,
        })),
        stats: {
          totalBarcodes: sessionStats.totalCount,
          completionPercentage:
            session.expectedCodes > 0
              ? Math.round(
                  (sessionStats.totalCount / session.expectedCodes) * 100,
                )
              : 0,
          uniqueBarcodes: [...new Set(session.barcodes.map(b => b.value))]
            .length,
          typeDistribution: sessionStats.typeCount,
          scanningPeriod: {
            firstScan: sessionStats.earliestScan?.toISOString() || null,
            lastScan: sessionStats.latestScan?.toISOString() || null,
          },
        },
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const currentDate = new Date().toISOString().split('T')[0];
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')[1]
      .split('.')[0];
    const filename = `${session.folderName}_export_${currentDate}_${timestamp}.json`;
    const filePath = `${RNFS.DownloadDirectoryPath}/${filename}`;

    await RNFS.writeFile(filePath, jsonContent, 'utf8');
    return filePath;
  } catch (error) {
    console.error('Error exporting session to JSON:', error);
    throw error;
  }
};
