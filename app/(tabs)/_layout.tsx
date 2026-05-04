import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Garde l'écran de chargement visible jusqu'à ce que l'app soit prête
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    // Cache le splash screen immédiatement (ou après tes chargements de données)
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#000' }, // Évite les flashs blancs entre les vues
        }}
      >
        {/* L'ordre définit la priorité : "welcome" est ton point d'entrée par défaut */}
        <Stack.Screen 
          name="welcome" 
          options={{ 
            headerShown: false, 
            animation: 'none' 
          }} 
        />

        {/* Contient ton index.tsx (le catalogue de poissons) */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* Page de détails avec animation latérale premium */}
        <Stack.Screen
          name="details/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />

        {/* Route de secours en cas d'erreur de lien */}
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Assure que les icônes de batterie/heure restent blanches sur fond noir */}
      <StatusBar style="light" />
    </ThemeProvider>
  );
}