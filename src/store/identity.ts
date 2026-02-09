import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateIdentityKey, KeyPair } from '../crypto';
import { generateUsername } from '../utils/username';

interface IdentityState {
  keyPair: KeyPair | null;
  username: string;
  init: () => Promise<void>;
  regenerateUsername: () => void;
  resetIdentity: () => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<any> => {
    const value = await AsyncStorage.getItem(name);
    if (!value) return null;
    const parsed = JSON.parse(value);
    // deserialize
    if (parsed.state && parsed.state.keyPair) {
       parsed.state.keyPair.publicKey = decodeBase64(parsed.state.keyPair.publicKey);
       parsed.state.keyPair.privateKey = decodeBase64(parsed.state.keyPair.privateKey);
    }
    return parsed;
  },
  setItem: async (name: string, value: any): Promise<void> => {
     // serialize
     const storedValue = {
         ...value,
         state: {
             ...value.state,
             keyPair: value.state.keyPair ? {
                 publicKey: encodeBase64(value.state.keyPair.publicKey),
                 privateKey: encodeBase64(value.state.keyPair.privateKey),
             } : null
         }
     };
     await AsyncStorage.setItem(name, JSON.stringify(storedValue));
  },
  removeItem: AsyncStorage.removeItem,
};

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      keyPair: null,
      username: '',
      init: async () => {
        const state = get();
        if (!state.keyPair) {
            set({ 
                keyPair: generateIdentityKey(),
                username: generateUsername() 
            });
        }
      },
      regenerateUsername: () => set({ username: generateUsername() }),
      resetIdentity: () => set({ keyPair: generateIdentityKey(), username: generateUsername() }),
    }),
    {
      name: 'nullchat-identity',
      storage: secureStorage,
    }
  )
);
