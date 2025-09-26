// app/_layout.tsx
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { Text } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': require('../assets/fonts/Quicksand/Quicksand-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading Fonts...</Text>;
  }

  return <Slot />;
}
