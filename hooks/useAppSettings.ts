import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSettings, getSettings, updateSettings } from '../utils/settings';

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.5,
  scanCooldown: 3000,
  vibrationEnabled: true,
  language: 'en',
};

export const useAppSettings = () => {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const currentSettings = await getSettings();

      if (!currentSettings.language) {
        currentSettings.language = i18n.language || 'en';
      }

      setSettings(currentSettings);

      if (currentSettings.language !== i18n.language) {
        await i18n.changeLanguage(currentSettings.language);
      }

      return currentSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, [i18n]);

  const saveSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await updateSettings({ [key]: value });

      if (key === 'language') {
        await i18n.changeLanguage(value as string);
      }

      return newSettings;
    },
    [i18n, settings],
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    loadSettings,
    saveSetting,
    setSettings,
  };
};
