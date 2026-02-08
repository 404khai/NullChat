import { create } from 'zustand';
import { KeyPair } from '../crypto';

export interface Message {
    id: string;
    text: string;
    sender: 'me' | 'peer';
    timestamp: number;
}

interface SessionState {
    sessionKeyPair: KeyPair | null; // My ephemeral key
    peerPublicKey: Uint8Array | null;
    peerUsername: string | null;
    sharedSecret: Uint8Array | null;
    messages: Message[];
    status: 'idle' | 'created_qr' | 'scanned_qr' | 'verifying' | 'connected';
    
    setSessionKeyPair: (keyPair: KeyPair) => void;
    setPeerInfo: (pk: Uint8Array, username: string) => void;
    setSharedSecret: (secret: Uint8Array) => void;
    addMessage: (msg: Message) => void;
    resetSession: () => void;
    setStatus: (status: SessionState['status']) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    sessionKeyPair: null,
    peerPublicKey: null,
    peerUsername: null,
    sharedSecret: null,
    messages: [],
    status: 'idle',

    setSessionKeyPair: (kp) => set({ sessionKeyPair: kp }),
    setPeerInfo: (pk, u) => set({ peerPublicKey: pk, peerUsername: u }),
    setSharedSecret: (s) => set({ sharedSecret: s }),
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    resetSession: () => set({ 
        sessionKeyPair: null, 
        peerPublicKey: null, 
        peerUsername: null, 
        sharedSecret: null, 
        messages: [],
        status: 'idle'
    }),
    setStatus: (s) => set({ status: s }),
}));
