import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Camera } from 'react-native-vision-camera';

import { Session } from '../services/storage/types';

interface UsePhotoCaptureOptions {
  cameraRef: React.RefObject<Camera | null>;
  hasStoragePermission: boolean;
  session: Session | null;
  sanitizeFileNamePart: (value: string) => string;
}

export const usePhotoCapture = ({
  cameraRef,
  hasStoragePermission,
  session,
  sanitizeFileNamePart,
}: UsePhotoCaptureOptions) => {
  const createAppFolder = useCallback(async () => {
    try {
      const folderPath = session
        ? `${RNFS.ExternalStorageDirectoryPath}/Pictures/BarcodeScanner/${session.folderName}`
        : `${RNFS.ExternalStorageDirectoryPath}/Pictures/BarcodeScanner`;

      const exists = await RNFS.exists(folderPath);

      if (!exists) {
        await RNFS.mkdir(folderPath);
        console.log('Created app folder:', folderPath);
      }

      return folderPath;
    } catch (error) {
      console.error('Error creating app folder:', error);
      return null;
    }
  }, [session]);

  const capturePhoto = useCallback(
    async (namePart: string = 'barcode') => {
      try {
        if (!cameraRef.current) {
          return null;
        }

        const photo = await cameraRef.current.takePhoto();
        const timestamp = new Date().getTime();
        const safeNamePart = sanitizeFileNamePart(namePart) || 'barcode';
        const filename = `${safeNamePart}_${timestamp}.jpg`;

        let destPath;
        if (hasStoragePermission && Platform.OS === 'android') {
          const folderPath = await createAppFolder();
          if (folderPath) {
            destPath = `${folderPath}/${filename}`;
          } else {
            destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
          }
        } else {
          destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
        }

        await RNFS.moveFile(photo.path, destPath);
        console.log('Photo saved to:', destPath);

        if (
          hasStoragePermission &&
          Platform.OS === 'android' &&
          destPath.includes('Pictures/BarcodeScanner')
        ) {
          try {
            await RNFS.scanFile(destPath);
            console.log('Image scanned for gallery visibility');
          } catch (scanError) {
            console.log('Media scan failed, but photo is saved:', scanError);
          }
        }

        return destPath;
      } catch (error) {
        console.error('Error capturing/saving photo:', error);
        return null;
      }
    },
    [cameraRef, createAppFolder, hasStoragePermission, sanitizeFileNamePart],
  );

  return {
    capturePhoto,
  };
};

interface UseScannerPermissionsOptions {
  requestStoragePermission: () => Promise<boolean>;
}

export const useScannerPermissions = ({
  requestStoragePermission,
}: UseScannerPermissionsOptions) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);

  const checkCameraAndStoragePermissions = useCallback(async () => {
    try {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      console.log('Current camera permission:', cameraPermission);

      const storagePermission = await requestStoragePermission();
      setHasStoragePermission(storagePermission);

      if (cameraPermission === 'granted') {
        setHasCameraPermission(true);
      } else if (cameraPermission === 'not-determined') {
        const newCameraPermission = await Camera.requestCameraPermission();
        console.log('New camera permission:', newCameraPermission);
        setHasCameraPermission(newCameraPermission === 'granted');
      } else {
        setHasCameraPermission(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasCameraPermission(false);
      setHasStoragePermission(false);
    }
  }, [requestStoragePermission]);

  return {
    hasCameraPermission,
    hasStoragePermission,
    setHasCameraPermission,
    setHasStoragePermission,
    checkCameraAndStoragePermissions,
  };
};
