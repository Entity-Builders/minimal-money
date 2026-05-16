import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { MinimalTheme } from './src/theme';
import { BudgetProvider } from './src/context/useBudget';
import { SplashContext } from './src/context/SplashContext';
import { RootNavigator } from './src/navigation/RootNavigator';

import * as Sentry from '@sentry/react-native';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: process.env.NODE_ENV === 'development', // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  enableLogs: true,

  sendDefaultPii: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,
});

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'app',
      message: 'App Mounted',
      level: 'info',
    });

    // Diagnostic Log
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    const maskedDsn = dsn ? `${dsn.substring(0, 15)}...` : 'not-set';

    Sentry.captureMessage(
      `App Mounted - Debugging Connectivity - DSN: ${maskedDsn}`,
      {
        level: 'info',
      },
    );
    const hideSplashScreen = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await SplashScreen.hideAsync();
      setIsSplashVisible(false);
    };

    hideSplashScreen();
  }, []);

  return (
    <SplashContext.Provider value={{ isSplashVisible }}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={MinimalTheme}>
          <BottomSheetModalProvider>
            <BudgetProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                <RootNavigator />
              </NavigationContainer>
            </BudgetProvider>
          </BottomSheetModalProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </SplashContext.Provider>
  );
}

export default Sentry.wrap(App);
