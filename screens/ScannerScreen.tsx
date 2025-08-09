import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Button, Text } from 'react-native-paper';
import { saveBarcodeToStorage } from '../utils/storage';

const ScannerScreen = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  useEffect(() => {
    const checkPermissions = async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission === 'granted') {
        setHasPermission(true);
      } else {
        const newCameraPermission = await Camera.requestCameraPermission();
        setHasPermission(newCameraPermission === 'granted');
      }
    };
    checkPermissions();
  }, []);

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
    onCodeScanned: codes => {
      if (codes.length > 0 && isActive) {
        const scannedCode = codes[0];
        setIsActive(false);

        saveBarcodeToStorage({
          value: scannedCode.value || '',
          type: scannedCode.type || '',
          timestamp: new Date().toISOString(),
        });

        Alert.alert(
          'Barcode Scanned!',
          `Type: ${scannedCode.type}\nValue: ${scannedCode.value}`,
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

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required to scan barcodes</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
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
        style={styles.camera}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
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
});

export default ScannerScreen;
