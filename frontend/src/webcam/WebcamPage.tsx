import React, { useEffect, useRef, useState } from 'react';
import { captureLive } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';
import { FaceGuide } from '../components/FaceGuide';

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const AlertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export interface WebcamPageProps {
  onSuccess: (sessionId: string) => void;
  onBack?: () => void;
}

export function WebcamPage({ onSuccess, onBack }: WebcamPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasCameraError, setHasCameraError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameNumber, setFrameNumber] = useState(0);
  const [guideState, setGuideState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        setHasCameraError(true);
        setError('');
      });

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureSingleFrame = async (): Promise<Blob | null> =>
    new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleCaptureSequence = async () => {
    if (isCapturing || !stream) return;
    setIsCapturing(true);
    setError('');
    setGuideState('scanning');

    const numFrames = 5;
    const blobs: Blob[] = [];

    for (let i = 0; i < numFrames; i++) {
      setFrameNumber(i + 1);
      setStatus(`Capturing frame ${i + 1} of ${numFrames}… hold still`);
      setProgress(((i + 1) / numFrames) * 100);

      const blob = await captureSingleFrame();
      if (blob) blobs.push(blob);

      if (i < numFrames - 1) await delay(250);
    }

    if (blobs.length === 0) {
      setError('Failed to extract any frames from camera. Please try again.');
      setStatus('');
      setIsCapturing(false);
      setProgress(0);
      setGuideState('error');
      setTimeout(() => setGuideState('idle'), 1500);
      return;
    }

    setStatus('Server analyzing frames — selecting the sharpest capture…');

    try {
      const result = await captureLive(blobs);
      if (result.status === 'success') {
        setGuideState('success');
        setStatus('Live capture accepted ✓');
        if (stream) stream.getTracks().forEach((track) => track.stop());
        setTimeout(() => onSuccess(result.session_id), 600);
      } else {
        setGuideState('error');
        setError(
          `Capture rejected: ${(result.reason_codes || ['unknown']).join(', ')}. Please reposition and try again.`
        );
        setStatus('');
        setTimeout(() => setGuideState('idle'), 1800);
      }
    } catch (e: unknown) {
      setGuideState('error');
      const msg = e instanceof Error ? e.message : 'Network error';
      setError(`${msg}. Please ensure the backend is running on port 8000.`);
      setStatus('');
      setTimeout(() => setGuideState('idle'), 1800);
    } finally {
      setIsCapturing(false);
      setProgress(0);
      setFrameNumber(0);
    }
  };

  return (
    <div className="glass-panel fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: 0 }}>Step 2 · Live Selfie Capture</h2>
          <p className="page-subtitle" style={{ marginBottom: 0, marginTop: 4 }}>
            The server selects the sharpest frame out of 5 and checks liveness + quality.
          </p>
        </div>
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack} disabled={isCapturing}>
            <ArrowLeftIcon /> Back
          </button>
        )}
      </div>

      <div className="alert alert-warning" style={{ marginTop: 4 }}>
        <div className="alert-icon">
          <LightbulbIcon />
        </div>
        <div className="alert-content">
          <div className="alert-title">Capture tips</div>
          <div className="alert-desc">
            Face the camera directly, use even lighting, remove glasses if heavily reflective, and
            avoid face masks or hats that obscure features.
          </div>
        </div>
      </div>

      {!hasCameraError ? (
        <div style={{ marginTop: 16 }}>
          <div className="webcam-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="webcam-video"
            />
            <FaceGuide state={guideState} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {(isCapturing || progress > 0) && (
            <div className="progress-container">
              <div className="progress-label">
                <span>
                  {isCapturing && frameNumber > 0
                    ? `Frame ${frameNumber} of 5`
                    : progress >= 100
                    ? 'Analyzing…'
                    : 'Preparing…'}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="camera-error" style={{ marginTop: 16 }}>
          <div className="camera-error-icon">
            <AlertIcon />
          </div>
          <div className="camera-error-title">Camera access denied or unavailable</div>
          <div className="camera-error-desc">
            Please grant camera permission in your browser settings, ensure no other app is using
            the camera, and then reload the page.
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload & Retry
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <StatusMessage status={status} error={error} />
      </div>

      <div className="action-row">
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleCaptureSequence}
          disabled={isCapturing || hasCameraError || !stream}
        >
          {!isCapturing && <CameraIcon />}
          {isCapturing && <span className="spinner" />}
          {isCapturing ? 'Capturing… do not move' : 'Capture 5 Frames & Verify'}
        </button>
      </div>

      <div className="info-strip">
        <div className="info-strip-item">
          <LightbulbIcon /> Liveness detection
        </div>
        <div className="info-strip-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Best of 5 frames
        </div>
        <div className="info-strip-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          Ephemeral session
        </div>
      </div>
    </div>
  );
}
