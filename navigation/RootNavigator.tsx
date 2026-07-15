import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionsListScreen from '../screens/SessionsListScreen';
import SessionFormScreen from '../screens/SessionFormScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: '#050019',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: t('home.title') }}
        />
        <Stack.Screen
          name="SessionsList"
          component={SessionsListScreen}
          options={{ title: t('sessionList.title'), headerShown: false }}
        />
        <Stack.Screen
          name="SessionForm"
          component={SessionFormScreen}
          options={{ title: t('sessionForm.title'), headerShown: false }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ title: t('scanner.title') }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: t('history.title'), headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t('settings.title'), headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
