import React, { useRef, useState } from 'react';
import { uploadAadhaar } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export function UploadPage({ onSuccess }: { onSuccess: (sessionId: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = () => inputRef.current?.click();

  const onFileChosen = (f: File | null) => {
    setError('');
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select a JPEG or PNG image file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;
    setIsUploading(true);
    setStatus('Uploading and validating reference image…');
    setError('');

    try {
      const result = await uploadAadhaar(file);
      if (result.status === 'success') {
        setStatus('Reference image accepted ✓');
        setTimeout(() => onSuccess(result.session_id), 400);
      } else {
        setError(
          `Upload rejected: ${(result.reason_codes || ['unknown']).join(', ')}. Please try a clearer photo.`
        );
        setStatus('');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setError(`${msg}. Please ensure the backend is running on port 8000.`);
      setStatus('');
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="glass-panel fade-in">
      <h2 className="page-title">Step 1 · Upload Reference ID Photo</h2>
      <p className="page-subtitle">
        Upload a clear, front-facing photograph of your Aadhaar ID. The image is
        processed in an ephemeral session and discarded immediately after
        verification.
      </p>

      <div className="alert alert-info">
        <div className="alert-icon">
          <ShieldIcon />
        </div>
        <div className="alert-content">
          <div className="alert-title">Zero-knowledge processing</div>
          <div className="alert-desc">
            Images are never written to disk. Temp sessions are deleted
            automatically after /verify completes.
          </div>
        </div>
      </div>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onClick={chooseFile}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onFileChosen(e.dataTransfer.files?.[0] || null);
        }}
      >
        <div className="dropzone-icon">
          <UploadIcon />
        </div>
        <div className="dropzone-title">
          {isDragging ? 'Drop image here' : 'Click or drag your Aadhaar photo'}
        </div>
        <div className="dropzone-hint">JPG or PNG · up to 10 MB · front-facing, well-lit</div>
        <button type="button" className="btn btn-outline" onClick={(e) => { e.stopPropagation(); chooseFile(); }}>
          Choose File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="dropzone-file"
          onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
        />
      </div>

      {file && previewUrl && (
        <div className="file-preview">
          <img src={previewUrl} alt="Preview" className="file-preview-thumb" />
          <div className="file-preview-info">
            <div className="file-preview-name">{file.name}</div>
            <div className="file-preview-size">{formatSize(file.size)}</div>
          </div>
          <span className="badge badge-success">
            <ImageIcon /> Ready
          </span>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <StatusMessage status={status} error={error} />
      </div>

      <div className="action-row">
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading && <span className="spinner" />}
          {isUploading ? 'Processing…' : 'Upload & Continue'}
        </button>
      </div>

      <div className="info-strip">
        <div className="info-strip-item">
          <LockIcon /> Encrypted in transit
        </div>
        <div className="info-strip-item">
          <BoltIcon /> Validated server-side
        </div>
        <div className="info-strip-item">
          <ShieldIcon /> Auto-deleted after match
        </div>
      </div>
    </div>
  );
}
