import '@/global.css';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';

import { useColorScheme } from '@/lib/useColorScheme';
import { store } from '@/store';
import { NAV_THEME } from '@/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <ReduxProvider store={store}>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <NavThemeProvider value={NAV_THEME[colorScheme]}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="dashboard" options={{ headerShown: false }} />
              <Stack.Screen
                name="event/new"
                options={{ presentation: 'modal', title: 'New Event' }}
              />
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
            </Stack>
          </NavThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}
