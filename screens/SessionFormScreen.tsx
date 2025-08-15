import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Card,
  Chip,
  Switch,
  HelperText,
  useTheme,
  IconButton,
} from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import {
  BARCODE_TYPES,
  createSession,
  modifySession,
  Session,
  validateSessionCodes,
  GPSLocation,
} from '../utils/storage';
import { CodeType } from 'react-native-vision-camera';

interface SessionFormScreenProps {
  route: {
    params?: {
      session?: Session;
      mode: 'create' | 'edit';
    };
  };
  navigation: any;
}

const SessionFormScreen = ({ route, navigation }: SessionFormScreenProps) => {
  const theme = useTheme();
  const { session, mode } = route.params || { mode: 'create' };
  const isEditMode = mode === 'edit';

  // Initialize form values based on mode
  const [name, setName] = useState(session?.name || '');
  const [location, setLocation] = useState(session?.location || '');
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(
    session?.gpsLocation || null,
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [expectedCodes, setExpectedCodes] = useState(
    session?.expectedCodes?.toString() || '',
  );
  const [expectedCodeTypes, setExpectedCodeTypes] = useState<CodeType[]>(
    session?.expectedCodeTypes || [],
  );
  const [codesToIgnore, setCodesToIgnore] = useState<CodeType[]>(
    session?.codesToIgnore || [],
  );
  const [autosavePictures, setAutosavePictures] = useState(
    session?.autosavePictures || false,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    location: '',
    expectedCodes: '',
    expectedCodeTypes: '',
    codesToIgnore: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      location: '',
      expectedCodes: '',
      expectedCodeTypes: '',
      codesToIgnore: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Session name is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    const codesNum = parseInt(expectedCodes);
    if (!expectedCodes || isNaN(codesNum) || codesNum <= 0) {
      newErrors.expectedCodes = 'Please enter a valid number of expected codes';
    }

    if (expectedCodeTypes.length === 0) {
      newErrors.expectedCodeTypes = 'Please select at least one barcode type';
    }

    // Validate that codesToIgnore doesn't conflict with expectedCodeTypes
    const validation = validateSessionCodes(expectedCodeTypes, codesToIgnore);
    if (!validation.isValid) {
      newErrors.codesToIgnore = `Cannot ignore expected code types: ${validation.conflicts.join(
        ', ',
      )}`;
    }

    setErrors(newErrors);

    return Object.values(newErrors).every(error => error === '');
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to location to set GPS coordinates for sessions',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions through Info.plist
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to get GPS coordinates.',
      );
      return;
    }

    setIsGettingLocation(true);

    Geolocation.getCurrentPosition(
      (position: any) => {
        const newGpsLocation: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        };
        setGpsLocation(newGpsLocation);
        setIsGettingLocation(false);
      },
      (error: any) => {
        setIsGettingLocation(false);
        console.error('Location error:', error);
        Alert.alert(
          'Location Error',
          'Failed to get current location. Please check your GPS settings and try again.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const clearGpsLocation = () => {
    Alert.alert(
      'Clear GPS Location',
      'Are you sure you want to remove the GPS coordinates from this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setGpsLocation(null);
          },
        },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && session) {
        // Edit existing session
        await modifySession(session.id, {
          name: name.trim(),
          location: location.trim(),
          gpsLocation: gpsLocation || undefined,
          expectedCodeTypes,
          codesToIgnore,
          expectedCodes: parseInt(expectedCodes),
          autosavePictures,
        });

        Alert.alert(
          'Session Updated',
          `Session "${name}" has been updated successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        // Create new session
        const newSession = await createSession({
          name: name.trim(),
          folderName: '', // This will be auto-generated
          location: location.trim(),
          gpsLocation: gpsLocation || undefined,
          expectedCodeTypes,
          codesToIgnore,
          expectedCodes: parseInt(expectedCodes),
          autosavePictures,
        });

        Alert.alert(
          'Session Created',
          `Session "${newSession.name}" has been created successfully!`,
          [
            {
              text: 'Start Scanning',
              onPress: () =>
                navigation.navigate('Scanner', { sessionId: newSession.id }),
            },
            {
              text: 'Go to Sessions',
              onPress: () => navigation.navigate('SessionsList'),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${
          isEditMode ? 'update' : 'create'
        } session. Please try again.`,
      );
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} session:`,
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCodeType = (type: CodeType) => {
    setExpectedCodeTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const toggleIgnoreCodeType = (type: CodeType) => {
    setCodesToIgnore(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Get available code types that can be ignored (exclude expected types)
  const getAvailableIgnoreTypes = () => {
    return BARCODE_TYPES.filter(type => !expectedCodeTypes.includes(type));
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#F7F7FF"
          onPress={handleGoBack}
          style={styles(theme).backButton}
        />
        <Text style={styles(theme).headerTitle} variant="headlineSmall">
          {isEditMode ? 'Edit Session' : 'Create New Session'}
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
      <ScrollView style={styles(theme).scrollContent}>
        <View style={styles(theme).scrollContentSpacer} />
        {isEditMode && session && (
          <>
            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>Session ID:</Text>
              <Text style={styles(theme).readOnlyValue}>{session.id}</Text>
            </View>

            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>Folder Name:</Text>
              <Text style={styles(theme).readOnlyValue}>
                {session.folderName}
              </Text>
            </View>

            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>Barcodes Scanned:</Text>
              <Text style={styles(theme).readOnlyValue}>
                {session.barcodes.length}
              </Text>
            </View>
          </>
        )}

        <TextInput
          label="Session Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          placeholder="e.g., Warehouse Audit 2025"
          error={!!errors.name}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="Location *"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          placeholder="e.g., Building A, Floor 2"
          error={!!errors.location}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.location}>
          {errors.location}
        </HelperText>

        <TextInput
          label="Expected Number of Codes *"
          value={expectedCodes}
          onChangeText={setExpectedCodes}
          mode="outlined"
          keyboardType="numeric"
          placeholder="e.g., 100"
          error={!!errors.expectedCodes}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.expectedCodes}>
          {errors.expectedCodes}
        </HelperText>

        <Text style={styles(theme).sectionTitle}>Expected Barcode Types *</Text>
        <View style={styles(theme).chipsContainer}>
          {BARCODE_TYPES.map(type => (
            <Chip
              key={type}
              mode={expectedCodeTypes.includes(type) ? 'flat' : 'outlined'}
              selected={expectedCodeTypes.includes(type)}
              onPress={() => toggleCodeType(type)}
              style={[
                styles(theme).chip,
                expectedCodeTypes.includes(type) && styles(theme).expectedChip,
              ]}
              textStyle={[
                styles(theme).chipText,
                expectedCodeTypes.includes(type) &&
                  styles(theme).expectedChipText,
              ]}
            >
              {type.toUpperCase()}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!errors.expectedCodeTypes}>
          {errors.expectedCodeTypes}
        </HelperText>

        <Text style={styles(theme).sectionTitle}>
          Codes to Ignore (Optional)
        </Text>
        <Text style={styles(theme).sectionDescription}>
          Select barcode types that should be ignored during scanning. These
          cannot be the same as expected types.
        </Text>
        <View style={styles(theme).chipsContainer}>
          {getAvailableIgnoreTypes().map(type => (
            <Chip
              key={`ignore-${type}`}
              mode={codesToIgnore.includes(type) ? 'flat' : 'outlined'}
              selected={codesToIgnore.includes(type)}
              onPress={() => toggleIgnoreCodeType(type)}
              style={[
                styles(theme).chip,
                codesToIgnore.includes(type) && styles(theme).ignoreChip,
              ]}
              textStyle={[
                styles(theme).chipText,
                codesToIgnore.includes(type) && styles(theme).ignoreChipText,
              ]}
            >
              {type.toUpperCase()}
            </Chip>
          ))}
        </View>
        {getAvailableIgnoreTypes().length === 0 && (
          <Text style={styles(theme).noIgnoreTypesText}>
            All barcode types are set as expected. Change expected types above
            to enable ignoring specific types.
          </Text>
        )}
        <HelperText type="error" visible={!!errors.codesToIgnore}>
          {errors.codesToIgnore}
        </HelperText>

        <Text style={styles(theme).sectionTitle}>GPS Location (Optional)</Text>

        <View style={styles(theme).gpsContainer}>
          {gpsLocation ? (
            <View style={styles(theme).gpsInfoContainer}>
              <View style={styles(theme).gpsInfo}>
                <Text style={styles(theme).gpsLabel}>Latitude:</Text>
                <Text style={styles(theme).gpsValue}>
                  {gpsLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles(theme).gpsInfo}>
                <Text style={styles(theme).gpsLabel}>Longitude:</Text>
                <Text style={styles(theme).gpsValue}>
                  {gpsLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <Text style={styles(theme).gpsTimestamp}>
                Updated on {new Date(gpsLocation.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={styles(theme).noGpsText}>
              No GPS location set. Tap the button below to get current location.
            </Text>
          )}
          <View style={styles(theme).gpsButtonContainer}>
            <Button
              mode="outlined"
              onPress={getCurrentLocation}
              style={styles(theme).gpsButton}
              loading={isGettingLocation}
              disabled={isGettingLocation}
              icon="crosshairs-gps"
            >
              {isGettingLocation
                ? 'Getting Location...'
                : 'Get Current Location'}
            </Button>
            {gpsLocation && (
              <Button
                mode="text"
                onPress={clearGpsLocation}
                style={styles(theme).clearGpsButton}
                textColor={theme.colors.error}
                icon="delete"
              >
                Clear Location
              </Button>
            )}
          </View>
        </View>

        <View style={styles(theme).switchContainer}>
          <Text style={styles(theme).switchLabel}>Auto-save Pictures</Text>
          <Switch
            value={autosavePictures}
            onValueChange={setAutosavePictures}
          />
        </View>

        <View style={styles(theme).buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles(theme).cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles(theme).submitButton}
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditMode ? 'Save Changes' : 'Create Session'}
          </Button>
        </View>
        <View style={styles(theme).bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
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
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      margin: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    readOnlyContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginBottom: 8,
    },
    readOnlyLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    readOnlyValue: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    chipText: {
      color: theme.colors.text,
    },
    ignoreChip: {
      backgroundColor: theme.colors.error,
    },
    ignoreChipText: {
      color: theme.colors.background,
    },
    expectedChip: {
      backgroundColor: theme.colors.success,
    },
    expectedChipText: {
      color: theme.colors.background,
    },
    noIgnoreTypesText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 8,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
    },
    submitButton: {
      flex: 1,
    },
    scrollContent: {
      flex: 1,
      padding: 16,
    },
    scrollContentSpacer: {
      padding: 4,
    },
    bottomSpacing: {
      height: 20,
    },
    // GPS Location styles
    gpsContainer: {
      marginBottom: 20,
    },
    gpsInfoContainer: {
      marginBottom: 12,
    },
    gpsInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    gpsLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    gpsValue: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    gpsTimestamp: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    noGpsText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    gpsButtonContainer: {
      gap: 8,
    },
    gpsButton: {
      flex: 1,
    },
    clearGpsButton: {
      flex: 0.5,
    },
  });

export default SessionFormScreen;
