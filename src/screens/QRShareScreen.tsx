import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateSessionKey } from '../crypto';
import { useIdentityStore } from '../store/identity';
import { useSessionStore } from '../store/session';
import { createQRPayload } from '../utils/qr';

import { signal } from '../api/signal';
import { keyToString, stringToKey } from '../crypto';

export default function QRShareScreen({ navigation }: any) {
  const { username } = useIdentityStore();
  const { setSessionKeyPair, setPeerInfo } = useSessionStore();
  const [qrData, setQrData] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Generate session key on mount
    const keyPair = generateSessionKey();
    setSessionKeyPair(keyPair);
    
    // Create payload
    const payload = createQRPayload(keyPair.publicKey, username, 60000);
    setQrData(payload);

    // Listen for handshake
    const topic = `nullchat/handshake/${keyToString(keyPair.publicKey)}`;
    console.log('Subscribing to:', topic);
    
    signal.subscribe(topic, (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            console.log('Received Handshake:', data);
            if (data.pk && data.u) {
                const peerPk = stringToKey(data.pk);
                setPeerInfo(peerPk, data.u);
                signal.unsubscribe(topic);
                navigation.replace('Verification');
            }
        } catch (e) {
            console.error('Handshake Parse Error', e);
        }
    });

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          signal.unsubscribe(topic);
          navigation.goBack(); // Expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
        clearInterval(timer);
        signal.unsubscribe(topic);
    };
  }, []);

  if (!qrData) return <View style={styles.container}><Text>Generating...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan to Chat</Text>
        <Text style={styles.subtitle}>This QR code expires in {timeLeft}s</Text>
        
        <View style={styles.qrContainer}>
          <QRCode 
            value={qrData} 
            size={250} 
            backgroundColor="white" 
            color="black" 
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>YOUR ALIAS</Text>
          <Text style={styles.username}>{username}</Text>
        </View>

        <Text style={styles.hint}>
          Ask your peer to scan this code.{'\n'}
          A secure session will be established instantly.
        </Text>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 32,
  },
  info: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  cancelButton: {
      padding: 10,
  },
  cancelText: {
      color: '#666',
      fontSize: 16,
  }
});
