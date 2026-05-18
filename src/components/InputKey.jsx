import React from 'react';

function InputKey({ privateKey, setPrivateKey }) {
  return (
    <div className="mb-3 text-start">
      <label htmlFor="privateKey" className="form-label text-start">
        Private Key (16, 24, or 32 chars)
      </label>
      <input type="text" className="form-control rounded-3 py-2" id="privateKey" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} placeholder="Enter here" />
    </div>
  );
}

export default InputKey;
