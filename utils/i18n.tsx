import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en';
import it from '../locales/it';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
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
    },
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
