import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { signal } from '../api/signal';
import { generateSessionKey, keyToString, stringToKey } from '../crypto';
import { useIdentityStore } from '../store/identity';
import { useSessionStore } from '../store/session';
import { parseQRPayload } from '../utils/qr';
import { FONTS, COLORS } from '../constants/theme';

export default function QRScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const { setPeerInfo, setSessionKeyPair } = useSessionStore();
  const { username } = useIdentityStore();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
      if (permission && !permission.granted) {
          requestPermission();
      }
  }, [permission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera permission to scan QR codes</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    const payload = parseQRPayload(data);
    if (payload) {
        setScanned(true);
        try {
            const peerKey = stringToKey(payload.pk);
            setPeerInfo(peerKey, payload.u);

            // Generate my session key
            const myKeyPair = generateSessionKey();
            setSessionKeyPair(myKeyPair);

            // Publish my info to the handshake topic
            const topic = `nullchat/handshake/${payload.pk}`;
            const myInfo = {
                pk: keyToString(myKeyPair.publicKey),
                u: username
            };
            console.log('Publishing Handshake to:', topic);
            signal.publish(topic, JSON.stringify(myInfo));

            navigation.replace('Verification');
        } catch (e) {
            console.warn("Invalid key format", e);
            setScanned(false);
        }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: ["qr"],
        }}
      />
      <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan QR</Text>
            <Text style={styles.subtitle}>Align code within frame</Text>
          </View>
          <View style={styles.frame} />
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  text: {
      color: '#fff',
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: FONTS.regular,
  },
  overlay: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 50,
  },
  header: {
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 16,
      borderRadius: 12,
  },
  title: {
      color: '#fff',
      fontSize: 24,
      fontFamily: FONTS.monoBold,
      marginBottom: 4,
  },
  subtitle: {
      color: '#ccc',
      fontSize: 14,
      fontFamily: FONTS.mono,
  },
  frame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: COLORS.accent,
      borderRadius: 20,
      backgroundColor: 'transparent',
  },
  cancelButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 20,
  },
  cancelText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: FONTS.bold,
  },
});
