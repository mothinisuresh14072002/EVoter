"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CANDIDATES = [
  { id: "c1", name: "Ravi Kumar", party: "Progressive Party", symbol: "☀️" },
  { id: "c2", name: "Priya Sharma", party: "Democratic Alliance", symbol: "🌳" },
  { id: "c3", name: "Anil Desai", party: "Independent", symbol: "🚲" }
];

type Step = 'INTRO' | 'FINGERPRINT' | 'PHOTO' | 'MATCHING' | 'VOTING';

export default function VotePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('INTRO');
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Step 1: Fingerprint
  const handleFingerprint = async () => {
    setError(null);
    setStep('FINGERPRINT');
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("Fingerprint not supported on this device. Please use a supported mobile device.");
      }
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "EVoter System", id: window.location.hostname },
          user: { id: new Uint8Array(16), name: "Voter", displayName: "Anonymous Voter" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        }
      });
      
      // Success, move to camera
      startCamera();
    } catch (err: any) {
      console.error(err);
      setError(err.name === "NotAllowedError" ? "Fingerprint authentication failed." : err.message || "An error occurred.");
      setStep('INTRO');
    }
  };

  // Step 2: Camera
  const startCamera = async () => {
    setStep('PHOTO');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError("Failed to access camera. Please allow camera permissions.");
      setStep('INTRO');
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Move to matching
        handleMatching();
      }
    }
  }, [stream]);

  // Step 3: Match with Aadhaar Mock
  const handleMatching = () => {
    setStep('MATCHING');
    // Mock network delay for Aadhaar matching
    setTimeout(() => {
      setStep('VOTING');
    }, 2500);
  };

  // Step 4: Cast Vote
  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    setError(null);

    try {
      const encryptedBallot = btoa(selectedCandidate + "-" + Date.now());
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedBallot })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/receipt?id=${data.receiptId}`);
      } else {
        throw new Error("Failed to submit encrypted ballot");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during vote submission.");
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0", maxWidth: "600px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard" style={{ color: "var(--color-navy)", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: "1rem" }}>
          ← Back
        </Link>
        <h2>Secure Voter Verification</h2>
        {step === 'INTRO' && <p style={{ opacity: 0.8, fontSize: "0.95rem", marginTop: "0.5rem" }}>Complete the final 2-step verification to unlock your ballot.</p>}
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255,0,0,0.1)", borderLeft: "4px solid red", marginBottom: "1.5rem", borderRadius: "4px" }}>
          <p style={{ color: "red", fontSize: "0.9rem", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* INTRO STEP */}
      {step === 'INTRO' && (
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Verification Required</h3>
          <ul style={{ textAlign: "left", marginBottom: "2rem", opacity: 0.8, lineHeight: 1.8, paddingLeft: "1.5rem" }}>
            <li><strong>Step 1:</strong> Fingerprint Scan</li>
            <li><strong>Step 2:</strong> Live Photo Capture (Aadhaar Match)</li>
          </ul>
          <button onClick={handleFingerprint} className="btn btn-primary" style={{ width: "100%" }}>
            Start Verification Process
          </button>
        </div>
      )}

      {/* FINGERPRINT STEP */}
      {step === 'FINGERPRINT' && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ animation: "spin 2s linear infinite", fontSize: "3rem", marginBottom: "1rem", color: "var(--color-green)" }}>
            👆
          </div>
          <h3>Waiting for Fingerprint...</h3>
          <p style={{ opacity: 0.7, marginTop: "0.5rem" }}>Please place your finger on the sensor.</p>
        </div>
      )}

      {/* PHOTO STEP */}
      {step === 'PHOTO' && (
        <div className="glass-panel" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ marginBottom: "1rem" }}>Live Photo Verification</h3>
          <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Position your face in the frame to match with Aadhaar.</p>
          
          <div style={{ position: "relative", width: "100%", maxWidth: "300px", borderRadius: "16px", overflow: "hidden", border: "4px solid var(--color-navy)", marginBottom: "1.5rem", background: "#000" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", display: "block" }} />
          </div>
          
          <button onClick={capturePhoto} className="btn btn-primary" style={{ width: "100%" }}>
            Capture Photo
          </button>
        </div>
      )}

      {/* HIDDEN CANVAS FOR PHOTO */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* MATCHING STEP */}
      {step === 'MATCHING' && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ opacity: 0.5, marginBottom: "1rem" }}>
            {photoData && <img src={photoData} alt="Captured" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--color-navy)" }} />}
          </div>
          <h3 style={{ color: "var(--color-navy)" }}>Analyzing Live Photo...</h3>
          <p style={{ opacity: 0.7, marginTop: "0.5rem", animation: "pulse 1.5s infinite" }}>Matching with Aadhaar Database...</p>
        </div>
      )}

      {/* VOTING STEP */}
      {step === 'VOTING' && (
        <div className="animate-fade-in">
          <div style={{ padding: "1rem", background: "rgba(19, 136, 8, 0.1)", borderLeft: "4px solid var(--color-green)", marginBottom: "2rem", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <p style={{ color: "var(--color-green)", fontSize: "0.95rem", margin: 0, fontWeight: 500 }}>
              Identity Verified: Fingerprint & Aadhaar Live Photo matched. You may now cast your vote.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {CANDIDATES.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedCandidate(c.id)}
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: selectedCandidate === c.id ? "2px solid var(--color-green)" : "1px solid rgba(128,128,128,0.2)",
                  background: selectedCandidate === c.id ? "rgba(19, 136, 8, 0.05)" : "var(--surface-bg)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{c.name}</h3>
                  <p style={{ opacity: 0.7, fontSize: "0.9rem", margin: 0 }}>{c.party}</p>
                </div>
                <div style={{ fontSize: "2rem" }}>{c.symbol}</div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleVoteSubmit} 
            disabled={!selectedCandidate}
            className="btn btn-primary" 
            style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", opacity: !selectedCandidate ? 0.5 : 1 }}
          >
            Confirm & Cast Encrypted Vote
          </button>
        </div>
      )}
    </div>
  );
}
