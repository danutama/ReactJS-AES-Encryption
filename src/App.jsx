import React, { useRef, useState } from 'react';
import DropZone from './components/DropZone';
import InputKey from './components/InputKey';
import Footer from './components/Footer';
import { encryptFile, decryptFile } from './hooks/useCrypto';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRefresh = () => {
    setFile(null);
    setFileName('');
    setPrivateKey('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="app container py-5 d-flex justify-content-center flex-column">
      <div className="text-center mb-4">
        <div className="mb-3 d-flex justify-content-center align-items-center">
          <span className="icon blue-pastel-1 d-flex justify-content-center align-items-center pt-1">
            <i className="bi bi-shield-fill-check text-primary"></i>
          </span>
        </div>
        <h1 className="mb-2 fw-bold">AES Security</h1>
        <p className="text-secondary">Securely encrypt and decrypt your files with AES 128, 192, or 256 bit</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <DropZone file={file} fileName={fileName} fileInputRef={fileInputRef} handleFileChange={handleFileChange} setFile={setFile} setFileName={setFileName} />

          <InputKey privateKey={privateKey} setPrivateKey={setPrivateKey} />

          <div className="d-flex justify-content-sm-center justify-content-between gap-sm-2 gap-1 mt-4">
            <button className="btn btn-primary" onClick={() => encryptFile(file, fileName, privateKey)}>
              <i className="bi bi-lock-fill"></i> Encrypt
            </button>
            <button className="btn btn-primary" onClick={() => decryptFile(file, fileName, privateKey)}>
              <i className="bi bi-unlock-fill"></i> Decrypt
            </button>
            <button className="btn btn-refresh" onClick={handleRefresh}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>

          <div className="mt-4">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
