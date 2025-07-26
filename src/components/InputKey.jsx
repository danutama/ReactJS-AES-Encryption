import React from 'react';

function InputKey({ privateKey, setPrivateKey }) {
  return (
    <div className="mb-3 text-start">
      <label htmlFor="privateKey" className="form-label text-start">
        Private Key (16/24/32 characters)
      </label>
      <input type="text" className="form-control rounded-3 py-2" id="privateKey" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} placeholder="Enter your private key" />
    </div>
  );
}

export default InputKey;
