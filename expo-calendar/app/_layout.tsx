import '@/global.css';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';

import { AuthListener } from '@/components/auth/AuthListener';
import { useColorScheme } from '@/lib/useColorScheme';
import { store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { NAV_THEME } from '@/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Keep the splash screen up until we know whether there's a saved session, so
// signed-in users don't see the login screen flash on launch.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <ReduxProvider store={store}>
      <AuthListener />
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <NavThemeProvider value={NAV_THEME[colorScheme]}>
            <RootNavigator />
          </NavThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}

function RootNavigator() {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isSignedIn = authStatus === 'signedIn';
  const isLoading = authStatus === 'loading';

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // When a guard turns false, the router redirects to the first screen that's
  // still allowed. Signing in lands on the dashboard; signing out lands on
  // the login screen.
  return (
    <>
      <Stack>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="event/new" options={{ presentation: 'modal', title: 'New Event' }} />
          <Stack.Screen
            name="event/[id]/index"
            options={{ presentation: 'modal', title: 'Event' }}
          />
          <Stack.Screen
            name="event/[id]/edit"
            options={{ presentation: 'modal', title: 'Edit Event' }}
          />
          <Stack.Screen
            name="calendar/new"
            options={{ presentation: 'modal', title: 'New Calendar' }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      {/* The splash screen covers this on native; web has no splash screen,
          so cover the login screen until the session is restored. */}
      {isLoading && <View className="absolute inset-0 bg-background" />}
    </>
  );
}
