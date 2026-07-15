import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { Camera } from 'react-native-vision-camera';

interface UsePermissionsOptions {
  requestStoragePermission: () => Promise<boolean>;
}

interface LocationPermissionMessages {
  title: string;
  message: string;
  askMeLater: string;
  cancel: string;
  ok: string;
}

export const requestLocationPermission = async (
  messages: LocationPermissionMessages,
) => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: messages.title,
        message: messages.message,
        buttonNeutral: messages.askMeLater,
        buttonNegative: messages.cancel,
        buttonPositive: messages.ok,
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.warn('Location permission error:', error);
    return false;
  }
};

export const usePermissions = ({
  requestStoragePermission,
}: UsePermissionsOptions) => {
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
