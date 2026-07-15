import { Alert, PermissionsAndroid, Platform } from 'react-native';

export interface StoragePermissionMessages {
  title: string;
  message: string;
  askMeLater: string;
  cancel: string;
  ok: string;
  denyTitle: string;
  denyMessage: string;
  errorTitle: string;
  errorMessage: string;
  successTitle?: string;
  successMessage?: string;
}

export interface StoragePermissionOptions {
  showDeniedAlert?: boolean;
  showErrorAlert?: boolean;
  showSuccessAlert?: boolean;
}

export const requestStoragePermission = async (
  messages: StoragePermissionMessages,
  options: StoragePermissionOptions = {},
): Promise<boolean> => {
  const {
    showDeniedAlert = true,
    showErrorAlert = true,
    showSuccessAlert = false,
  } = options;

  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) {
      return true;
    }

    const granted = await PermissionsAndroid.request(permission, {
      title: messages.title,
      message: messages.message,
      buttonNeutral: messages.askMeLater,
      buttonNegative: messages.cancel,
      buttonPositive: messages.ok,
    });

    const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;

    if (
      hasPermission &&
      showSuccessAlert &&
      messages.successTitle &&
      messages.successMessage
    ) {
      Alert.alert(messages.successTitle, messages.successMessage);
    }

    if (!hasPermission && showDeniedAlert) {
      Alert.alert(messages.denyTitle, messages.denyMessage);
    }

    return hasPermission;
  } catch (error) {
    console.warn('Storage permission error:', error);
    if (showErrorAlert) {
      Alert.alert(messages.errorTitle, messages.errorMessage);
    }
    return false;
  }
};
