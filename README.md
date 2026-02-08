# NullChat

Zero-Account Secure Messaging with Pseudonymous QR Pairing.
No accounts. No memory. No servers (except for blind relay).

## 🧠 Core Design Principle
Identity is cryptographic. Usernames are cosmetic. Memory is optional and local.

## 🔐 Security & Cryptography

- **Identity Key**: Ed25519 (generated locally, stored securely).
- **Session Keys**: X25519 (ephemeral, destroyed after session).
- **Key Exchange**: ECDH (X25519) + HKDF (SHA-512).
- **Encryption**: XSalsa20-Poly1305 (via TweetNaCl, equivalent to ChaCha20-Poly1305).
- **Transport**: Blind WebSocket Relay (MQTT over WS).

## 🧪 Threat Model

### Defended Against
- **MITM Attacks**: Prevented via SAS (Short Authentication String) fingerprint verification during QR handshake.
- **Passive Network Surveillance**: All messages are end-to-end encrypted. Traffic analysis is minimized but timing/volume metadata exists.
- **Server Compromise**: Server only sees encrypted blobs. No keys are ever sent to the server. No history is stored on the server.
- **Replay Attacks**: Prevented via nonces (randomized for XSalsa20).
- **Message Tampering**: Prevented via Poly1305 authenticators.

### Not Defended Against
- **Compromised Devices**: If the OS is compromised, the app's memory can be read.
- **Screen Recording**: A user can record the screen.
- **Malicious Verified Peers**: If you trust the wrong person, they can leak your messages.
- **Physical Coercion**: "Rubber-hose cryptanalysis".

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Run on device: `npx expo start`

## ⚠️ Known Limitations (MVP)
- Signaling uses a public MQTT broker (`test.mosquitto.org`). For production, deploy a private broker.
- No background notifications (requires APNS/FCM which requires accounts).
- No file attachments.
- Session is lost if app is killed (by design).
