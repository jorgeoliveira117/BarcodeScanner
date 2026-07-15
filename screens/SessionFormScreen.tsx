import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
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
import { BARCODE_TYPES, Session } from '../utils/storage';
import { CodeType } from 'react-native-vision-camera';
import { useTranslation } from 'react-i18next';
import { useSessionForm } from '../hooks/useSessionForm';

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

  const {
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
  } = useSessionForm({
    session,
    isEditMode,
    showIgnoreCodesSection,
    navigation,
    t,
  });

  const handleGoBack = () => {
    navigation.goBack();
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
