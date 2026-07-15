import { useCallback, useState } from 'react';

import { Camera } from 'react-native-vision-camera';

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
