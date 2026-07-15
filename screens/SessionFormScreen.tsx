import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Switch,
  HelperText,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { BARCODE_TYPES, Session } from '../utils/storage';
import { useTranslation } from 'react-i18next';
import { useSessionForm } from '../hooks/useSessionForm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BarcodeTypeSelector from '../components/BarcodeTypeSelector';
import GpsInfoBlock from '../components/GpsInfoBlock';

type SessionFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SessionForm'
>;

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

        <BarcodeTypeSelector
          title={t('sessionForm.form.expectedCodeTypes')}
          types={BARCODE_TYPES}
          selectedTypes={expectedCodeTypes}
          onToggle={toggleCodeType}
          helperError={errors.expectedCodeTypes}
          variant="expected"
        />

        {showIgnoreCodesSection && (
          <BarcodeTypeSelector
            title={t('sessionForm.form.codesToIgnore')}
            description={t('sessionForm.form.codesToIgnoreDescription')}
            types={getAvailableIgnoreTypes()}
            selectedTypes={codesToIgnore}
            onToggle={toggleIgnoreCodeType}
            helperError={errors.codesToIgnore}
            emptyText={t('sessionForm.form.codesToIgnoreEmpty')}
            variant="ignore"
          />
        )}

        <Text style={styles(theme).sectionTitle}>
          {t('sessionForm.form.gps.label')}
        </Text>

        <GpsInfoBlock
          gpsLocation={gpsLocation}
          isGettingLocation={isGettingLocation}
          onGetLocation={getCurrentLocation}
          onClearLocation={clearGpsLocation}
          t={key => t(key)}
        />

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
  });

export default SessionFormScreen;
