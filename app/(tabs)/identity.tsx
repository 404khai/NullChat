import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../src/constants/theme';
import { useIdentityStore } from '../../src/store/identity';

export default function IdentityScreen() {
  const { username } = useIdentityStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Identity</Text>
        <View style={styles.card}>
          <Text style={styles.label}>USERNAME</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.info}>
            This identity is stored locally on your device. 
            Clearing app data will erase it.
          </Text>
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
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.monoBold,
    color: COLORS.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.secondary,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#888',
    marginBottom: 8,
    letterSpacing: 1,
  },
  username: {
    fontSize: 32,
    fontFamily: FONTS.dotoBold,
    color: COLORS.accent,
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#aaa',
    lineHeight: 20,
  },
});
