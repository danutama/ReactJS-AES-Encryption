import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import GitHub from './components/Github';
import uploadIcon from '../public/upload-icon.png';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState('Status: -');
  const [processTime, setProcessTime] = useState('Processing Time: -');
  const [fileType, setFileType] = useState('Document Type: -');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const fileInputRef = useRef(null);

  // ==== PWA ==== //
  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAddToHomeScreenClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };
  // ======== //

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileType(`Document Type: ${getFileType(selectedFile.name)}`);
    }
  };

  const handleKeyChange = (e) => {
    setPrivateKey(e.target.value);
  };

  const showAlert = (message) => {
    alert(message);
  };

  // ================ ENCRYPTION ================= //
  const encryptFile = () => {
    if (!file) {
      showAlert('Please select a file first');
      return;
    }

    if (privateKey.length !== 16 && privateKey.length !== 24 && privateKey.length !== 32) {
      showAlert('Key length must be 16, 24, or 32 characters');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const start = performance.now();

      const wordArray = CryptoJS.lib.WordArray.create(reader.result);
      const key = CryptoJS.enc.Utf8.parse(privateKey);
      const iv = CryptoJS.lib.WordArray.random(16);

      // Compute checksum (SHA-256 hash) of the original file data
      const checksum = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

      // Concatenate checksum with original data
      const dataWithChecksum = CryptoJS.enc.Utf8.parse(checksum).concat(wordArray);

      const cipher = CryptoJS.AES.encrypt(dataWithChecksum, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const end = performance.now();
      const encryptedFileName = `${fileName}.encrypted`;

      const encrypted = iv.concat(cipher.ciphertext);

      const encryptedBytes = new Uint8Array(encrypted.sigBytes);
      for (let i = 0; i < encrypted.sigBytes; i++) {
        encryptedBytes[i] = (encrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      const blob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = encryptedFileName;
      a.click();

      setStatus('Status: Encryption Success');
      setProcessTime(`Processing Time: ${(end - start).toFixed(2)} ms`);
    };
    reader.readAsArrayBuffer(file);
  };
  // ================ END ================= //

  // ================ DECRYPTION ================= //
  const decryptFile = () => {
    if (!file) {
      showAlert('Please select a file first');
      return;
    }

    if (privateKey.length !== 16 && privateKey.length !== 24 && privateKey.length !== 32) {
      showAlert('Key length must be 16, 24, or 32 characters');
      return;
    }

    if (!fileName.endsWith('.encrypted')) {
      showAlert('Selected file is not an encrypted file (.encrypted)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const start = performance.now();

        const encryptedData = new Uint8Array(reader.result);
        const key = CryptoJS.enc.Utf8.parse(privateKey);

        const iv = CryptoJS.lib.WordArray.create(encryptedData.slice(0, 16));
        const ciphertext = CryptoJS.lib.WordArray.create(encryptedData.slice(16));

        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
          iv: iv,
          padding: CryptoJS.pad.Pkcs7,
        });

        // Extract checksum from decrypted data
        const decryptedBytes = new Uint8Array(decrypted.sigBytes);
        for (let i = 0; i < decrypted.sigBytes; i++) {
          decryptedBytes[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        const checksumHex = new TextDecoder().decode(decryptedBytes.slice(0, 64));
        const fileData = decryptedBytes.slice(64);

        // Verify checksum
        const wordArray = CryptoJS.lib.WordArray.create(fileData);
        const checksum = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        if (checksum !== checksumHex) {
          throw new Error('Invalid key or corrupted file');
        }

        const end = performance.now();

        const blob = new Blob([fileData], { type: 'application/octet-stream' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace('.encrypted', '');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStatus('Status: Decryption Success');
        setProcessTime(`Processing Time: ${(end - start).toFixed(2)} ms`);
      } catch (error) {
        console.error(error);
        showAlert('Decryption failed: Invalid key or corrupted file');
        setStatus('Status: Decryption Failed');
        setProcessTime('Processing Time: -');
      }
    };

    reader.readAsArrayBuffer(file);
  };
  // ================ END ================= //

  const handleRefresh = () => {
    setFile(null);
    setFileName('');
    setPrivateKey('');
    setStatus('Status: -');
    setProcessTime('Processing Time: -');
    setFileType('Document Type: -');
    fileInputRef.current.value = null;
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'].includes(ext)) {
      return 'Image';
    } else if (['pdf'].includes(ext)) {
      return 'PDF';
    } else if (['doc', 'docx'].includes(ext)) {
      return 'Word';
    } else if (['xlsx', 'xls'].includes(ext)) {
      return 'Excel';
    } else if (['ppt', 'pptx'].includes(ext)) {
      return 'PowerPoint';
    } else if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) {
      return 'Video';
    } else if (['mp3', 'wav', 'aac'].includes(ext)) {
      return 'Audio';
    } else if (['txt', 'csv'].includes(ext)) {
      return 'Text';
    } else if (['encrypted'].includes(ext)) {
      return 'Encrypted';
    } else {
      return 'Unknown';
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>AES Security</h1>
        <p className="subtitle">Securely encrypt and decrypt your files with the AES algorithm 128, 192, 256 bit</p>
        <div className="form">
          <div className="drop-container">
            <div
              className="drop-zone"
              onClick={handleButtonClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  setFile(droppedFile);
                  setFileName(droppedFile.name);
                  setFileType(`Document Type: ${getFileType(droppedFile.name)}`);
                }
              }}
            >
              {!file && (
                <div className="upload-icon-container">
                  <img src={uploadIcon} alt="Upload Icon" className="upload-icon" />
                  <p>Drag and drop or browse file</p>
                </div>
              )}
              {file && (
                <div className="file-info">
                  <p className="file-name">{fileName}</p>
                </div>
              )}
            </div>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

          <div className="input-container">
            <input type="text" value={privateKey} onChange={handleKeyChange} placeholder="Enter Private Key (16/24/32 char)" />
          </div>

          <div className="btn-container">
            <button onClick={encryptFile}>Encrypt</button>
            <button onClick={decryptFile}>Decrypt</button>
            <button onClick={handleRefresh}>Refresh</button>
          </div>

          <div className="status-container">
            <p>{status}</p>
            <p>{processTime}</p>
            <p>{fileType}</p>
          </div>

          <div className="footer">
            <GitHub />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
