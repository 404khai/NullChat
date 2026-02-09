import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

// Polyfill for random bytes
const polyfillCrypto = () => {
    if (typeof global.crypto !== 'object') {
        (global as any).crypto = {};
    }
    if (typeof global.crypto.getRandomValues !== 'function') {
        (global.crypto as any).getRandomValues = (array: Uint8Array) => {
             return Crypto.getRandomValues(array);
        };
    }
};

polyfillCrypto();

export interface KeyPair {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}

export const generateIdentityKey = (): KeyPair => {
    const kp = nacl.sign.keyPair();
    return { publicKey: kp.publicKey, privateKey: kp.secretKey };
};

export const generateSessionKey = (): KeyPair => {
    const kp = nacl.box.keyPair();
    return { publicKey: kp.publicKey, privateKey: kp.secretKey };
};

export const keyToString = (key: Uint8Array): string => {
    return encodeBase64(key);
};

export const stringToKey = (str: string): Uint8Array => {
    return decodeBase64(str);
};

export const sign = (message: Uint8Array, privateKey: Uint8Array): Uint8Array => {
    return nacl.sign.detached(message, privateKey);
};

export const verify = (message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean => {
    return nacl.sign.detached.verify(message, signature, publicKey);
};

// ECDH: Compute shared secret
export const computeSharedSecret = (mySecretKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array => {
    return nacl.scalarMult(mySecretKey, theirPublicKey);
};
