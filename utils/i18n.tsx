import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en';
import it from '../locales/it';
import ro from '../locales/ro';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First check for language in app settings
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.language) {
          callback(settings.language);
          return;
        }
      }

      // Fallback to user-language key
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback('en');
      }
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);

      // Also update the app settings
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.language = lng;
        await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
      } else {
        // Create settings if they don't exist
        const newSettings = {
          volume: 0.5,
          scanCooldown: 3000,
          vibrationEnabled: true,
          language: lng,
        };
        await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      }
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      ro: { translation: ro },
    },
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
