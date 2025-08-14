import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Switch,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { getSettings, updateSettings, AppSettings } from '../utils/settings';

const SettingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
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
        return '#70A288'; // Green color for success
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:
        return theme.colors.error;
      default:
        return '#FF9800'; // Orange color for warning
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

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#ffffff"
          onPress={handleGoBack}
          style={styles(theme).backButton}
        />
        <Text style={styles(theme).headerTitle} variant="headlineMedium">
          Settings
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>

      <ScrollView>
        <View style={styles(theme).settingContainer}>
          <Text style={styles(theme).settingLabel}>
            Volume&nbsp;
            <Text style={styles(theme).settingValue}>
              {Math.round(settings.volume * 100)}%
            </Text>
          </Text>
          <Slider
            style={styles(theme).slider}
            minimumValue={0}
            maximumValue={1}
            value={settings.volume}
            onValueChange={value => handleSettingChange('volume', value)}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.onPrimary}
            thumbTintColor={theme.colors.primary}
          />
        </View>
        <View style={styles(theme).settingContainer}>
          <Text style={styles(theme).settingLabel}>
            Scan Cooldown&nbsp;
            <Text style={styles(theme).settingValue}>
              {formatCooldownDisplay(settings.scanCooldown)}
            </Text>
          </Text>
          <Slider
            style={styles(theme).slider}
            minimumValue={500}
            maximumValue={10000}
            step={250}
            value={settings.scanCooldown}
            onValueChange={value => handleSettingChange('scanCooldown', value)}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.onPrimary}
            thumbTintColor={theme.colors.primary}
          />
          <Text style={styles(theme).helpText}>
            Time between consecutive scans (500ms - 10s)
          </Text>
        </View>
        <View style={styles(theme).settingContainer}>
          <View style={styles(theme).settingRow}>
            <Text style={styles(theme).settingLabel}>Vibration</Text>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={value =>
                handleSettingChange('vibrationEnabled', value)
              }
              color={theme.colors.primary}
            />
          </View>
        </View>
        <View style={styles(theme).settingContainer}>
          <View style={styles(theme).settingRow}>
            <Text style={styles(theme).settingLabel}>Language</Text>
            <Text style={styles(theme).settingValue}>English (Default)</Text>
          </View>
        </View>
        <View style={styles(theme).settingContainer}>
          <Text style={styles(theme).settingLabel}>Permissions</Text>
          <View style={styles(theme).permissionRow}>
            <View style={styles(theme).permissionInfo}>
              <Text style={styles(theme).permissionLabel}>Camera</Text>
              <Text
                style={[
                  styles(theme).permissionStatus,
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
              style={styles(theme).permissionButton}
            >
              {cameraPermission === RESULTS.GRANTED ? 'Granted' : 'Request'}
            </Button>
          </View>

          <Divider style={styles(theme).divider} />

          <View style={styles(theme).permissionRow}>
            <View style={styles(theme).permissionInfo}>
              <Text style={styles(theme).permissionLabel}>Storage</Text>
              <Text
                style={[
                  styles(theme).permissionStatus,
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
              style={styles(theme).permissionButton}
            >
              {storagePermission === RESULTS.GRANTED ? 'Granted' : 'Request'}
            </Button>
          </View>
        </View>
        <View style={styles(theme).bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 12,
      paddingTop: Platform.OS === 'ios' ? 50 : 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    backButton: {
      margin: 0,
    },
    headerTitle: {
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40, // Same width as back button to center the title
    },
    scrollContent: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    card: {
      marginBottom: 16,
    },
    settingContainer: {
      paddingVertical: 16,
      borderBottomColor: theme.colors.outlineVariant,
      borderBottomWidth: 1,
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
      color: theme.colors.text,
    },
    settingValue: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    helpText: {
      fontSize: 12,
      color: theme.colors.text,
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
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    permissionStatus: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 2,
    },
    permissionButton: {
      minWidth: 80,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: theme.colors.outlineVariant,
      height: 1,
      width: '100%',
    },
    bottomSpacing: {
      height: 20,
    },
  });

export default SettingsScreen;
