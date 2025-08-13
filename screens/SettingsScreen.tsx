import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Card, Title, Text, Button, Switch, Divider } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { getSettings, updateSettings, AppSettings } from '../utils/settings';

const SettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState<AppSettings>({
    volume: 0.5,
    scanCooldown: 3000,
    vibrationEnabled: true,
    language: 'en',
  });
  const [cameraPermission, setCameraPermission] = useState<string>('unknown');
  const [storagePermission, setStoragePermission] = useState<string>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      // Check camera permission
      const cameraResult = await check(PERMISSIONS.ANDROID.CAMERA);
      setCameraPermission(cameraResult);

      // Check storage permission
      let storageResult;
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ uses READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE
          storageResult = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        } else {
          storageResult = await check(
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          );
        }
      } else {
        storageResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }
      setStoragePermission(storageResult);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      setCameraPermission(result);

      if (result === RESULTS.GRANTED) {
        Alert.alert('Success', 'Camera permission granted!');
      } else if (result === RESULTS.DENIED) {
        Alert.alert('Permission Denied', 'Camera permission was denied.');
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Camera permission is blocked. Please enable it in your device settings.',
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission.');
    }
  };

  const requestStoragePermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        } else {
          permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        }
      } else {
        permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      }

      const result = await request(permission);
      setStoragePermission(result);

      if (result === RESULTS.GRANTED) {
        Alert.alert('Success', 'Storage permission granted!');
      } else if (result === RESULTS.DENIED) {
        Alert.alert('Permission Denied', 'Storage permission was denied.');
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Storage permission is blocked. Please enable it in your device settings.',
        );
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      Alert.alert('Error', 'Failed to request storage permission.');
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting.');
    }
  };

  const formatCooldownDisplay = (value: number) => {
    if (value < 1000) {
      return `${value}ms`;
    } else {
      return `${(value / 1000).toFixed(1)}s`;
    }
  };

  const getPermissionStatusColor = (status: string) => {
    switch (status) {
      case RESULTS.GRANTED:
        return '#4CAF50';
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const getPermissionStatusText = (status: string) => {
    switch (status) {
      case RESULTS.GRANTED:
        return 'Granted';
      case RESULTS.DENIED:
        return 'Denied';
      case RESULTS.BLOCKED:
        return 'Blocked';
      case RESULTS.UNAVAILABLE:
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Audio Settings</Title>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Volume</Text>
            <Text style={styles.settingValue}>
              {Math.round(settings.volume * 100)}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={settings.volume}
            onValueChange={value => handleSettingChange('volume', value)}
            minimumTrackTintColor="#6200ea"
            maximumTrackTintColor="#cccccc"
            thumbTintColor="#6200ea"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Scanning Settings</Title>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Scan Cooldown</Text>
            <Text style={styles.settingValue}>
              {formatCooldownDisplay(settings.scanCooldown)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={500}
            maximumValue={10000}
            step={250}
            value={settings.scanCooldown}
            onValueChange={value => handleSettingChange('scanCooldown', value)}
            minimumTrackTintColor="#6200ea"
            maximumTrackTintColor="#cccccc"
            thumbTintColor="#6200ea"
          />
          <Text style={styles.helpText}>
            Time between consecutive scans (500ms - 10s)
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Feedback Settings</Title>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={value =>
                handleSettingChange('vibrationEnabled', value)
              }
              color="#6200ea"
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Language Settings</Title>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English (Default)</Text>
          </View>
          <Text style={styles.helpText}>
            Additional languages will be available in future updates
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Permissions</Title>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Camera</Text>
              <Text
                style={[
                  styles.permissionStatus,
                  { color: getPermissionStatusColor(cameraPermission) },
                ]}
              >
                {getPermissionStatusText(cameraPermission)}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={requestCameraPermission}
              disabled={cameraPermission === RESULTS.GRANTED}
              style={styles.permissionButton}
            >
              {cameraPermission === RESULTS.GRANTED ? 'Granted' : 'Request'}
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Storage</Text>
              <Text
                style={[
                  styles.permissionStatus,
                  { color: getPermissionStatusColor(storagePermission) },
                ]}
              >
                {getPermissionStatusText(storagePermission)}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={requestStoragePermission}
              disabled={storagePermission === RESULTS.GRANTED}
              style={styles.permissionButton}
            >
              {storagePermission === RESULTS.GRANTED ? 'Granted' : 'Request'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050019',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050019',
  },
  card: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: '#6200ea',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  permissionButton: {
    minWidth: 80,
  },
  divider: {
    marginVertical: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;
