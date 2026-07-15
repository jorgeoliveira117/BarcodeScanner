import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Vibration,
} from 'react-native';
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
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  addBarcodeToSession,
  removeBarcodeFromSession,
  BARCODE_TYPES,
  getSessionById,
  Session,
} from '../utils/storage';
import { AppSettings } from '../utils/settings';
import { setActiveSession, getActiveSessionId } from '../utils/activeSession';
import { requestStoragePermission as requestSharedStoragePermission } from '../utils/permissions';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '../hooks/useAppSettings';
import { useSession } from '../hooks/useSession';
import { useNotification } from '../hooks/useNotification';

const getOrdinalNumber = (num: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

const sanitizeFileNamePart = (value: string): string => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const ScannerScreen = ({ route, navigation }: any) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { settings, loadSettings } = useAppSettings();
  const { session, setSession, loadSession } = useSession();
  const { notification, setNotification, showNotification, hideNotification } =
    useNotification();
  const { sessionId: routeSessionId } = route.params || {};
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    routeSessionId || null,
  );
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Sound refs
  const successSoundRef = useRef<Sound | null>(null);
  const errorSoundRef = useRef<Sound | null>(null);

  const [pendingBarcode, setPendingBarcode] = useState<{
    value: string;
    type: string;
    photoPath?: string;
  } | null>(null);

  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const cameraRef = useRef<Camera>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      loadSettings();
      initializeSounds();

      let sessionIdToUse = routeSessionId;
      console.log(
        '🎯 ScannerScreen mounted with route sessionId:',
        routeSessionId,
      );

      console.log(
        'Session ID is ',
        routeSessionId !== null && routeSessionId !== undefined
          ? 'Valid'
          : 'Null',
      );
      // If no sessionId in route params, check for active session
      if (sessionIdToUse === null || sessionIdToUse === undefined) {
        console.log(
          '🔍 No sessionId in route params, checking for active session...',
        );
        const activeSessionId = await getActiveSessionId();
        console.log('📋 Active session from storage:', activeSessionId);
        sessionIdToUse = activeSessionId;
      }

      if (sessionIdToUse !== null && sessionIdToUse !== undefined) {
        console.log('✅ Using sessionId:', sessionIdToUse);
        setCurrentSessionId(sessionIdToUse);
        // Load the session data
        const sessionData = await loadSession(sessionIdToUse);
        if (sessionData) {
          console.log('📄 Session data loaded:', sessionData.name);
          console.log('🎯 Expected code types:', sessionData.expectedCodeTypes);
        } else {
          console.log('❌ Failed to load session data for ID:', sessionIdToUse);
        }
        // Set this session as the active session when entering
        console.log('🔧 Setting active session to:', sessionIdToUse);
        setActiveSession(sessionIdToUse);
      } else {
        // No session ID provided or found, redirect to sessions list
        console.log('❌ No sessionId provided or found in storage');
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
      }
    };

    initializeSession();
  }, [routeSessionId]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

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
    if (!currentSessionId) {
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

  const showScannerNotification = (
    message: string,
    type: 'success' | 'warning' | 'error' = 'success',
    actions?: Array<{ text: string; onPress: () => void }>,
  ) => {
    showNotification(message, type, actions);

    if (!actions) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
        startScanCooldown();
      }, 3000);
    }
  };

  const hideScannerNotification = () => {
    hideNotification();
    startScanCooldown();
  };

  const startScanCooldown = () => {
    // Clear any existing cooldown
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }

    // Start cooldown based on user settings
    cooldownRef.current = setTimeout(() => {
      setIsScanningActive(true);
      cooldownRef.current = null;
    }, settings.scanCooldown);
  };

  const initializeSounds = () => {
    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback');

    // Try to load success sound, but don't fail if it doesn't exist
    try {
      successSoundRef.current = new Sound(
        'success.wav',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Success sound not found, using system default');
            successSoundRef.current = null;
          }
        },
      );
    } catch (error) {
      console.log('Failed to initialize success sound:', error);
      successSoundRef.current = null;
    }

    // Try to load error sound, but don't fail if it doesn't exist
    try {
      errorSoundRef.current = new Sound(
        'error.wav',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Error sound not found, using system default');
            errorSoundRef.current = null;
          }
        },
      );
    } catch (error) {
      console.log('Failed to initialize error sound:', error);
      errorSoundRef.current = null;
    }
  };

  const playSound = (isError = false) => {
    const soundRef = isError ? errorSoundRef.current : successSoundRef.current;

    if (soundRef && settings.volume > 0) {
      // Set volume based on user settings (0.0 to 1.0)
      soundRef.setVolume(settings.volume);

      // Play the sound
      soundRef.play(success => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    }
  };

  const triggerFeedback = (error = false) => {
    playSound(error);

    if (settings.vibrationEnabled) {
      // Try haptic feedback first (iOS and some Android devices)
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      if (error) {
        ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
      } else {
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      }

      // Fallback vibration for Android devices that don't support haptic feedback
      if (Platform.OS === 'android') {
        Vibration.vibrate(error ? 500 : 200);
      }
    }
  };

  const checkForDuplicateBarcode = async (
    value: string,
  ): Promise<{ isDuplicate: boolean; position?: number }> => {
    if (!currentSessionId) return { isDuplicate: false };

    // Fetch the current session data from storage to ensure we have the latest barcodes
    const currentSession = await getSessionById(currentSessionId);
    if (!currentSession) return { isDuplicate: false };

    const duplicateIndex = currentSession.barcodes.findIndex(
      barcode => barcode.value === value,
    );
    if (duplicateIndex !== -1) {
      // Position is 1-based, and barcodes array has newest first, so position = index + 1
      return { isDuplicate: true, position: duplicateIndex + 1 };
    }

    return { isDuplicate: false };
  };

  const addBarcodeAnyway = async (barcodeData?: {
    value: string;
    type: string;
    photoPath?: string;
  }) => {
    console.log('🔧 addBarcodeAnyway called');
    console.log('📋 pendingBarcode:', pendingBarcode);
    if (!barcodeData || !currentSessionId) return;

    try {
      // Trigger haptic feedback for successful scan
      triggerFeedback();

      await addBarcodeToSession(currentSessionId, {
        value: barcodeData.value,
        type: barcodeData.type as any,
        timestamp: new Date().toISOString(),
        photoPath: barcodeData.photoPath,
      });

      await refreshSession();

      // Get the updated session data for photo status message
      const updatedSession = await getSessionById(currentSessionId);
      const photoStatus = updatedSession?.autosavePictures
        ? barcodeData.photoPath
          ? ` ${t('scanner.scannedBarcode.photoSuccess')}`
          : ` ${t('scanner.scannedBarcode.photoError')}`
        : '';

      showNotification(
        `${t('scanner.addBarcodeAnyways.success')}${photoStatus}`,
        'success',
      );
      setPendingBarcode(null);
    } catch (error) {
      triggerFeedback(true);
      console.error('Error adding barcode to session:', error);
      showNotification(t('scanner.addBarcodeAnyways.error'), 'error');
      setPendingBarcode(null);
      startScanCooldown();
    }
  };

  const ignorePendingBarcode = () => {
    setPendingBarcode(null);
    startScanCooldown();
  };

  const handleDeleteLatestBarcode = async () => {
    if (!session || !currentSessionId || session.barcodes.length === 0) {
      return;
    }

    const latestBarcode = session.barcodes[0]; // Most recent is first in array

    Alert.alert(
      t('scanner.deleteBarcode.title'),
      t('scanner.deleteBarcode.message', {
        type: latestBarcode.type,
        value: latestBarcode.value,
      }),
      [
        {
          text: t('alert.cancel'),
          style: 'cancel',
        },
        {
          text: t('alert.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBarcodeFromSession(
                currentSessionId,
                latestBarcode.id,
              );
              await refreshSession(); // Refresh session data
              showNotification(t('scanner.deleteBarcode.success'), 'success');
            } catch (error) {
              console.error('Error deleting barcode:', error);
              showNotification(t('scanner.deleteBarcode.error'), 'error');
            }
          },
        },
      ],
    );
  };

  const createAppFolder = async () => {
    try {
      let folderPath;
      if (session) {
        // Create session-specific folder
        folderPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/BarcodeScanner/${session.folderName}`;
      } else {
        // Fallback to general app folder
        folderPath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/BarcodeScanner`;
      }

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

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check camera permission (required)
        const cameraPermission = await Camera.getCameraPermissionStatus();
        console.log('Current camera permission:', cameraPermission);

        // Check storage permission (optional, for photo saving)
        const storagePermission = await requestStoragePermission();

        if (cameraPermission === 'granted') {
          setHasCameraPermission(true);
        } else if (cameraPermission === 'not-determined') {
          const newCameraPermission = await Camera.requestCameraPermission();
          console.log('New camera permission:', newCameraPermission);
          setHasCameraPermission(newCameraPermission === 'granted');
        } else {
          // Camera permission was denied
          setHasCameraPermission(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasCameraPermission(false);
      }
    };
    checkPermissions();
  }, []);

  const capturePhoto = async (namePart: string = 'barcode') => {
    try {
      if (cameraRef.current) {
        // Take the photo
        const photo = await cameraRef.current.takePhoto();

        // Create a unique filename using the provided base name
        const timestamp = new Date().getTime();
        const safeNamePart = sanitizeFileNamePart(namePart) || 'barcode';
        const filename = `${safeNamePart}_${timestamp}.jpg`;

        let destPath;
        if (hasStoragePermission && Platform.OS === 'android') {
          // Save to external storage (gallery) if permission is granted
          const folderPath = await createAppFolder();
          if (folderPath) {
            destPath = `${folderPath}/${filename}`;
          } else {
            // Fallback to app documents
            destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
          }
        } else {
          // Default to app documents
          destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
        }

        // Move the photo from temp location to destination
        await RNFS.moveFile(photo.path, destPath);

        console.log('Photo saved to:', destPath);

        // If saved to external storage, scan for media to make it visible in gallery
        if (
          hasStoragePermission &&
          Platform.OS === 'android' &&
          destPath.includes('Pictures/BarcodeScanner')
        ) {
          try {
            // Trigger media scanner to make the image appear in gallery
            await RNFS.scanFile(destPath);
            console.log('Image scanned for gallery visibility');
          } catch (scanError) {
            console.log('Media scan failed, but photo is saved:', scanError);
          }
        }

        return destPath;
      }
    } catch (error) {
      console.error('Error capturing/saving photo:', error);
      return null;
    }
    return null;
  };

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
    onCodeScanned: async codes => {
      console.log('🔍 Code scanner triggered');
      console.log('📊 Scanning active:', isScanningActive);
      console.log('📋 Session:', session ? 'exists' : 'null');
      console.log('🆔 Current session ID:', currentSessionId);

      if (
        !isScanningActive ||
        !session ||
        currentSessionId === null ||
        currentSessionId === undefined
      ) {
        console.log('❌ Scanning blocked - one of the conditions failed');
        return;
      }

      if (codes.length > 0 && isScanningActive) {
        console.log('✅ Code detected, processing...');
        const scannedCode = codes[0];
        setIsScanningActive(false);

        const barcodeValue = scannedCode.value || '';
        const barcodeType = scannedCode.type || 'unknown';

        // Check for duplicate barcode
        const duplicateResult = await checkForDuplicateBarcode(barcodeValue);

        // Get current session data to ensure we have the latest settings
        const currentSession = await getSessionById(currentSessionId);
        if (!currentSession) {
          console.log('❌ Failed to get current session data');
          startScanCooldown();
          return;
        }

        // Check if the scanned barcode type is expected for this session
        const isExpectedType =
          barcodeType !== 'unknown' &&
          currentSession.expectedCodeTypes.includes(barcodeType);

        // Capture photo when barcode is detected (if auto-save is enabled)
        let photoPath = null;
        if (currentSession.autosavePictures) {
          photoPath = await capturePhoto(barcodeValue);
        }

        // Handle duplicate barcodes
        if (duplicateResult.isDuplicate) {
          const currentBarcodeData = {
            value: barcodeValue,
            type: barcodeType,
            photoPath: photoPath || undefined,
          };
          triggerFeedback(true);

          Alert.alert(
            t('scanner.duplicateBarcode.title'),
            t('scanner.duplicateBarcode.message', {
              value: barcodeValue,
              type: scannedCode.type,
              position:
                i18n.language === 'en'
                  ? getOrdinalNumber(duplicateResult.position || 0)
                  : duplicateResult.position || 0,
            }),
            [
              {
                text: t('scanner.duplicateBarcode.addAnyways'),
                onPress: () => {
                  addBarcodeAnyway(currentBarcodeData);
                },
              },
              {
                text: t('scanner.duplicateBarcode.ignore'),
                onPress: () => ignorePendingBarcode(),
              },
            ],
          );
          return;
        }

        // Handle unexpected barcode types
        if (!isExpectedType) {
          const currentBarcodeData = {
            value: barcodeValue,
            type: barcodeType,
            photoPath: photoPath || undefined,
          };
          triggerFeedback(true);

          Alert.alert(
            t('scanner.unexpectedBarcode.title'),
            t('scanner.unexpectedBarcode.message', {
              type: scannedCode.type,
              value: scannedCode.value,
            }),
            [
              {
                text: t('scanner.unexpectedBarcode.addAnyways'),
                onPress: () => {
                  addBarcodeAnyway(currentBarcodeData);
                },
              },
              {
                text: t('scanner.unexpectedBarcode.ignore'),
                onPress: () => ignorePendingBarcode(),
              },
            ],
          );
          return;
        }

        // Normal case - add barcode directly
        try {
          // Trigger haptic feedback for successful scan
          triggerFeedback();

          await addBarcodeToSession(currentSessionId, {
            value: barcodeValue,
            type: barcodeType as any,
            timestamp: new Date().toISOString(),
            photoPath: photoPath || undefined,
          });

          // Reload session to get updated barcode count
          await refreshSession();

          // Get the updated session data for photo status message
          const updatedSession = await getSessionById(currentSessionId);
          const photoStatus = updatedSession?.autosavePictures
            ? photoPath
              ? ` ${t('scanner.scannedBarcode.photoSuccess')}`
              : ` ${t('scanner.scannedBarcode.photoError')}`
            : '';

          showNotification(
            `${t(
              'scanner.scannedBarcode.success',
            )} ${barcodeType}${photoStatus}`,
            'success',
          );
        } catch (error) {
          console.error('Error saving barcode to session:', error);
          triggerFeedback(true);
          showNotification(t('scanner.scannedBarcode.error'), 'error');
        }
      }
    },
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
        isActive={isActive}
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
          <View style={styles(theme).buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles(theme).backButton}
            >
              {t('scanner.back')}
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate('History', { sessionId: currentSessionId })
              }
              style={styles(theme).historyButton}
              textColor="#fff"
            >
              {t('scanner.viewHistory')}
            </Button>
          </View>
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
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    manualPhotoButton: {
      marginTop: 8,
    },
    historyButton: {
      flex: 1,
    },
    backButton: {
      flex: 1,
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
