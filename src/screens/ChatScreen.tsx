import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import nacl from 'tweetnacl';
// tweetnacl-util not available, implement helpers inline
function decodeBase64(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, 'base64'));
}
function encodeBase64(b: Uint8Array): string {
  return Buffer.from(b).toString('base64');
}
import { signal } from '../api/signal';
import { COLORS, FONTS } from '../constants/theme';
import { useIdentityStore } from '../store/identity';
import { Message, useSessionStore } from '../store/session';

export default function ChatScreen({ navigation }: any) {
  const { sharedSecret, messages, addMessage, peerUsername, resetSession } = useSessionStore();
  const { username } = useIdentityStore();
  const [text, setText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);
  const [topic, setTopic] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!sharedSecret) {
        navigation.replace('Welcome');
        return;
    }
    
    // Derive key: SHA-512(secret) -> take first 32 bytes
    const hash = nacl.hash(sharedSecret);
    const key = hash.slice(0, 32);
    setEncryptionKey(key);

    // Topic: SHA-512(secret) -> take next 16 bytes encoded
    const topicHash = hash.slice(32, 48);
    const topicStr = encodeBase64(topicHash).replace(/[\/\+]/g, '_'); // Safe URL chars
    const chatTopic = `nullchat/chat/${topicStr}`;
    setTopic(chatTopic);

    console.log('Chat Topic:', chatTopic);

    // Subscribe
    signal.subscribe(chatTopic, (msg) => {
        try {
            const payloadStr = Buffer.from(msg).toString('utf8');
            const env = JSON.parse(payloadStr);
            
            if (env.sender === username) return; // Ignore own messages

            // Decrypt
            const nonce = decodeBase64(env.nonce);
            const ciphertext = decodeBase64(env.ciphertext);
            const decrypted = nacl.secretbox.open(ciphertext, nonce, key);

            if (decrypted) {
                const decryptedText = Buffer.from(decrypted).toString('utf8');
                addMessage({
                    id: Date.now().toString() + Math.random(),
                    text: decryptedText,
                    sender: 'peer',
                    timestamp: Date.now()
                });
            } else {
                console.warn('Failed to decrypt message');
            }
        } catch (e) {
            console.error('Message handling error', e);
        }
    });

    return () => signal.unsubscribe(chatTopic);
  }, [sharedSecret]);

  const handleSend = () => {
      if (!text.trim() || !encryptionKey) return;

      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const messageBytes = Buffer.from(text, 'utf8');
      const ciphertext = nacl.secretbox(messageBytes, nonce, encryptionKey);

      const payload = {
          nonce: encodeBase64(nonce),
          ciphertext: encodeBase64(ciphertext),
          sender: username
      };

      signal.publish(topic, JSON.stringify(payload));

      addMessage({
          id: Date.now().toString(),
          text,
          sender: 'me',
          timestamp: Date.now()
      });
      setText('');
  };

  const handleExit = () => {
      resetSession();
      navigation.popToTop();
  };

  const renderItem = ({ item }: { item: Message }) => (
      <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.peerMessage]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
  );

  return (
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
              <View>
                  <Text style={styles.headerTitle}>Secure Session</Text>
                  <Text style={styles.headerSubtitle}>{peerUsername}</Text>
              </View>
              <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
                  <Text style={styles.exitText}>End Chat</Text>
              </TouchableOpacity>
          </View>
          
          <View style={styles.banner}>
              <Text style={styles.bannerText}>Messages are not stored. Leaving clears this chat.</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
              <View style={styles.inputContainer}>
                  <TextInput
                      style={styles.input}
                      value={text}
                      onChangeText={setText}
                      placeholder="Type a message..."
                      placeholderTextColor="#666"
                      returnKeyType="send"
                      onSubmitEditing={handleSend}
                  />
                  <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                      <Text style={styles.sendText}>Send</Text>
                  </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
  },
  headerTitle: {
      color: COLORS.accent,
      fontFamily: FONTS.monoBold,
      fontSize: 16,
  },
  headerSubtitle: {
      color: COLORS.text,
      fontFamily: FONTS.mono,
      fontSize: 14,
  },
  exitButton: {
      padding: 8,
      backgroundColor: '#330000',
      borderRadius: 8,
  },
  exitText: {
      color: COLORS.danger,
      fontFamily: FONTS.bold,
  },
  banner: {
      backgroundColor: COLORS.secondary,
      padding: 8,
      alignItems: 'center',
  },
  bannerText: {
      color: '#888',
      fontSize: 12,
      fontFamily: FONTS.mono,
  },
  listContent: {
      padding: 16,
  },
  messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
  },
  myMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#007AFF',
      borderBottomRightRadius: 4,
  },
  peerMessage: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.secondary,
      borderBottomLeftRadius: 4,
  },
  messageText: {
      color: COLORS.text,
      fontSize: 16,
      fontFamily: FONTS.regular,
  },
  timestamp: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end',
      fontFamily: FONTS.mono,
  },
  inputContainer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      alignItems: 'center',
  },
  input: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      color: COLORS.text,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      fontFamily: FONTS.regular,
  },
  sendButton: {
      padding: 10,
  },
  sendText: {
      color: '#007AFF',
      fontFamily: FONTS.bold,
      fontSize: 16,
  },
});
