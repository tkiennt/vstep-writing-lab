import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppSettingsProvider, useAppSettings } from './src/context/AppSettingsContext';

function ThemedStatusBar() {
  const { isDark } = useAppSettings();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <AppSettingsProvider>
          <ThemedStatusBar />
          <AppNavigator />
        </AppSettingsProvider>
      </Provider>
    </AppErrorBoundary>
  );
}
