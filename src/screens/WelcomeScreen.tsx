import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import { useIdentityStore } from '../store/identity';
import { useSessionStore } from '../store/session';

export default function WelcomeScreen() {
  const router = useRouter();
  const { username, init } = useIdentityStore();
  const resetSession = useSessionStore((state: { resetSession: any; }) => state.resetSession);

  useEffect(() => {
    init();
    resetSession(); // Ensure session is clean on start
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
            source={require('../../assets/images/logo.jpg')} 
            style={styles.logo}
            resizeMode="contain"
        />
        <Text style={styles.title}>NullChat</Text>
        <Text style={styles.tagline}>No accounts. No memory.</Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>YOUR IDENTITY</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.hint}>This identity is temporary.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => router.push('/QRShare')}
          >
            <Text style={styles.buttonText}>Share Secure QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => router.push('/QRScan')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Scan Secure QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
      width: 120,
      height: 120,
      marginBottom: 24,
      borderRadius: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: FONTS.geistPixel,
    color: COLORS.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.dotoBold,
    color: '#888',
    marginBottom: 48,
  },
  card: {
    backgroundColor: COLORS.secondary,
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.dotoBold,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  username: {
    fontSize: 24,
    fontFamily: FONTS.geistPixel,
    color: COLORS.accent,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    fontFamily: FONTS.dotoBold,
    color: '#555',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.dotoBold,
    color: '#000',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});
