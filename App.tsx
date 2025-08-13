import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './screens/HomeScreen';
import ScannerScreen from './screens/ScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import SessionsListScreen from './screens/SessionsListScreen';
import CreateSessionScreen from './screens/CreateSessionScreen';
import EditSessionScreen from './screens/EditSessionScreen';
import { Session } from './utils/storage';

// Type definitions for navigation
export type RootStackParamList = {
  Home: undefined;
  Scanner: { sessionId?: number } | undefined;
  History: { sessionId: number };
  SessionsList: undefined;
  CreateSession: undefined;
  EditSession: { session: Session };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" backgroundColor="#050019" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Barcode Scanner' }}
          />
          <Stack.Screen
            name="SessionsList"
            component={SessionsListScreen}
            options={{ title: 'Sessions', headerShown: true }}
          />
          <Stack.Screen
            name="CreateSession"
            component={CreateSessionScreen}
            options={{ title: 'Create Session', headerShown: true }}
          />
          <Stack.Screen
            name="EditSession"
            component={EditSessionScreen}
            options={{ title: 'Edit Session', headerShown: true }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ title: 'Scan Barcode' }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'Session History', headerShown: true }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
