import React, { useRef, useState } from "react";

function UploadArea({ file, onFileChange, loading }) {
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => inputRef.current.click();

  const handleDragOver = (e) => {
    if (loading) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    if (loading) return;
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) onFileChange(selectedFile);
  };

  const handleFileSelect = (e) => {
    if (loading) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) onFileChange(selectedFile);
  };

  return (
    <div className="upload-container">
      <div
        className={`dropzone ${isDragging ? "dragging" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>
          Drag & drop a PDF or Image here,
          <br />
          or click to browse your files.
        </p>

        {file && (
          <p className="file-info">
            Selected: <strong>{file.name}</strong>{" "}
            ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept=".pdf,image/png,image/jpeg,image/jpg"
        disabled={loading}
      />
      {loading && (
        <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
          Upload disabled while analyzing...
        </div>
      )}
    </div>
  );
}

export default UploadArea;
