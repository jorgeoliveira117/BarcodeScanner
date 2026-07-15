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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const { session, mode } = route.params || { mode: 'create' };
  const isEditMode = mode === 'edit';
  const showIgnoreCodesSection = false;

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

  const effectiveCodesToIgnore = showIgnoreCodesSection ? codesToIgnore : [];

  const validateForm = () => {
    const newErrors = {
      name: '',
      location: '',
      expectedCodes: '',
      expectedCodeTypes: '',
      codesToIgnore: '',
    };

    if (!name.trim()) {
      newErrors.name = t('sessionForm.errors.name');
    }

    if (!location.trim()) {
      newErrors.location = t('sessionForm.errors.location');
    }

    const codesNum = parseInt(expectedCodes);
    if (!expectedCodes || isNaN(codesNum) || codesNum <= 0) {
      newErrors.expectedCodes = t('sessionForm.errors.expectedCodes');
    }

    if (expectedCodeTypes.length === 0) {
      newErrors.expectedCodeTypes = t('sessionForm.errors.expectedCodeTypes');
    }

    // Validate that codesToIgnore doesn't conflict with expectedCodeTypes
    const validation = validateSessionCodes(
      expectedCodeTypes,
      effectiveCodesToIgnore,
    );
    if (!validation.isValid) {
      newErrors.codesToIgnore = t('sessionForm.errors.codesToIgnore', {
        conflicts: validation.conflicts.join(', '),
      });
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
            title: t('settings.locationPermission.title'),
            message: t('settings.locationPermission.message'),
            buttonNeutral: t('settings.locationPermission.askMeLater'),
            buttonNegative: t('alert.cancel'),
            buttonPositive: t('alert.ok'),
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
        t('settings.locationPermission.permissionDenied'),
        t('settings.locationPermission.message'),
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
          t('settings.locationPermission.locationError'),
          t('settings.locationPermission.locationErrorDescription'),
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
      t('settings.locationPermission.clearLocation'),
      t('settings.locationPermission.clearLocationDescription'),
      [
        {
          text: t('alert.cancel'),
          style: 'cancel',
        },
        {
          text: t('alert.clear'),
          style: 'destructive',
          onPress: () => {
            setGpsLocation(null);
          },
        },
      ],
    );
  };

  const handleSubmit = async () => {
    console.log('Validating form...');
    if (!validateForm()) {
      console.log('RIP');
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
          codesToIgnore: effectiveCodesToIgnore,
          expectedCodes: parseInt(expectedCodes),
          autosavePictures,
        });

        Alert.alert(
          t('sessionForm.submit.updatedTitle'),
          t('sessionForm.submit.updatedDescription', { name }),
          [
            {
              text: t('alert.ok'),
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
          codesToIgnore: effectiveCodesToIgnore,
          expectedCodes: parseInt(expectedCodes),
          autosavePictures,
        });

        Alert.alert(
          t('sessionForm.submit.createTitle'),
          t('sessionForm.submit.createDescription', { name: newSession.name }),
          [
            {
              text: t('sessionForm.submit.startScanning'),
              onPress: () =>
                navigation.navigate('Scanner', { sessionId: newSession.id }),
            },
            {
              text: t('sessionForm.submit.goToSessions'),
              onPress: () => navigation.navigate('SessionsList'),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        t('alert.error'),
        isEditMode
          ? t('sessionForm.submit.updateError')
          : t('sessionForm.submit.createError'),
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
          {isEditMode
            ? t('sessionForm.editTitle')
            : t('sessionForm.createTitle')}
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>
      <ScrollView style={styles(theme).scrollContent}>
        <View style={styles(theme).scrollContentSpacer} />
        {isEditMode && session && (
          <>
            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>
                {t('sessionForm.sessionId')}
              </Text>
              <Text style={styles(theme).readOnlyValue}>{session.id}</Text>
            </View>

            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>
                {t('sessionForm.folderName')}
              </Text>
              <Text style={styles(theme).readOnlyValue}>
                {session.folderName}
              </Text>
            </View>

            <View style={styles(theme).readOnlyContainer}>
              <Text style={styles(theme).readOnlyLabel}>
                {t('sessionForm.barcodesScanned')}
              </Text>
              <Text style={styles(theme).readOnlyValue}>
                {session.barcodes.length}
              </Text>
            </View>
          </>
        )}

        <TextInput
          label={t('sessionForm.form.sessionName')}
          value={name}
          onChangeText={setName}
          mode="outlined"
          placeholder={t('sessionForm.form.sessionNamePlaceholder')}
          error={!!errors.name}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label={t('sessionForm.form.location')}
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          placeholder={t('sessionForm.form.locationPlaceholder')}
          error={!!errors.location}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.location}>
          {errors.location}
        </HelperText>

        <TextInput
          label={t('sessionForm.form.expectedNumber')}
          value={expectedCodes}
          onChangeText={setExpectedCodes}
          mode="outlined"
          keyboardType="numeric"
          placeholder={t('sessionForm.form.expectedNumberPlaceholder')}
          error={!!errors.expectedCodes}
          textColor="#F7F7FF"
        />
        <HelperText type="error" visible={!!errors.expectedCodes}>
          {errors.expectedCodes}
        </HelperText>

        <Text style={styles(theme).sectionTitle}>
          {t('sessionForm.form.expectedCodeTypes')}
        </Text>
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

        {showIgnoreCodesSection && (
          <>
            <Text style={styles(theme).sectionTitle}>
              {t('sessionForm.form.codesToIgnore')}
            </Text>
            <Text style={styles(theme).sectionDescription}>
              {t('sessionForm.form.codesToIgnoreDescription')}
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
                    codesToIgnore.includes(type) &&
                      styles(theme).ignoreChipText,
                  ]}
                >
                  {type.toUpperCase()}
                </Chip>
              ))}
            </View>
            {getAvailableIgnoreTypes().length === 0 && (
              <Text style={styles(theme).noIgnoreTypesText}>
                {t('sessionForm.form.codesToIgnoreEmpty')}
              </Text>
            )}
            <HelperText type="error" visible={!!errors.codesToIgnore}>
              {errors.codesToIgnore}
            </HelperText>
          </>
        )}

        <Text style={styles(theme).sectionTitle}>
          {t('sessionForm.form.gps.label')}
        </Text>

        <View style={styles(theme).gpsContainer}>
          {gpsLocation ? (
            <View style={styles(theme).gpsInfoContainer}>
              <View style={styles(theme).gpsInfo}>
                <Text style={styles(theme).gpsLabel}>
                  {t('sessionForm.form.gps.lat')}:
                </Text>
                <Text style={styles(theme).gpsValue}>
                  {gpsLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles(theme).gpsInfo}>
                <Text style={styles(theme).gpsLabel}>
                  {t('sessionForm.form.gps.lon')}:
                </Text>
                <Text style={styles(theme).gpsValue}>
                  {gpsLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <Text style={styles(theme).gpsTimestamp}>
                {t('sessionForm.form.gps.updated')}{' '}
                {new Date(gpsLocation.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={styles(theme).noGpsText}>
              {t('sessionForm.form.gps.none')}
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
                ? t('sessionForm.form.gps.gettingLocation')
                : t('sessionForm.form.gps.getLocation')}
            </Button>
            {gpsLocation && (
              <Button
                mode="text"
                onPress={clearGpsLocation}
                style={styles(theme).clearGpsButton}
                textColor={theme.colors.error}
                icon="delete"
              >
                {t('sessionForm.form.gps.clearLocation')}
              </Button>
            )}
          </View>
        </View>

        <View style={styles(theme).switchContainer}>
          <Text style={styles(theme).switchLabel}>
            {t('sessionForm.form.savePictures')}
          </Text>
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
            {t('sessionForm.form.buttonCancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles(theme).submitButton}
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditMode
              ? t('sessionForm.form.buttonSave')
              : t('sessionForm.form.buttonCreate')}
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
      paddingBottom: 32,
    },
    scrollContentSpacer: {
      padding: 4,
    },
    bottomSpacing: {
      height: 80,
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
