import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Button, Text } from 'react-native-paper';
import { saveBarcodeToStorage } from '../utils/storage';
import RNFS from 'react-native-fs';

const ScannerScreen = ({ navigation }: any) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const cameraRef = useRef<Camera>(null);

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

        // Define the destination path in app's document directory
        const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

        // Move the photo from temp location to app documents
        await RNFS.moveFile(photo.path, destPath);

        console.log('Photo saved to:', destPath);
        return destPath;
      }
    } catch (error) {
      console.error('Error capturing/saving photo:', error);
      return null;
    }
    return null;
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'upc-a',
      'upc-e',
    ],
    onCodeScanned: async codes => {
      if (codes.length > 0 && isActive) {
        const scannedCode = codes[0];
        setIsActive(false);

        // Capture photo when barcode is detected
        const photoPath = await capturePhoto();

        await saveBarcodeToStorage({
          value: scannedCode.value || '',
          type: scannedCode.type || '',
          timestamp: new Date().toISOString(),
          photoPath: photoPath || undefined,
        });
        Alert.alert(
          'Barcode Scanned!',
          `Type: ${scannedCode.type}\nValue: ${scannedCode.value}${
            photoPath ? '\n📷 Photo saved!' : '\n⚠️ Photo save failed'
          }`,
          [
            {
              text: 'Scan Another',
              onPress: () => setIsActive(true),
            },
            {
              text: 'Go to History',
              onPress: () => navigation.navigate('History'),
            },
          ],
        );
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
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>
          Point your camera at a barcode
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back to Home
        </Button>
      </View>
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
  backButton: {
    position: 'absolute',
    bottom: 50,
    marginHorizontal: 20,
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
});

export default ScannerScreen;
