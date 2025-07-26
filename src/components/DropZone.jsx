import React from 'react';

function DropZone({ file, fileName, fileInputRef, handleFileChange, setFile, setFileName, uploadIcon }) {
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-4">
      <div
        className={`card drop-zone rounded-3 text-center p-4 ${file ? 'bg-light' : 'bg-white'}`}
        style={{ cursor: 'pointer' }}
        onClick={handleButtonClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) {
            setFile(droppedFile);
            setFileName(droppedFile.name);
          }
        }}
      >
        {!file ? (
          <div className='d-flex justify-content-center flex-column gap-2'>
            <i className="bi bi-file-earmark-arrow-up-fill text-primary display-1"></i>
            <small className="text-secondary m-0">Drag and drop or click to browse file</small>
          </div>
        ) : (
          <div>
            <p className="fw-bold text-primary m-0 text-truncate" style={{ maxWidth: '100%', overflow: 'hidden' }} title={fileName}>
              {fileName}
            </p>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="d-none" onChange={handleFileChange} />
    </div>
  );
}

export default DropZone;
