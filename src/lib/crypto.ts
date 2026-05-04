// Simple password-based AES-GCM encrypt/decrypt helpers using Web Crypto
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufToB64(buf: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64ToBuf(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(password: string, saltBuffer: ArrayBuffer) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuffer, iterations: 120000, hash: "SHA-256" } as Pbkdf2Params,
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptWithPassword(password: string, plaintext: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt.buffer);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
  const payload = {
    v: 1,
    salt: bufToB64(salt.buffer),
    iv: bufToB64(iv.buffer),
    ct: bufToB64(ct),
  };
  return JSON.stringify(payload);
}

export async function decryptWithPassword(password: string, payloadStr: string) {
  let payload: { v: number; salt: string; iv: string; ct: string };
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    throw new Error("Payload is not encrypted or invalid format");
  }
  if (!payload || !payload.salt || !payload.iv || !payload.ct) throw new Error("Invalid payload");
  const saltBuf = b64ToBuf(payload.salt);
  const iv = new Uint8Array(b64ToBuf(payload.iv));
  const ct = b64ToBuf(payload.ct);
  const key = await deriveKey(password, saltBuf);
  try {
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return decoder.decode(plainBuf);
  } catch (err) {
    throw new Error("Decryption failed (bad password or corrupted data)");
  }
}

export default {
  encryptWithPassword,
  decryptWithPassword,
};
// simple XOR + base64 helpers used by Journal and decrypt page
export function encrypt(message: string, password: string): string {
  if (!password) return btoa(unescape(encodeURIComponent(message)));
  let out = "";
  for (let i = 0; i < message.length; i++) {
    out += String.fromCharCode(message.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  return btoa(unescape(encodeURIComponent(out)));
}

export function decrypt(cipher: string, password: string): string | null {
  try {
    const raw = decodeURIComponent(escape(atob(cipher)));
    let out = "";
    for (let i = 0; i < raw.length; i++) {
      out += String.fromCharCode(raw.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    if (!/^[\s\S]*$/.test(out) || out.split("").some((c) => c.charCodeAt(0) > 0 && c.charCodeAt(0) < 9)) {
      return null;
    }
    return out;
  } catch {
    return null;
  }
}
