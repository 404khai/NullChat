import nacl from 'tweetnacl';

const BLOCK_SIZE = 128; // SHA-512 block size
const HASH_SIZE = 64;   // SHA-512 output size

function hmac(key: Uint8Array, data: Uint8Array): Uint8Array {
  let k = new Uint8Array(key);
  if (k.length > BLOCK_SIZE) {
    k = new Uint8Array(nacl.hash(k));
  }
  if (k.length < BLOCK_SIZE) {
    const tmp = new Uint8Array(BLOCK_SIZE);
    tmp.set(k);
    k = tmp;
  }

  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = k[i] ^ 0x36;
    opad[i] = k[i] ^ 0x5c;
  }

  const inner = new Uint8Array(BLOCK_SIZE + data.length);
  inner.set(ipad);
  inner.set(data, BLOCK_SIZE);
  const innerHash = nacl.hash(inner);

  const outer = new Uint8Array(BLOCK_SIZE + HASH_SIZE);
  outer.set(opad);
  outer.set(innerHash, BLOCK_SIZE);
  
  return nacl.hash(outer);
}

export function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  // Extract
  // RFC 5869: PRK = HMAC-Hash(salt, IKM)
  // If salt is not provided, it is set to a string of HashLen zeros.
  // Here we assume salt is provided or handle it.
  const effectiveSalt = salt.length > 0 ? salt : new Uint8Array(HASH_SIZE);
  const prk = hmac(effectiveSalt, ikm);

  // Expand
  // T(0) = empty
  // T(1) = HMAC-Hash(PRK, T(0) | info | 0x01)
  // T(2) = HMAC-Hash(PRK, T(1) | info | 0x02)
  // ...
  let okm = new Uint8Array(0);
  let lastT = new Uint8Array(0);
  let i = 0;

  while (okm.length < length) {
    i++;
    const infoBuffer = new Uint8Array(lastT.length + info.length + 1);
    infoBuffer.set(lastT);
    infoBuffer.set(info, lastT.length);
    infoBuffer[infoBuffer.length - 1] = i;
    
    lastT = new Uint8Array(hmac(prk, infoBuffer));
    
    const newOkm = new Uint8Array(okm.length + lastT.length);
    newOkm.set(okm);
    newOkm.set(lastT, okm.length);
    okm = newOkm;
  }

  return okm.slice(0, length);
}
