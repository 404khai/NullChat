import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIdentityStore } from '../store/identity';
import { useSessionStore } from '../store/session';

export default function WelcomeScreen({ navigation }: any) {
  const { username, init } = useIdentityStore();
  const resetSession = useSessionStore(state => state.resetSession);

  useEffect(() => {
    init();
    resetSession(); // Ensure session is clean on start
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
            onPress={() => navigation.navigate('QRShare')}
          >
            <Text style={styles.buttonText}>Share Secure QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => navigation.navigate('QRScan')}
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
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#888',
    marginBottom: 48,
    fontFamily: FONTS.regular,
  },
  card: {
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.mono,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: FONTS.monoBold,
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#555',
    fontFamily: FONTS.regular,
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
    backgroundColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bold,
    color: '#000',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});
