import { CodeType } from 'react-native-vision-camera';

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
  id: number;
  folderName: string;
  barcodes: Barcode[];
  name: string;
  location: string;
  gpsLocation?: GPSLocation;
  expectedCodeTypes: CodeType[];
  expectedCodes: number;
  codesToIgnore: CodeType[];
  autosavePictures: boolean;
}

export const SESSIONS_KEY = 'sessions';

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
