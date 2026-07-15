import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Switch,
  Divider,
  IconButton,
  useTheme,
  Menu,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { RESULTS } from 'react-native-permissions';
import { AppSettings } from '../utils/settings';
import { useAppSettings } from '../hooks/useAppSettings';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsPermissions } from '../hooks/useSettingsPermissions';
import PermissionStatusRow from '../components/PermissionStatusRow';

interface LanguageOption {
  value: string;
  label: string;
}

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { settings, loading, saveSetting } = useAppSettings();
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const {
    cameraPermission,
    storagePermission,
    requestCameraPermission,
    requestStoragePermission,
    getPermissionStatusText,
  } = useSettingsPermissions({ t: key => t(key) });

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    try {
      await saveSetting(key, value);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert(
        t('settings.settingChangeErrorTitle'),
        t('settings.settingChangeErrorMessage'),
      );
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

  const getCurrentLanguageLabel = () => {
    const currentLang = settings.language || i18n.language;
    const languageOptions = [
      { label: 'English', value: 'en' },
      { label: 'Italiano', value: 'it' },
      { label: 'Romana', value: 'ro' },
    ];
    const option = languageOptions.find(opt => opt.value === currentLang);
    return option ? option.label : 'English';
  };

  const handleLanguageChange = (languageValue: string) => {
    console.log('Language change triggered:', languageValue);
    setLanguageMenuVisible(false);
    // Add a small delay to ensure the menu closes before updating
    setTimeout(() => {
      handleSettingChange('language', languageValue);
    }, 100);
  };

  const openLanguageMenu = () => {
    console.log('Opening language menu');
    setLanguageMenuVisible(true);
  };

  const closeLanguageMenu = () => {
    console.log('Closing language menu');
    setLanguageMenuVisible(false);
  };

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <Text>{t('settings.loading')}</Text>
      </View>
    );
  }

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
        <Text style={styles(theme).headerTitle} variant="headlineMedium">
          {t('settings.title')}
        </Text>
        <View style={styles(theme).headerSpacer} />
      </View>

      <ScrollView>
        <View style={styles(theme).settingContainer}>
          <Text style={styles(theme).settingLabel}>
            {t('settings.volumeLabel')}
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
            {t('settings.scanCooldownLabel')}
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
            {t('settings.scanCooldownDescription')}
          </Text>
        </View>
        <View style={styles(theme).settingContainer}>
          <View style={styles(theme).settingRow}>
            <Text style={styles(theme).settingLabel}>
              {t('settings.vibrationLabel')}
            </Text>
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
          <Text style={styles(theme).settingLabel}>
            {t('settings.languageLabel')}
          </Text>
          <Menu
            visible={languageMenuVisible}
            onDismiss={closeLanguageMenu}
            anchor={
              <TouchableOpacity
                onPress={openLanguageMenu}
                style={styles(theme).languageSelector}
                activeOpacity={0.7}
                disabled={languageMenuVisible}
              >
                <View style={styles(theme).languageSelectorContent}>
                  <Text style={styles(theme).settingValue}>
                    {getCurrentLanguageLabel()}
                  </Text>
                  <IconButton
                    icon="chevron-down"
                    size={20}
                    iconColor={theme.colors.primary}
                    style={styles(theme).dropdownIcon}
                  />
                </View>
              </TouchableOpacity>
            }
            contentStyle={styles(theme).menuContent}
          >
            {(
              t('settings.languageOptions', {
                returnObjects: true,
              }) as LanguageOption[]
            ).map((language: LanguageOption) => (
              <Menu.Item
                key={language.value}
                onPress={() => handleLanguageChange(language.value)}
                title={language.label}
                titleStyle={[
                  styles(theme).menuItemTitle,
                  (settings.language || i18n.language) === language.value &&
                    styles(theme).selectedMenuItem,
                ]}
              />
            ))}
          </Menu>
        </View>
        <View style={styles(theme).settingContainer}>
          <Text style={styles(theme).settingLabel}>
            {t('settings.permissionsLabel')}
          </Text>
          <PermissionStatusRow
            label={t('settings.cameraPermissionLabel')}
            statusText={getPermissionStatusText(cameraPermission)}
            statusColor={getPermissionStatusColor(cameraPermission)}
            isGranted={cameraPermission === RESULTS.GRANTED}
            onRequest={requestCameraPermission}
            grantedLabel={t('settings.permissionsButtonGranted')}
            requestLabel={t('settings.permissionsButtonRequest')}
          />

          <Divider style={styles(theme).divider} />

          <PermissionStatusRow
            label={t('settings.storagePermissionLabel')}
            statusText={getPermissionStatusText(storagePermission)}
            statusColor={getPermissionStatusColor(storagePermission)}
            isGranted={storagePermission === RESULTS.GRANTED}
            onRequest={requestStoragePermission}
            grantedLabel={t('settings.permissionsButtonGranted')}
            requestLabel={t('settings.permissionsButtonRequest')}
          />
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
    divider: {
      marginVertical: 12,
      backgroundColor: theme.colors.outlineVariant,
      height: 1,
      width: '100%',
    },
    bottomSpacing: {
      height: 20,
    },
    languageSelector: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginTop: 8,
      minHeight: 48,
    },
    languageSelectorContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownIcon: {
      margin: 0,
      padding: 0,
    },
    menuContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginTop: 8,
    },
    menuItemTitle: {
      color: theme.colors.background,
    },
    selectedMenuItem: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
  });

export default SettingsScreen;
