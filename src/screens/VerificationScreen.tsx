import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import nacl from 'tweetnacl';
import { COLORS, FONTS } from '../constants/theme';
import { computeSharedSecret } from '../crypto';
import { useSessionStore } from '../store/session';
export default function VerificationScreen({ navigation }: any) {
  const { sessionKeyPair, peerPublicKey, peerUsername, setSharedSecret } = useSessionStore();
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    if (sessionKeyPair && peerPublicKey) {
      // Compute shared secret
      const secret = computeSharedSecret(sessionKeyPair.privateKey, peerPublicKey);
      setSharedSecret(secret);

      // Compute fingerprint (hash of secret)
      const hash = nacl.hash(secret);
      // Take first 4 bytes as hex
      const hex = Array.from(hash.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      setFingerprint(hex.match(/.{1,2}/g)?.join(' ') || hex);
    }
  }, [sessionKeyPair, peerPublicKey]);

  const handleVerify = () => {
      router.replace('/(tabs)');
  };

  const handleCancel = () => {
      router.dismissAll();
      router.replace('/');
  };

  return (
      <SafeAreaView style={styles.container}>
          <View style={styles.content}>
              <Text style={styles.title}>Verify Session</Text>
              <Text style={styles.subtitle}>Compare this code with your peer</Text>
              
              <View style={styles.fingerprintContainer}>
                  <Text style={styles.fingerprint}>{fingerprint}</Text>
              </View>

              <Text style={styles.peerName}>Peer: {peerUsername}</Text>
              
              <View style={styles.spacer} />

              <View style={styles.actions}>
                  <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleVerify}>
                      <Text style={styles.primaryButtonText}>I've verified this device</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleCancel}>
                      <Text style={styles.cancelText}>Cancel</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.monoBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#888',
    marginBottom: 48,
  },
  fingerprintContainer: {
    padding: 32,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  fingerprint: {
    fontSize: 48,
    fontFamily: FONTS.monoBold,
    color: COLORS.accent, // Cyberpunk green
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  peerName: {
      fontSize: 20,
      fontFamily: FONTS.mono,
      color: COLORS.text,
      marginBottom: 20,
  },
  spacer: {
      flex: 1,
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
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#000',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.danger,
  },
});
