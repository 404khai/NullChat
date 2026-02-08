import { encodeBase64 } from 'tweetnacl-util';

export interface QRPayload {
    pk: string; // Ephemeral public key (Base64)
    u: string;  // Username
    exp: number; // Expiry timestamp (ms)
}

export const createQRPayload = (publicKey: Uint8Array, username: string, ttlMs: number = 60000): string => {
    const payload: QRPayload = {
        pk: encodeBase64(publicKey),
        u: username,
        exp: Date.now() + ttlMs,
    };
    return JSON.stringify(payload);
};

export const parseQRPayload = (data: string): QRPayload | null => {
    try {
        const payload = JSON.parse(data) as QRPayload;
        // Basic validation
        if (!payload.pk || !payload.exp) return null;
        
        // Check expiry
        if (Date.now() > payload.exp) {
            console.warn('QR Code expired');
            // We could return a specific error, but for now null implies invalid/expired
            return null; 
        }
        return payload;
    } catch (e) {
        return null;
    }
};
