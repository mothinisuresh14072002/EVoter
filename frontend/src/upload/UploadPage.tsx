import React, { useState } from 'react';
import { uploadAadhaar } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';

export function UploadPage({ onSuccess }: { onSuccess: (sessionId: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');
    setError('');
    
    try {
      const result = await uploadAadhaar(file);
      if (result.status === 'success') {
        onSuccess(result.session_id);
      } else {
        setError(`Failed: ${result.reason_codes.join(', ')}`);
        setStatus('');
      }
    } catch (e) {
      setError('Network error uploading Aadhaar image');
      setStatus('');
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Step 1: Upload Aadhaar Photo</h2>
      <div style={{ margin: '10px 0' }}>
        <input 
          type="file" 
          accept="image/jpeg, image/png" 
          onChange={e => setFile(e.target.files?.[0] || null)} 
        />
      </div>
      <button 
        onClick={handleUpload} 
        disabled={!file || status === 'Uploading...'}
        style={{ padding: '8px 16px', cursor: file ? 'pointer' : 'not-allowed' }}
      >
        Upload Reference Image
      </button>
      <StatusMessage status={status} error={error} />
    </div>
  );
}
