// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments(); // Permet de savoir sur quel écran on est

  useEffect(() => {
  const resetAndCheck = async () => {
    // AJOUTE CETTE LIGNE :
    await AsyncStorage.clear(); 
    
    // Ensuite ton code habituel
    checkFirstLaunch();
  };

  resetAndCheck();
}, []);

useEffect(() => {
  if (isFirstLaunch === null) return;

  if (isFirstLaunch === true) {
    router.replace('/welcome');
  } else {
    router.replace('/(tabs)');
  }
}, [isFirstLaunch]);

  async function checkFirstLaunch() {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      setIsFirstLaunch(false);
    } finally {
      SplashScreen.hideAsync();
    }
  }

  // LOGIQUE DE REDIRECTION
  useEffect(() => {
    if (isFirstLaunch === null) return; // On attend que le check soit fini

    const inTabsGroup = segments[0] === '(tabs)';

    if (isFirstLaunch && !inTabsGroup) {
      // Si c'est la 1ère fois, on s'assure d'être sur welcome
      router.replace('/welcome');
    } else if (!isFirstLaunch && !inTabsGroup) {
      // Si ce n'est pas la 1ère fois, on va direct aux tabs
      router.replace('/(tabs)');
    }
  }, [isFirstLaunch, segments]);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}