import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// On empêche le splash de partir automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. On vérifie le stockage local
        await AsyncStorage.clear();
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // 2. On décide du chemin AVANT d'afficher quoi que ce soit
        if (hasSeenOnboarding === null) {
          setInitialRoute('welcome');
        } else {
          setInitialRoute('(tabs)');
        }
      } catch (e) {
        setInitialRoute('(tabs)');
      } finally {
        // 3. On signale que l'app est prête
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // 4. Une fois prêt, on cache le Splash et on saute sur la bonne route
    if (isReady && initialRoute) {
      // On utilise replace pour ne pas avoir de transition "back"
      router.replace(initialRoute as any);
      SplashScreen.hideAsync();
    }
  }, [isReady, initialRoute]);

  // Tant qu'on n'est pas prêt, on ne rend RIEN (on reste sur l'image du Splash)
  if (!isReady) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="welcome" options={{ animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      </Stack>
    </ThemeProvider>
  );
}