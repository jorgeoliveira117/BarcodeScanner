import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  volume: number; // 0-1 range
  scanCooldown: number; // milliseconds
  vibrationEnabled: boolean;
  language: string;
}

const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.5,
  scanCooldown: 3000,
  vibrationEnabled: true,
  language: 'en',
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateSettings = async (
  updates: Partial<AppSettings>,
): Promise<AppSettings> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return newSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const resetSettings = async (): Promise<AppSettings> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
};
