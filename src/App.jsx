import React, { useRef, useState } from 'react';
import DropZone from './components/DropZone';
import InputKey from './components/InputKey';
import Footer from './components/Footer';
import { encryptFile, decryptFile } from './hooks/useCrypto';

const INITIAL_STATE = { file: null, fileName: '', privateKey: '' };

function App() {
  const [{ file, fileName, privateKey }, setState] = useState(INITIAL_STATE);
  const fileInputRef = useRef(null);

  const handleFileChange = ({ target: { files } }) => {
    const selected = files[0];
    if (selected) setState(prev => ({ ...prev, file: selected, fileName: selected.name }));
  };

  const handleRefresh = () => {
    setState(INITIAL_STATE);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="app container py-5 d-flex justify-content-center flex-column">
      <div className="text-center mb-4">
        <div className="mb-3 d-flex justify-content-center align-items-center">
          <span className="icon blue-pastel-1 d-flex justify-content-center align-items-center pt-1">
            <i className="bi bi-shield-fill-check text-primary" />
          </span>
        </div>
        <h1 className="mb-2 fw-bold">CipherFile</h1>
        <p className="text-secondary text-center">Securely encrypt your files with AES 128, 192, or 256 bit</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <DropZone
            file={file}
            fileName={fileName}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            setFile={(file) => setState(prev => ({ ...prev, file }))}
            setFileName={(fileName) => setState(prev => ({ ...prev, fileName }))}
          />

          <InputKey
            privateKey={privateKey}
            setPrivateKey={(privateKey) => setState(prev => ({ ...prev, privateKey }))}
          />

          <div className="d-flex justify-content-sm-center justify-content-between gap-sm-2 gap-1 mt-4">
            <button className="btn btn-primary rounded-1" onClick={() => encryptFile(file, fileName, privateKey)}>
              <i className="bi bi-lock-fill" /> Encrypt
            </button>
            <button className="btn btn-primary rounded-1" onClick={() => decryptFile(file, fileName, privateKey)}>
              <i className="bi bi-unlock-fill" /> Decrypt
            </button>
            <button className="btn btn-refresh rounded-1" onClick={handleRefresh}>
              <i className="bi bi-arrow-clockwise" /> Refresh
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