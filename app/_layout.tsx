import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AppProviders } from '../src/components/providers/AppProviders';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { SchedulerService } from '../src/services/schedulerService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 初始化調度服務
  useEffect(() => {
    SchedulerService.initialize();
    
    // 清理函數
    return () => {
      SchedulerService.stop();
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProviders>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AppProviders>
      </AuthProvider>
    </LanguageProvider>
  );
}
