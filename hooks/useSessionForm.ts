import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { CodeType } from 'react-native-vision-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BARCODE_TYPES,
  createSession,
  GPSLocation,
  modifySession,
  Session,
  validateSessionCodes,
} from '../utils/storage';
import { requestStoragePermission } from '../utils/permissions';
import { requestLocationPermission } from './usePermissions';
import { RootStackParamList } from '../navigation/types';

type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_EXPECTED_CODE_TYPES: CodeType[] = ['code-128', 'data-matrix'];

interface SessionFormErrors {
  name: string;
  location: string;
  expectedCodes: string;
  expectedCodeTypes: string;
  codesToIgnore: string;
}

const DEFAULT_ERRORS: SessionFormErrors = {
  name: '',
  location: '',
  expectedCodes: '',
  expectedCodeTypes: '',
  codesToIgnore: '',
};

interface UseSessionFormOptions {
  session?: Session;
  isEditMode: boolean;
  showIgnoreCodesSection: boolean;
  navigation: AppNavigation;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const useSessionForm = ({
  session,
  isEditMode,
  showIgnoreCodesSection,
  navigation,
  t,
}: UseSessionFormOptions) => {
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
    session?.expectedCodeTypes || DEFAULT_EXPECTED_CODE_TYPES,
  );
  const [codesToIgnore, setCodesToIgnore] = useState<CodeType[]>(
    session?.codesToIgnore || [],
  );
  const [autosavePictures, setAutosavePictures] = useState(
    session?.autosavePictures ?? true,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SessionFormErrors>(DEFAULT_ERRORS);

  const effectiveCodesToIgnore = useMemo(
    () => (showIgnoreCodesSection ? codesToIgnore : []),
    [showIgnoreCodesSection, codesToIgnore],
  );

  const validateForm = useCallback(() => {
    const newErrors: SessionFormErrors = {
      ...DEFAULT_ERRORS,
    };

    if (!name.trim()) {
      newErrors.name = t('sessionForm.errors.name');
    }

    if (!location.trim()) {
      newErrors.location = t('sessionForm.errors.location');
    }

    const codesNum = parseInt(expectedCodes, 10);
    if (!expectedCodes || isNaN(codesNum) || codesNum <= 0) {
      newErrors.expectedCodes = t('sessionForm.errors.expectedCodes');
    }

    if (expectedCodeTypes.length === 0) {
      newErrors.expectedCodeTypes = t('sessionForm.errors.expectedCodeTypes');
    }

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
  }, [
    effectiveCodesToIgnore,
    expectedCodeTypes,
    expectedCodes,
    location,
    name,
    t,
  ]);

  const ensureStoragePermission = useCallback(async () => {
    return requestStoragePermission(
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
      },
      {
        showDeniedAlert: true,
        showErrorAlert: true,
        showSuccessAlert: false,
      },
    );
  }, [t]);

  useEffect(() => {
    const syncAutosavePermission = async () => {
      if (!autosavePictures) {
        return;
      }

      const hasPermission = await ensureStoragePermission();
      if (!hasPermission) {
        setAutosavePictures(false);
      }
    };

    syncAutosavePermission();
  }, [autosavePictures, ensureStoragePermission]);

  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission({
      title: t('settings.locationPermission.title'),
      message: t('settings.locationPermission.message'),
      askMeLater: t('settings.locationPermission.askMeLater'),
      cancel: t('alert.cancel'),
      ok: t('alert.ok'),
    });
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
  }, [t]);

  const clearGpsLocation = useCallback(() => {
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
  }, [t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && session) {
        await modifySession(session.id, {
          name: name.trim(),
          location: location.trim(),
          gpsLocation: gpsLocation || undefined,
          expectedCodeTypes,
          codesToIgnore: effectiveCodesToIgnore,
          expectedCodes: parseInt(expectedCodes, 10),
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
        const newSession = await createSession({
          name: name.trim(),
          folderName: '',
          location: location.trim(),
          gpsLocation: gpsLocation || undefined,
          expectedCodeTypes,
          codesToIgnore: effectiveCodesToIgnore,
          expectedCodes: parseInt(expectedCodes, 10),
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
  }, [
    autosavePictures,
    effectiveCodesToIgnore,
    expectedCodeTypes,
    expectedCodes,
    gpsLocation,
    isEditMode,
    location,
    name,
    navigation,
    session,
    t,
    validateForm,
  ]);

  const toggleCodeType = useCallback((type: CodeType) => {
    setExpectedCodeTypes(prev =>
      prev.includes(type)
        ? prev.filter(selectedType => selectedType !== type)
        : [...prev, type],
    );
  }, []);

  const toggleIgnoreCodeType = useCallback((type: CodeType) => {
    setCodesToIgnore(prev =>
      prev.includes(type)
        ? prev.filter(selectedType => selectedType !== type)
        : [...prev, type],
    );
  }, []);

  const getAvailableIgnoreTypes = useCallback(
    () => BARCODE_TYPES.filter(type => !expectedCodeTypes.includes(type)),
    [expectedCodeTypes],
  );

  return {
    name,
    setName,
    location,
    setLocation,
    gpsLocation,
    isGettingLocation,
    expectedCodes,
    setExpectedCodes,
    expectedCodeTypes,
    codesToIgnore,
    autosavePictures,
    setAutosavePictures,
    isLoading,
    errors,
    getCurrentLocation,
    clearGpsLocation,
    handleSubmit,
    toggleCodeType,
    toggleIgnoreCodeType,
    getAvailableIgnoreTypes,
  };
};
