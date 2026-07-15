import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import {
  Button,
  Text,
  Snackbar,
  useTheme,
  ProgressBar,
} from 'react-native-paper';
import { BARCODE_TYPES } from '../utils/storage';
import { requestStoragePermission as requestSharedStoragePermission } from '../utils/permissions';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '../hooks/useAppSettings';
import { useSession } from '../hooks/useSession';
import { useNotification } from '../hooks/useNotification';
import { useAudioHaptics } from '../hooks/useAudioHaptics';
import { useScannerBarcodeProcessor } from '../hooks/useScannerBarcodeProcessor';
import { usePhotoCapture } from '../hooks/usePhotoCapture';
import { usePermissions } from '../hooks/usePermissions';
import { useScannerSessionBootstrap } from '../hooks/useScannerSessionBootstrap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import TwoActionButtonsRow from '../components/TwoActionButtonsRow';

type ScannerScreenProps = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

const sanitizeFileNamePart = (value: string): string => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const ScannerScreen = ({ route, navigation }: ScannerScreenProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { settings, loadSettings } = useAppSettings();
  const { session, loadSession } = useSession();
  const { notification, showNotification, hideNotification } =
    useNotification();
  const { initializeSounds, triggerFeedback } = useAudioHaptics(settings);
  const { sessionId: routeSessionId } = route.params || {};

  const { currentSessionId } = useScannerSessionBootstrap({
    routeSessionId,
    loadSettings,
    initializeSounds,
    loadSession,
    onNoSessionSelected: () => {
      Alert.alert(
        t('scanner.noSessionSelected.title'),
        t('scanner.noSessionSelected.message'),
        [
          {
            text: t('scanner.noSessionSelected.goToSessions'),
            onPress: () => navigation.replace('SessionsList'),
          },
        ],
      );
    },
  });

  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const cameraRef = useRef<Camera>(null);

  // Debug effect to track session updates
  useEffect(() => {
    if (session) {
      console.log(
        '📊 Session updated, barcode count:',
        session.barcodes.length,
      );
      if (session.barcodes.length > 0) {
        console.log('🔍 Latest barcode:', session.barcodes[0].value);
      }
    }
  }, [session]);

  const refreshSession = async () => {
    if (currentSessionId === null || currentSessionId === undefined) {
      return null;
    }

    const sessionData = await loadSession(currentSessionId);
    if (!sessionData) {
      Alert.alert(
        t('scanner.sessionNotFound.title'),
        t('scanner.sessionNotFound.message'),
        [
          {
            text: t('scanner.sessionNotFound.goToSessions'),
            onPress: () => navigation.replace('SessionsList'),
          },
        ],
      );
    }

    return sessionData;
  };

  const requestStoragePermission = async () => {
    console.log('Requesting storage permission...');
    const hasPermission = await requestSharedStoragePermission(
      {
        title: t('scanner.permissions.storage.title'),
        message: t('scanner.permissions.storage.message'),
        askMeLater: t('scanner.permissions.storage.askMeLater'),
        cancel: t('alert.cancel'),
        ok: t('alert.ok'),
        denyTitle: t('scanner.permissions.storage.denyTitle'),
        denyMessage: t('scanner.permissions.storage.denyMessage'),
        errorTitle: t('scanner.permissions.storage.errorTitle'),
        errorMessage: t('scanner.permissions.storage.errorMessage'),
        successTitle: t('scanner.permissions.storage.successTitle'),
        successMessage: t('scanner.permissions.storage.successMessage'),
      },
      {
        showDeniedAlert: true,
        showErrorAlert: true,
        showSuccessAlert: true,
      },
    );

    console.log('Final permission status:', hasPermission);
    setHasStoragePermission(hasPermission);
    return hasPermission;
  };

  const {
    hasCameraPermission,
    hasStoragePermission,
    setHasCameraPermission,
    setHasStoragePermission,
    checkCameraAndStoragePermissions,
  } = usePermissions({ requestStoragePermission });
  const { capturePhoto } = usePhotoCapture({
    cameraRef,
    hasStoragePermission,
    session,
    sanitizeFileNamePart,
  });
  const { onCodeScanned, handleDeleteLatestBarcode } =
    useScannerBarcodeProcessor({
      currentSessionId,
      session,
      scanCooldown: settings.scanCooldown,
      language: i18n.language,
      capturePhoto,
      triggerFeedback,
      showNotification,
      refreshSession,
      t,
    });

  useEffect(() => {
    checkCameraAndStoragePermissions();
  }, [checkCameraAndStoragePermissions]);

  const handleManualPhotoCapture = async () => {
    const lastScannedBarcode = session?.barcodes?.[0]?.value;

    if (!lastScannedBarcode) {
      Alert.alert(t('alert.error'), 'No scanned barcode found yet.');
      return;
    }

    const manualPhotoPath = await capturePhoto(`${lastScannedBarcode}_back`);

    if (manualPhotoPath) {
      showNotification('Back photo saved successfully', 'success');
    } else {
      showNotification('Failed to save back photo', 'error');
    }
  };

  const getActiveCodeTypes = () => {
    if (!session || !session.codesToIgnore) {
      // If no session, use all available types
      console.log('🔄 Using all barcode types:', BARCODE_TYPES);
      return BARCODE_TYPES;
    }

    const activeTypes = BARCODE_TYPES.filter(
      type => !session.codesToIgnore.includes(type),
    );
    console.log('🎯 Using filtered barcode types:', activeTypes);
    console.log('🚫 Ignoring types:', session.codesToIgnore);
    return activeTypes;
  };

  const codeScanner = useCodeScanner({
    codeTypes: getActiveCodeTypes(),
    onCodeScanned,
  });

  const requestPermission = async () => {
    try {
      // Request camera permission (required)
      const cameraPermission = await Camera.requestCameraPermission();
      console.log('Manual camera permission request result:', cameraPermission);

      // Request storage permission (optional)
      const storagePermission = await requestStoragePermission();

      const cameraGranted = cameraPermission === 'granted';
      setHasCameraPermission(cameraGranted);

      if (cameraGranted && !storagePermission) {
        Alert.alert(
          t('scanner.permissions.camera.grantedTitle'),
          t('scanner.permissions.camera.grantedMessage'),
        );
      } else if (!cameraGranted) {
        Alert.alert(
          t('scanner.permissions.camera.deniedTitle'),
          t('scanner.permissions.camera.deniedMessage'),
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles(theme).permissionContainer}>
        <Text style={styles(theme).permissionText}>
          {t('scanner.permissions.camera.requestTitle')}
        </Text>
        <Text style={styles(theme).permissionSubtext}>
          {t('scanner.permissions.camera.requestMessage')}
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles(theme).permissionButton}
        >
          {t('scanner.permissions.camera.requestGrant')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles(theme).permissionButton}
        >
          {t('scanner.permissions.camera.goBack')}
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles(theme).container}>
        <Text>{t('scanner.permissions.camera.noDevice')}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          {t('scanner.permissions.camera.goBack')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Camera
        ref={cameraRef}
        style={styles(theme).camera}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        photo={true}
      />
      <View style={styles(theme).overlay}>
        {session && (
          <View style={styles(theme).sessionInfoCard}>
            <ProgressBar
              progress={session.barcodes.length / session.expectedCodes}
              color={
                session.barcodes.length >= session.expectedCodes
                  ? '#70A288'
                  : theme.colors.primary
              }
              style={styles(theme).progressBar}
            />
            <View style={styles(theme).row}>
              <Text style={styles(theme).sessionName}>{session.name}</Text>
              <Text style={styles(theme).sessionProgress}>
                {session.barcodes.length} / {session.expectedCodes}{' '}
                {t('scanner.barcodes')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles(theme).scanAreaContainer}>
          <View style={styles(theme).scanArea} />
        </View>

        <View style={styles(theme).bottomContainer}>
          {session && session.barcodes.length > 0 && (
            <View style={styles(theme).latestBarcodeContainer}>
              <View style={styles(theme).latestBarcodeHeader}>
                <Text style={styles(theme).latestBarcodeTitle}>
                  {t('scanner.latestScan')}
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleDeleteLatestBarcode}
                  style={styles(theme).deleteButton}
                  buttonColor="rgba(244, 67, 54, 0.1)"
                  textColor="#f44336"
                  icon="delete"
                  compact
                >
                  {t('scanner.delete')}
                </Button>
              </View>
              <View style={styles(theme).latestBarcodeInfo}>
                <View style={styles(theme).latestBarcodeCol}>
                  <Text style={styles(theme).latestBarcodeType}>
                    {session.barcodes[0].type.toUpperCase()}
                  </Text>
                  <Text
                    style={styles(theme).latestBarcodeValue}
                    numberOfLines={2}
                  >
                    {session.barcodes[0].value}
                  </Text>
                </View>
                <Text style={styles(theme).latestBarcodeTime}>
                  {new Date(session.barcodes[0].timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          )}
          <Button
            mode="outlined"
            onPress={handleManualPhotoCapture}
            style={styles(theme).manualPhotoButton}
            icon="camera"
            textColor="#fff"
          >
            {t('scanner.takeBackPicture')}
          </Button>
          <TwoActionButtonsRow
            left={{
              label: t('scanner.back'),
              mode: 'contained',
              onPress: () => navigation.goBack(),
            }}
            right={{
              label: t('scanner.viewHistory'),
              mode: 'outlined',
              textColor: '#fff',
              onPress: () => {
                if (
                  currentSessionId !== null &&
                  currentSessionId !== undefined
                ) {
                  navigation.navigate('History', {
                    sessionId: currentSessionId,
                  });
                }
              },
            }}
          />
        </View>
      </View>

      {/* Notification System */}
      <Snackbar
        visible={notification.visible}
        onDismiss={hideNotification}
        duration={notification.actions ? 0 : 3000} // Don't auto-hide if actions are present
        action={
          notification.actions
            ? {
                label: notification.actions[0].text,
                onPress: notification.actions[0].onPress,
              }
            : undefined
        }
        style={[
          styles(theme).snackbar,
          notification.type === 'error' && styles(theme).errorSnackbar,
          notification.type === 'warning' && styles(theme).warningSnackbar,
          notification.type === 'success' && styles(theme).successSnackbar,
        ]}
      >
        <View style={styles(theme).snackbarContent}>
          <Text style={styles(theme).snackbarText}>{notification.message}</Text>
          {notification.actions && notification.actions.length > 1 && (
            <View style={styles(theme).snackbarActions}>
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  mode="text"
                  onPress={action.onPress}
                  textColor="#fff"
                  style={styles(theme).snackbarActionButton}
                >
                  {action.text}
                </Button>
              ))}
            </View>
          )}
        </View>
      </Snackbar>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sessionInfoCard: {
      backgroundColor: 'rgba(38, 109, 211, 0.3)',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      marginHorizontal: 20,
      paddingBottom: 12,
      width: '100%',
    },
    sessionInfo: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    progressBar: {
      flex: 1,
      height: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginBottom: 8,
    },
    sessionName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    sessionProgress: {
      color: theme.colors.text,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 4,
    },
    latestBarcodeContainer: {
      borderRadius: 8,
    },
    latestBarcodeContent: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    latestBarcodeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    latestBarcodeTitle: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    deleteButton: {
      borderColor: theme.colors.error,
      borderWidth: 1,
    },
    latestBarcodeInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    latestBarcodeCol: {
      gap: 1,
    },
    latestBarcodeType: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    latestBarcodeValue: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    latestBarcodeTime: {
      color: theme.colors.text,
      fontSize: 10,
    },
    scanAreaContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanArea: {
      width: 250,
      height: 250,
      borderWidth: 1,
      borderColor: '#ffffff7c',
      borderRadius: 32,
      backgroundColor: 'transparent',
    },
    bottomContainer: {
      width: '100%',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 4,
      backgroundColor: theme.colors.background,
    },
    manualPhotoButton: {
      marginTop: 8,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    permissionText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: theme.colors.text,
    },
    permissionSubtext: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 30,
      color: theme.colors.text,
    },
    permissionButton: {
      marginVertical: 8,
      paddingVertical: 5,
      minWidth: 200,
    },
    // Notification system styles
    snackbar: {
      position: 'absolute',
      bottom: 200,
      left: 16,
      right: 16,
      borderRadius: 8,
    },
    errorSnackbar: {
      backgroundColor: theme.colors.error,
    },
    warningSnackbar: {
      backgroundColor: theme.colors.warning,
    },
    successSnackbar: {
      backgroundColor: theme.colors.success,
    },
    snackbarContent: {
      flexDirection: 'column',
    },
    snackbarText: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 18,
    },
    snackbarActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      gap: 8,
    },
    snackbarActionButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  });

export default ScannerScreen;
