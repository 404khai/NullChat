import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';
import './src/crypto'; // Load polyfills

import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import QRShareScreen from './src/screens/QRShareScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Geist-Regular': require('./assets/fonts/Geist-Regular.ttf'),
    'Geist-Bold': require('./assets/fonts/Geist-Bold.ttf'),
    'GeistMono-Regular': require('./assets/fonts/GeistMono-Regular.ttf'),
    'GeistMono-Bold': require('./assets/fonts/GeistMono-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#000' } }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="QRShare" component={QRShareScreen} />
        <Stack.Screen name="QRScan" component={QRScanScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
