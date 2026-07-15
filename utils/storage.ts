export {
  BARCODE_TYPES,
  type Barcode,
  type GPSLocation,
  type Session,
  validateSessionCodes,
} from '../services/storage/types';
export {
  createSession,
  deleteSession,
  getSessionById,
  getSessions,
  modifySession,
} from '../services/storage/sessionService';
export {
  addBarcodeToSession,
  exportSessionToCSV,
  exportSessionToJSON,
  getBarcodesFromSession,
  getSessionBarcodeStats,
  removeBarcodeFromSession,
} from '../services/storage/barcodeService';

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
