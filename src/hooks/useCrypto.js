import CryptoJS from 'crypto-js';
import toast from 'react-hot-toast';

// -----------------------------------------------
// Config
// -----------------------------------------------
const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// -----------------------------------------------
// Helper: Convert WordArray to Uint8Array
// -----------------------------------------------
function wordArrayToUint8Array(wordArray) {
  const bytes = new Uint8Array(wordArray.sigBytes);
  for (let i = 0; i < wordArray.sigBytes; i++) {
    bytes[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return bytes;
}

// -----------------------------------------------
// Helper: Derive key using PBKDF2 for brute force resistance
// -----------------------------------------------
function deriveKey(privateKey, salt) {
  return CryptoJS.PBKDF2(privateKey, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  });
}

// -----------------------------------------------
// Helper: Download blob as file
// -----------------------------------------------
function downloadBlob(bytes, fileName) {
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

// -----------------------------------------------
// Encrypt file
// Format output: [salt(16)] + [iv(16)] + [ciphertext]
// -----------------------------------------------
export function encryptFile(file, fileName, privateKey) {
  if (!file) return toast.error('Please select a file first');
  if (file.size > MAX_SIZE_BYTES) return toast.error(`File size must be under ${MAX_SIZE_MB}MB`);
  if (![16, 24, 32].includes(privateKey.length)) return toast.error('Key length must be 16, 24, or 32 characters');

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result);

      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(16);
      const iv = CryptoJS.lib.WordArray.random(16);

      // Derive key from password + salt using PBKDF2
      const derivedKey = deriveKey(privateKey, salt);

      // SHA256 checksum for integrity verification on decrypt
      const checksum = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
      const dataWithChecksum = CryptoJS.enc.Utf8.parse(checksum).concat(wordArray);

      // Encrypt using AES-CBC
      const cipher = CryptoJS.AES.encrypt(dataWithChecksum, derivedKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine: salt + iv + ciphertext
      const encrypted = salt.concat(iv).concat(cipher.ciphertext);
      const encryptedBytes = wordArrayToUint8Array(encrypted);

      downloadBlob(encryptedBytes, `${fileName}.encrypted`);
      toast.success('Encryption success!');
    } catch {
      toast.error('Encryption failed: Something went wrong');
    }
  };
  reader.readAsArrayBuffer(file);
}

// -----------------------------------------------
// Decrypt file
// Expected format: [salt(16)] + [iv(16)] + [ciphertext]
// -----------------------------------------------
export function decryptFile(file, fileName, privateKey) {
  if (!file) return toast.error('Please select a file first');
  if (file.size > MAX_SIZE_BYTES) return toast.error(`File size must be under ${MAX_SIZE_MB}MB`);
  if (![16, 24, 32].includes(privateKey.length)) return toast.error('Key length must be 16, 24, or 32 characters');
  if (!fileName.endsWith('.encrypted')) return toast.error('Selected file is not an encrypted file (.encrypted)');

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const encryptedData = new Uint8Array(reader.result);

      // Extract salt, iv, and ciphertext from file
      const salt = CryptoJS.lib.WordArray.create(encryptedData.slice(0, 16));
      const iv = CryptoJS.lib.WordArray.create(encryptedData.slice(16, 32));
      const ciphertext = CryptoJS.lib.WordArray.create(encryptedData.slice(32));

      // Re-derive key from password + extracted salt
      const derivedKey = deriveKey(privateKey, salt);

      // Decrypt using AES-CBC
      const decrypted = CryptoJS.AES.decrypt({ ciphertext }, derivedKey, {
        iv,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedBytes = wordArrayToUint8Array(decrypted);

      // Verify SHA256 checksum for integrity
      const checksumHex = new TextDecoder().decode(decryptedBytes.slice(0, 64));
      const fileData = decryptedBytes.slice(64);
      const checksum = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileData)).toString(CryptoJS.enc.Hex);

      if (checksum !== checksumHex) throw new Error('Invalid key or corrupted file');

      downloadBlob(fileData, fileName.replace('.encrypted', ''));
      toast.success('Decryption success!');
    } catch {
      toast.error('Decryption failed: Invalid key or corrupted file');
    }
  };
  reader.readAsArrayBuffer(file);
}