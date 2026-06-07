import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    // Vous choisissez le nom ici (à gauche), et le chemin du fichier (à droite)
    // 'SamsungSharpSans': require('../assets/fonts/SamsungSharpSans.ttf'),
    // Si vous avez aussi la version Bold, vous pouvez l'ajouter comme ceci :
    'SamsungSharpSans-Bold': require('../../assets/fonts/SamsungSharpSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="rankings" options={{ headerShown: false }} />
    </Stack>
  );
}