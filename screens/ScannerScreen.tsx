import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Animated,
  Vibration,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Button, Text, Card, Snackbar } from 'react-native-paper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  addBarcodeToSession,
  removeBarcodeFromSession,
  BARCODE_TYPES,
  getSessionById,
  Session,
} from '../utils/storage';
import { getSettings, AppSettings } from '../utils/settings';
import { setActiveSession } from '../utils/activeSession';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const ScannerScreen = ({ route, navigation }: any) => {
  const { sessionId } = route.params || {};
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    volume: 0.5,
    scanCooldown: 3000,
    vibrationEnabled: true,
    language: 'en',
  });
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Sound refs
  const successSoundRef = useRef<Sound | null>(null);
  const errorSoundRef = useRef<Sound | null>(null);

  // Notification system state
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'warning' | 'error';
    actions?: Array<{ text: string; onPress: () => void }>;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });
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
    loadSettings();
    initializeSounds();

    if (sessionId) {
      loadSession();
      // Set this session as the active session when entering
      setActiveSession(sessionId);
    } else {
      // No session ID provided, redirect to sessions list
      Alert.alert(
        'No Session Selected',
        'Please select a session to start scanning.',
        [
          {
            text: 'Go to Sessions',
            onPress: () => navigation.replace('SessionsList'),
          },
        ],
      );
    }
  }, [sessionId]);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  const loadSession = async () => {
    if (!sessionId) return;

    const sessionData = await getSessionById(sessionId);
    if (sessionData) {
      setSession(sessionData);
    } else {
      Alert.alert(
        'Session Not Found',
        'The selected session could not be found.',
        [
          {
            text: 'Go to Sessions',
            onPress: () => navigation.replace('SessionsList'),
          },
        ],
      );
    }
  };

  // Helper functions for the new notification system
  const showNotification = (
    message: string,
    type: 'success' | 'warning' | 'error' = 'success',
    actions?: Array<{ text: string; onPress: () => void }>,
  ) => {
    setNotification({
      visible: true,
      message,
      type,
      actions,
    });

    // Auto-hide notification after 3 seconds if no actions
    if (!actions) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
        startScanCooldown();
      }, 3000);
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
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

    // Load success sound (beep)
    successSoundRef.current = new Sound(
      'success.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load success sound', error);
          // Fallback to system sound
          successSoundRef.current = new Sound(
            'beep.wav',
            Sound.MAIN_BUNDLE,
            fallbackError => {
              if (fallbackError) {
                console.log(
                  'Failed to load fallback success sound',
                  fallbackError,
                );
                successSoundRef.current = null;
              }
            },
          );
        }
      },
    );

    // Load error sound
    errorSoundRef.current = new Sound(
      'error-sound.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load error sound', error);
          // Fallback to system sound
          errorSoundRef.current = new Sound(
            'error.wav',
            Sound.MAIN_BUNDLE,
            fallbackError => {
              if (fallbackError) {
                console.log(
                  'Failed to load fallback error sound',
                  fallbackError,
                );
                errorSoundRef.current = null;
              }
            },
          );
        }
      },
    );
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

  const checkForDuplicateBarcode = (value: string): boolean => {
    if (!session) return false;
    return session.barcodes.some(barcode => barcode.value === value);
  };

  const addBarcodeAnyway = async (barcodeData?: {
    value: string;
    type: string;
    photoPath?: string;
  }) => {
    console.log('🔧 addBarcodeAnyway called');
    console.log('📋 pendingBarcode:', pendingBarcode);
    if (!barcodeData || !sessionId) return;

    try {
      // Trigger haptic feedback for successful scan
      triggerFeedback();

      await addBarcodeToSession(sessionId, {
        value: barcodeData.value,
        type: barcodeData.type as any,
        timestamp: new Date().toISOString(),
        photoPath: barcodeData.photoPath,
      });

      await loadSession();
      showNotification('✅ Barcode added to session!', 'success');
      setPendingBarcode(null);
    } catch (error) {
      triggerFeedback(true);
      console.error('Error adding barcode to session:', error);
      showNotification('❌ Failed to add barcode', 'error');
      setPendingBarcode(null);
      startScanCooldown();
    }
  };

  const ignorePendingBarcode = () => {
    setPendingBarcode(null);
    startScanCooldown();
  };

  const handleDeleteLatestBarcode = async () => {
    if (!session || !sessionId || session.barcodes.length === 0) {
      return;
    }

    const latestBarcode = session.barcodes[0]; // Most recent is first in array

    Alert.alert(
      'Delete Barcode',
      `Are you sure you want to delete this barcode?\n\nType: ${latestBarcode.type}\nValue: ${latestBarcode.value}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBarcodeFromSession(sessionId, latestBarcode.id);
              await loadSession(); // Refresh session data
              showNotification('🗑️ Barcode deleted successfully', 'success');
            } catch (error) {
              console.error('Error deleting barcode:', error);
              showNotification('❌ Failed to delete barcode', 'error');
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
    if (Platform.OS === 'android') {
      try {
        console.log('Requesting storage permission...');

        // For Android 13+ (API 33+), we need READ_MEDIA_IMAGES instead of WRITE_EXTERNAL_STORAGE
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        console.log('Using permission:', permission);

        // First check if we already have permission
        const currentPermission = await PermissionsAndroid.check(permission);
        console.log('Current permission status:', currentPermission);

        if (currentPermission) {
          console.log('Storage permission already granted');
          setHasStoragePermission(true);
          return true;
        }

        // If not, request permission
        console.log('Requesting new permission...');
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Storage Permission',
          message:
            'This app needs access to storage to save photos of scanned barcodes',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        console.log('Permission request result:', granted);
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Final permission status:', hasPermission);

        setHasStoragePermission(hasPermission);

        // Show feedback to user
        if (hasPermission) {
          Alert.alert(
            'Success',
            'Photo saving enabled! Photos will now be saved when scanning barcodes.',
          );
        } else {
          Alert.alert(
            'Permission Denied',
            'Photos will not be saved. You can enable this later in app settings.',
          );
        }

        return hasPermission;
      } catch (err) {
        console.warn('Storage permission error:', err);
        Alert.alert('Error', 'Failed to request storage permission');
        setHasStoragePermission(false);
        return false;
      }
    }

    // iOS doesn't need explicit storage permission for app documents
    console.log('iOS detected - setting storage permission to true');
    setHasStoragePermission(true);
    return true;
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

  const capturePhoto = async () => {
    try {
      if (cameraRef.current) {
        // Take the photo
        const photo = await cameraRef.current.takePhoto();

        // Create a unique filename
        const timestamp = new Date().getTime();
        const filename = `barcode_${timestamp}.jpg`;

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

  const getActiveCodeTypes = () => {
    if (!session || !session.codesToIgnore) {
      // If no session, use all available types
      return BARCODE_TYPES;
    }

    return BARCODE_TYPES.filter(type => !session.codesToIgnore.includes(type));
  };

  const codeScanner = useCodeScanner({
    codeTypes: getActiveCodeTypes(),
    onCodeScanned: async codes => {
      if (!isScanningActive || !session || !sessionId) return;

      if (codes.length > 0 && isScanningActive) {
        const scannedCode = codes[0];
        setIsScanningActive(false);

        const barcodeValue = scannedCode.value || '';
        const barcodeType = scannedCode.type || 'unknown';

        // Check for duplicate barcode
        const isDuplicate = checkForDuplicateBarcode(barcodeValue);

        // Check if the scanned barcode type is expected for this session
        const isExpectedType =
          barcodeType !== 'unknown' &&
          session.expectedCodeTypes.includes(barcodeType);

        // Capture photo when barcode is detected (if auto-save is enabled)
        let photoPath = null;
        if (session.autosavePictures) {
          photoPath = await capturePhoto();
        }

        // Handle duplicate barcodes
        if (isDuplicate) {
          const currentBarcodeData = {
            value: barcodeValue,
            type: barcodeType,
            photoPath: photoPath || undefined,
          };
          triggerFeedback(true);

          Alert.alert(
            `⚠️ Duplicate barcode found!\nValue: ${barcodeValue}`,
            `Type: ${scannedCode.type}\nValue: ${scannedCode.value}`,
            [
              {
                text: 'Add Anyways',
                onPress: () => {
                  addBarcodeAnyway(currentBarcodeData);
                },
              },
              {
                text: 'Ignore Code',
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
            `⚠️ Unexpected barcode type: ${barcodeType}\nValue: ${barcodeValue}`,
            `Type: ${scannedCode.type}\nValue: ${scannedCode.value}`,
            [
              {
                text: 'Add Anyways',
                onPress: () => {
                  addBarcodeAnyway(currentBarcodeData);
                },
              },
              {
                text: 'Ignore Code',
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

          await addBarcodeToSession(sessionId, {
            value: barcodeValue,
            type: barcodeType as any,
            timestamp: new Date().toISOString(),
            photoPath: photoPath || undefined,
          });

          // Reload session to get updated barcode count
          await loadSession();

          const photoStatus = session.autosavePictures
            ? photoPath
              ? ' 📷'
              : ' ⚠️ Photo failed'
            : '';

          showNotification(
            `✅ Barcode added! ${barcodeType}${photoStatus}`,
            'success',
          );
        } catch (error) {
          console.error('Error saving barcode to session:', error);
          triggerFeedback(true);
          showNotification(
            '❌ Failed to save barcode. Please try again.',
            'error',
          );
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
          'Camera Ready',
          "Camera permission granted! Storage permission was denied - you can scan barcodes but photos won't be saved.",
        );
      } else if (!cameraGranted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is required to scan barcodes.',
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan barcodes
        </Text>
        <Text style={styles.permissionSubtext}>
          Camera: Required for barcode scanning{'\n'}
          Storage: Optional for saving photos
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          Grant Camera Permission
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.permissionButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No camera device found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
        photo={true}
      />
      <View style={styles.overlay}>
        {session && (
          <Card style={styles.sessionInfoCard}>
            <Card.Content style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionProgress}>
                {session.barcodes.length} / {session.expectedCodes} barcodes
              </Text>
              <Text style={styles.expectedTypes}>
                Expected: {session.expectedCodeTypes.join(', ')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {session && session.barcodes.length > 0 && (
          <Card style={styles.latestBarcodeCard}>
            <Card.Content style={styles.latestBarcodeContent}>
              <View style={styles.latestBarcodeHeader}>
                <Text style={styles.latestBarcodeTitle}>Latest Scan</Text>
                <Button
                  mode="outlined"
                  onPress={handleDeleteLatestBarcode}
                  style={styles.deleteButton}
                  buttonColor="rgba(244, 67, 54, 0.1)"
                  textColor="#f44336"
                  icon="delete"
                  compact
                >
                  Delete
                </Button>
              </View>
              <View style={styles.latestBarcodeInfo}>
                <Text style={styles.latestBarcodeType}>
                  {session.barcodes[0].type.toUpperCase()}
                </Text>
                <Text style={styles.latestBarcodeValue} numberOfLines={2}>
                  {session.barcodes[0].value}
                </Text>
                <Text style={styles.latestBarcodeTime}>
                  {new Date(session.barcodes[0].timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea} />
          <Text style={styles.instructionText}>
            Point your camera at a barcode
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('History', { sessionId })}
            style={styles.historyButton}
            textColor="#fff"
          >
            View History
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back
          </Button>
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
          styles.snackbar,
          notification.type === 'error' && styles.errorSnackbar,
          notification.type === 'warning' && styles.warningSnackbar,
          notification.type === 'success' && styles.successSnackbar,
        ]}
      >
        <View style={styles.snackbarContent}>
          <Text style={styles.snackbarText}>{notification.message}</Text>
          {notification.actions && notification.actions.length > 1 && (
            <View style={styles.snackbarActions}>
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  mode="text"
                  onPress={action.onPress}
                  textColor="#fff"
                  style={styles.snackbarActionButton}
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

const styles = StyleSheet.create({
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
    paddingVertical: 50,
  },
  sessionInfoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  sessionInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sessionName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sessionProgress: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  expectedTypes: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  latestBarcodeCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  latestBarcodeInfo: {
    alignItems: 'flex-start',
  },
  latestBarcodeType: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  latestBarcodeValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  latestBarcodeTime: {
    color: '#ccc',
    fontSize: 10,
  },
  scanAreaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  historyButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: '#fff',
  },
  backButton: {
    flex: 1,
  },
  storageButton: {
    position: 'absolute',
    bottom: 100,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  storageButtonLabel: {
    color: '#fff',
    fontSize: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  permissionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  permissionButton: {
    marginVertical: 8,
    paddingVertical: 5,
    minWidth: 200,
  },
  // Notification system styles
  snackbar: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 8,
  },
  errorSnackbar: {
    backgroundColor: '#d32f2f',
  },
  warningSnackbar: {
    backgroundColor: '#f57c00',
  },
  successSnackbar: {
    backgroundColor: '#2e7d32',
  },
  snackbarContent: {
    flexDirection: 'column',
  },
  snackbarText: {
    color: '#fff',
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
