import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useSessionStore } from '../store/session';
import { computeSharedSecret } from '../crypto';
import nacl from 'tweetnacl';

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
      navigation.replace('Chat');
  };

  const handleCancel = () => {
      navigation.popToTop();
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
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 48,
  },
  fingerprintContainer: {
    padding: 32,
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  fingerprint: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ffcc', // Cyberpunk green
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  peerName: {
      fontSize: 20,
      color: '#fff',
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
    backgroundColor: '#fff',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  cancelText: {
    fontSize: 16,
    color: '#ff4444',
  },
});
