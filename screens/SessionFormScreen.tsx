import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Text,
  Switch,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { BARCODE_TYPES } from '../utils/storage';
import { useTranslation } from 'react-i18next';
import { useSessionForm } from '../hooks/useSessionForm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import BarcodeTypeSelector from '../components/BarcodeTypeSelector';
import GpsInfoBlock from '../components/GpsInfoBlock';
import TwoActionButtonsRow from '../components/TwoActionButtonsRow';
import AppScreenHeader from '../components/AppScreenHeader';

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

  return (
    <View style={styles(theme).container}>
      <AppScreenHeader
        title={
          isEditMode ? t('sessionForm.editTitle') : t('sessionForm.createTitle')
        }
        onBack={() => navigation.goBack()}
      />
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

        <TwoActionButtonsRow
          left={{
            label: t('sessionForm.form.buttonCancel'),
            mode: 'outlined',
            onPress: () => navigation.goBack(),
          }}
          right={{
            label: isEditMode
              ? t('sessionForm.form.buttonSave')
              : t('sessionForm.form.buttonCreate'),
            mode: 'contained',
            onPress: handleSubmit,
            loading: isLoading,
            disabled: isLoading,
          }}
        />
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
