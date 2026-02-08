import mqtt from 'mqtt';
import { Buffer } from 'buffer';

// Polyfill Buffer
if (typeof global.Buffer !== 'function') {
    (global as any).Buffer = Buffer;
}
// Polyfill process (needed by mqtt)
if (typeof global.process !== 'object') {
    (global as any).process = require('process');
}

const BROKER_URL = 'ws://test.mosquitto.org:8080';

class SignalService {
    client: mqtt.MqttClient | null = null;
    callbacks: Map<string, (msg: Uint8Array) => void> = new Map();

    connect() {
        if (this.client) return;
        console.log('Connecting to Signal Server...');
        try {
            this.client = mqtt.connect(BROKER_URL);
            
            this.client.on('connect', () => {
                console.log('Signal Connected');
            });

            this.client.on('message', (topic, message) => {
                const cb = this.callbacks.get(topic);
                if (cb) cb(message);
            });

            this.client.on('error', (err) => {
                console.warn('Signal Error', err);
            });
            
            this.client.on('offline', () => {
                 console.log('Signal Offline');
            });
        } catch (e) {
            console.error('Signal Connection Failed', e);
        }
    }

    subscribe(topic: string, callback: (msg: Uint8Array) => void) {
        if (!this.client) this.connect();
        this.client?.subscribe(topic, (err) => {
            if (err) console.error('Subscribe Error', err);
        });
        this.callbacks.set(topic, callback);
    }

    unsubscribe(topic: string) {
        this.client?.unsubscribe(topic);
        this.callbacks.delete(topic);
    }

    publish(topic: string, message: Uint8Array | string) {
        if (!this.client) this.connect();
        const payload = typeof message === 'string' ? message : Buffer.from(message);
        this.client?.publish(topic, payload);
    }
}

export const signal = new SignalService();
