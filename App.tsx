import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import './utils/i18n';

import HomeScreen from './screens/HomeScreen';
import ScannerScreen from './screens/ScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import SessionsListScreen from './screens/SessionsListScreen';
import SessionFormScreen from './screens/SessionFormScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Session } from './utils/storage';
import { useTranslation } from 'react-i18next';

// Type definitions for navigation
export type RootStackParamList = {
  Home: undefined;
  Scanner: { sessionId?: number } | undefined;
  History: { sessionId: number };
  SessionsList: undefined;
  SessionForm: { session?: Session; mode: 'create' | 'edit' };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#266DD3',
    onSurfaceVariant: '#919194',
    accent: '#70A288',
    background: '#050019',
    text: '#F7F7FF',
    success: '#70A288',
    error: '#ED6A5A',
    outline: '#266DD3',
    surfaceDisabled: '#8E929A',
    onSurfaceDisabled: '#8E929A',
    outlineVariant: '#333333',
    tertiary: '#FBD1A2',
  },
};

function App() {
  const { t } = useTranslation();

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor="#050019" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
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
    </PaperProvider>
  );
}

export default App;
