import React, { useEffect, useRef, useState } from 'react';
import { captureLive } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';
import { FaceGuide } from '../components/FaceGuide';

export function WebcamPage({ onSuccess }: { onSuccess: (sessionId: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasCameraError, setHasCameraError] = useState(false);

  useEffect(() => {
    // Start camera automatically
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        setHasCameraError(true);
        setError('Failed to access camera. Please check permissions.');
      });

    return () => {
      // Cleanup camera on component unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('Capturing and verifying...');
    setError('');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match the actual video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to JPEG blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to process camera image.');
        setStatus('');
        return;
      }
      
      try {
        const result = await captureLive(blob);
        if (result.status === 'success') {
          // Stop camera properly before proceeding
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          onSuccess(result.session_id);
        } else {
          setError(`Failed: ${result.reason_codes.join(', ')}`);
          setStatus('');
        }
      } catch (e) {
        setError('Network error uploading live image');
        setStatus('');
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Step 2: Live Webcam Capture</h2>
      <p style={{ color: '#555' }}>Please position your face within the guide.</p>
      
      {!hasCameraError ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', display: 'block' }} 
          />
          <FaceGuide />
          {/* Hidden canvas used solely for frame extraction */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ padding: '20px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px' }}>
          <p>Camera access denied. Please grant permission in your browser and reload.</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={handleCapture} 
          disabled={status === 'Capturing and verifying...' || hasCameraError || !stream}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Capture & Verify
        </button>
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <StatusMessage status={status} error={error} />
      </div>
    </div>
  );
}
