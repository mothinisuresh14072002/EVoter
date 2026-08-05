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
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const captureSingleFrame = async (): Promise<Blob | null> => {
    return new Promise(resolve => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleCaptureSequence = async () => {
    setIsCapturing(true);
    setError('');
    
    const numFrames = 5;
    const blobs: Blob[] = [];

    // Capture multiple frames with a small delay between them
    for (let i = 0; i < numFrames; i++) {
      setStatus(`Capturing frame ${i + 1} of ${numFrames}...`);
      setProgress(((i + 1) / numFrames) * 100);
      
      const blob = await captureSingleFrame();
      if (blob) {
        blobs.push(blob);
      }
      
      if (i < numFrames - 1) {
        await delay(200); // 200ms gap between frames ensures distinct variations
      }
    }

    if (blobs.length === 0) {
      setError('Failed to extract any frames from camera.');
      setStatus('');
      setIsCapturing(false);
      setProgress(0);
      return;
    }
    
    setStatus('Analyzing frames on server to select the best one...');
    
    try {
      const result = await captureLive(blobs);
      if (result.status === 'success') {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onSuccess(result.session_id);
      } else {
        setError(`Failed: ${result.reason_codes.join(', ')}`);
        setStatus('');
      }
    } catch (e) {
      setError('Network error uploading live frames');
      setStatus('');
    }
    
    setIsCapturing(false);
    setProgress(0);
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

      {/* Progress Bar Display */}
      {isCapturing && progress > 0 && progress <= 100 && (
        <div style={{ marginTop: '15px', width: '100%', maxWidth: '400px', margin: '15px auto 0', backgroundColor: '#eee', height: '10px', borderRadius: '5px' }}>
            <div style={{ width: `${progress}%`, backgroundColor: '#4CAF50', height: '10px', borderRadius: '5px', transition: 'width 0.2s' }}></div>
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={handleCaptureSequence} 
          disabled={isCapturing || hasCameraError || !stream}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {isCapturing ? 'Processing...' : 'Capture Sequence & Verify'}
        </button>
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <StatusMessage status={status} error={error} />
      </div>
    </div>
  );
}
