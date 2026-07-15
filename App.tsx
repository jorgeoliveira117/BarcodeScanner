import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './utils/i18n';

import RootNavigator from './navigation/RootNavigator';
import { appTheme } from './theme/appTheme';

function App() {
  return (
    <PaperProvider theme={appTheme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#050019"
        translucent={false}
      />
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App;
