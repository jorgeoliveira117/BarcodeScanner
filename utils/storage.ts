import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface Barcode {
  id: string;
  value: string;
  type: string;
  timestamp: string;
}

const STORAGE_KEY = 'barcodes';

export const saveBarcodeToStorage = async (barcode: Omit<Barcode, 'id'>) => {
  try {
    const existingBarcodes = await getBarcodes();
    const newBarcode: Barcode = {
      ...barcode,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const updatedBarcodes = [newBarcode, ...existingBarcodes];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBarcodes));
    return newBarcode;
  } catch (error) {
    console.error('Error saving barcode:', error);
    throw error;
  }
};

export const getBarcodes = async (): Promise<Barcode[]> => {
  try {
    const savedBarcodes = await AsyncStorage.getItem(STORAGE_KEY);
    return savedBarcodes ? JSON.parse(savedBarcodes) : [];
  } catch (error) {
    console.error('Error getting barcodes:', error);
    return [];
  }
};

export const clearAllBarcodes = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing barcodes:', error);
    throw error;
  }
};

export const exportToCSV = async (barcodes: Barcode[]): Promise<string> => {
  try {
    // Create CSV header
    const header = 'ID,Value,Type,Timestamp,Date,Time\n';

    // Create CSV rows
    const rows = barcodes
      .map(barcode => {
        const date = new Date(barcode.timestamp);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = date.toTimeString().split(' ')[0]; // HH:MM:SS

        return `"${barcode.id}","${barcode.value}","${barcode.type}","${barcode.timestamp}","${dateStr}","${timeStr}"`;
      })
      .join('\n');

    const csvContent = header + rows;

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `barcodes_${currentDate}.csv`;

    // Save to Downloads directory
    const downloadPath = RNFS.DownloadDirectoryPath;
    const filePath = `${downloadPath}/${filename}`;

    await RNFS.writeFile(filePath, csvContent, 'utf8');

    return filePath;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

export const deleteBarcodeById = async (id: string) => {
  try {
    const existingBarcodes = await getBarcodes();
    const updatedBarcodes = existingBarcodes.filter(
      barcode => barcode.id !== id,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBarcodes));
  } catch (error) {
    console.error('Error deleting barcode:', error);
    throw error;
  }
};

// Get statistics about scanned barcodes
export const getBarcodeStats = async () => {
  try {
    const barcodes = await getBarcodes();
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
    console.error('Error getting barcode stats:', error);
    return {
      totalCount: 0,
      typeCount: {},
      earliestScan: null,
      latestScan: null,
    };
  }
};
