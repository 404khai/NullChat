import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { signal } from '../api/signal';
import { generateSessionKey, keyToString, stringToKey } from '../crypto';
import { useIdentityStore } from '../store/identity';
import { useSessionStore } from '../store/session';
import { parseQRPayload } from '../utils/qr';

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
          <Button title="Cancel" color="#fff" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
      color: '#fff',
      textAlign: 'center',
      marginBottom: 20,
  },
  overlay: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
  },
  header: {
      alignItems: 'center',
      marginTop: 20,
  },
  title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
  },
  subtitle: {
      fontSize: 14,
      color: '#ccc',
  },
  frame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: 20,
      backgroundColor: 'transparent',
  }
});
