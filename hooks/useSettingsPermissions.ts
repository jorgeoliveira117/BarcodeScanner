import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface UseSettingsPermissionsOptions {
  t: (key: string) => string;
}

export const useSettingsPermissions = ({
  t,
}: UseSettingsPermissionsOptions) => {
  const [cameraPermission, setCameraPermission] = useState<string>('unknown');
  const [storagePermission, setStoragePermission] = useState<string>('unknown');

  const getStoragePermissionKey = useCallback(() => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      }
      return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }

    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      const cameraResult = await check(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA,
      );
      setCameraPermission(cameraResult);

      const storageResult = await check(getStoragePermissionKey());
      setStoragePermission(storageResult);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [getStoragePermissionKey]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const result = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA,
      );
      setCameraPermission(result);

      if (result === RESULTS.GRANTED) {
        Alert.alert(
          t('settings.cameraPermissionSuccessTitle'),
          t('settings.cameraPermissionSuccessMessage'),
        );
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          t('settings.cameraPermissionDeniedTitle'),
          t('settings.cameraPermissionDeniedMessage'),
        );
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          t('settings.cameraPermissionBlockedTitle'),
          t('settings.cameraPermissionBlockedMessage'),
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        t('settings.cameraPermissionErrorTitle'),
        t('settings.cameraPermissionErrorMessage'),
      );
    }
  }, [t]);

  const requestStoragePermission = useCallback(async () => {
    try {
      const result = await request(getStoragePermissionKey());
      setStoragePermission(result);

      if (result === RESULTS.GRANTED) {
        Alert.alert(
          t('settings.storagePermissionSuccessTitle'),
          t('settings.storagePermissionSuccessMessage'),
        );
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          t('settings.storagePermissionDeniedTitle'),
          t('settings.storagePermissionDeniedMessage'),
        );
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          t('settings.storagePermissionBlockedTitle'),
          t('settings.storagePermissionBlockedMessage'),
        );
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      Alert.alert(
        t('settings.storagePermissionErrorTitle'),
        t('settings.storagePermissionErrorMessage'),
      );
    }
  }, [getStoragePermissionKey, t]);

  const getPermissionStatusText = useCallback(
    (status: string) => {
      switch (status) {
        case RESULTS.GRANTED:
          return t('settings.permissions.granted');
        case RESULTS.DENIED:
          return t('settings.permissions.denied');
        case RESULTS.BLOCKED:
          return t('settings.permissions.blocked');
        case RESULTS.UNAVAILABLE:
          return t('settings.permissions.unavailable');
        default:
          return t('settings.permissions.unknown');
      }
    },
    [t],
  );

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    cameraPermission,
    storagePermission,
    requestCameraPermission,
    requestStoragePermission,
    getPermissionStatusText,
  };
};
