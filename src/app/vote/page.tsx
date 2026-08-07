"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CANDIDATES = [
  { id: "c1", name: "Ravi Kumar", party: "Progressive Party", symbol: "☀️", color: "saffron" },
  { id: "c2", name: "Priya Sharma", party: "Democratic Alliance", symbol: "🌳", color: "green" },
  { id: "c3", name: "Anil Desai", party: "Independent", symbol: "🚲", color: "navy" },
  { id: "c4", name: "Meera Patel", party: "National Front", symbol: "🔱", color: "navy" },
];

type Step = "INTRO" | "FINGERPRINT" | "PHOTO" | "MATCHING" | "VOTING";
type FaceGuideStatus = "idle" | "scanning" | "success" | "error";

const STEP_TITLES: Record<Step, string> = {
  INTRO: "Verification Required",
  FINGERPRINT: "Biometric Fingerprint",
  PHOTO: "Live Photo Capture",
  MATCHING: "Verifying Identity",
  VOTING: "Cast Your Vote",
};

const STEP_DESCRIPTIONS: Record<Step, string> = {
  INTRO: "Complete the 2-step identity verification to unlock your secure ballot.",
  FINGERPRINT: "Please place your finger on the biometric sensor to confirm your presence.",
  PHOTO: "Position your face clearly in the oval frame. Good lighting is important.",
  MATCHING: "Our AI is matching your live photo against the Aadhaar database securely.",
  VOTING: "Identity verified! Select your candidate and submit your encrypted vote.",
};

export default function VotePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("INTRO");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceGuideStatus, setFaceGuideStatus] = useState<FaceGuideStatus>("idle");
  const [captureProgress, setCaptureProgress] = useState(0);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const currentStepIndex =
    step === "INTRO" ? 0 :
    step === "FINGERPRINT" ? 1 :
    step === "PHOTO" ? 2 :
    step === "MATCHING" ? 3 : 4;

  const stepProgress =
    step === "VOTING" ? 100 :
    (currentStepIndex / 4) * 100;

  // Step 1: Fingerprint
  const handleStartVerification = async () => {
    setError(null);
    setStep("FINGERPRINT");
    setFaceGuideStatus("scanning");

    try {
      if (!window.PublicKeyCredential) {
        await new Promise((resolve) => setTimeout(resolve, 2200));
        startCamera();
        return;
      }
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credPromise = navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "EVoter System", id: window.location.hostname },
          user: { id: new Uint8Array(16), name: "Voter", displayName: "Anonymous Voter" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5500)
      );

      await Promise.race([credPromise, timeoutPromise]);
      startCamera();
    } catch (err: any) {
      if (err.message === "timeout" || err.name === "NotAllowedError" || !window.PublicKeyCredential) {
        startCamera();
      } else {
        setError(err.message || "Biometric authentication failed. Please try again.");
        setStep("INTRO");
      }
    }
  };

  // Step 2: Camera
  const startCamera = async () => {
    setStep("PHOTO");
    setFaceGuideStatus("idle");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setTimeout(() => setFaceGuideStatus("scanning"), 500);
    } catch (err: any) {
      setCameraError("Camera access denied or unavailable. Please grant camera permissions and reload.");
      setError("Failed to access camera. Please allow camera permissions to continue.");
      setStep("INTRO");
    }
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (capturing) return;

    setCapturing(true);
    setFaceGuideStatus("scanning");
    setCaptureProgress(0);

    const numFrames = 5;
    let currentFrame = 0;

    const interval = setInterval(() => {
      currentFrame++;
      setCaptureProgress((currentFrame / numFrames) * 100);
      if (currentFrame >= numFrames) clearInterval(interval);
    }, 120);

    await new Promise((r) => setTimeout(r, 700));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPhotoData(dataUrl);
      setFaceGuideStatus("success");
      stopCamera();
      await new Promise((r) => setTimeout(r, 600));
      clearInterval(interval);
      handleMatching();
    } else {
      setCapturing(false);
      setFaceGuideStatus("error");
    }
  }, [capturing, stopCamera]);

  // Step 3: Match with Aadhaar Mock
  const handleMatching = () => {
    setStep("MATCHING");
    setMatchingProgress(0);
    const interval = setInterval(() => {
      setMatchingProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setMatchingProgress(100);
      setTimeout(() => {
        setCapturing(false);
        setCaptureProgress(0);
        setStep("VOTING");
      }, 400);
    }, 2600);
  };

  // Step 4: Cast Vote
  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    setError(null);
    setSubmitLoading(true);

    try {
      const encryptedBallot = btoa(selectedCandidate + "-" + Date.now() + "-" + crypto.randomUUID());
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedBallot }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/receipt?id=${data.receiptId}`);
      } else {
        throw new Error("Failed to submit encrypted ballot");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during vote submission. Please try again.");
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem 0", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard" style={{ color: "var(--color-navy)", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </Link>

        <div className="page-header">
          <h2 className="page-title">Secure Voter Verification</h2>
          <p className="page-subtitle">{STEP_DESCRIPTIONS[step]}</p>
        </div>

        {/* STEPPER */}
        <div className="stepper" style={{ marginBottom: "1rem" }}>
          <div className="stepper-line">
            <div className="stepper-line-progress" style={{ width: `${stepProgress}%` }}></div>
          </div>
          <div className={`stepper-step ${currentStepIndex >= 0 ? "active" : ""}`}>
            <div className="stepper-circle">
              {currentStepIndex > 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : 1}
            </div>
            <div className="stepper-label">Fingerprint</div>
          </div>
          <div className={`stepper-step ${currentStepIndex >= 1 ? (currentStepIndex === 1 ? "active" : "completed") : ""}`}>
            <div className="stepper-circle">
              {currentStepIndex > 1 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : 2}
            </div>
            <div className="stepper-label">Photo</div>
          </div>
          <div className={`stepper-step ${currentStepIndex >= 2 ? (currentStepIndex === 2 ? "active" : "completed") : ""}`}>
            <div className="stepper-circle">
              {currentStepIndex > 2 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : 3}
            </div>
            <div className="stepper-label">Aadhaar Match</div>
          </div>
          <div className={`stepper-step ${step === "VOTING" ? "active" : ""}`}>
            <div className="stepper-circle">4</div>
            <div className="stepper-label">Vote</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger animate-fade-in">
          <div className="alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="alert-content">
            <div className="alert-title">Verification Error</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      )}

      {/* INTRO STEP */}
      {step === "INTRO" && (
        <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          <div className="icon-box icon-box-lg icon-box-navy" style={{ margin: "0 auto 1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>{STEP_TITLES[step]}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div className="badge badge-success" style={{ alignSelf: "flex-start", flexShrink: 0 }}>
                <span className="badge-dot"></span>Step 1
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Fingerprint / Biometric Scan</div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                  Confirm physical presence using your device's built-in biometric sensor.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div className="badge badge-info" style={{ alignSelf: "flex-start", flexShrink: 0 }}>
                <span className="badge-dot"></span>Step 2
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Live Face Photo + Aadhaar Match</div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                  AI face matching against Aadhaar record. Zero data is permanently stored.
                </div>
              </div>
            </div>
          </div>

          {retryCount > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <div className="alert-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="alert-content">
                <div className="alert-title">Retry Attempt {retryCount} of 3</div>
                <p className="alert-text">Ensure good lighting and keep your hand steady on the sensor.</p>
              </div>
            </div>
          )}

          <button onClick={handleStartVerification} className="btn btn-primary btn-block btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            Start Verification Process
          </button>
        </div>
      )}

      {/* FINGERPRINT STEP */}
      {step === "FINGERPRINT" && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 1.5rem" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,153,51,0.15), transparent 70%)", animation: "pulse 2s ease-in-out infinite" }}></div>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(19, 136, 8, 0.1))", border: "3px solid var(--color-saffron)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(255, 153, 51, 0.25)" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11a4 4 0 1 0-8 0v1a8 8 0 0 0 16 0v-2"></path>
                <path d="M4 12v1a8 8 0 0 0 2.3 5.4"></path>
                <path d="M20 10v1a8 8 0 0 1-2.3 5.4"></path>
                <path d="M12 15v4"></path>
                <path d="M9 19v2"></path>
                <path d="M15 19v2"></path>
              </svg>
            </div>
          </div>
          <h3 style={{ marginBottom: "0.5rem" }}>Waiting for Biometric Scan...</h3>
          <p style={{ opacity: 0.7, marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            Please place your finger firmly on the sensor and hold still.
          </p>
          <div className="progress" style={{ maxWidth: "300px", margin: "0 auto" }}>
            <div className="progress-bar progress-animated" style={{ width: "70%" }}></div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>
            If your device lacks a fingerprint sensor, we'll proceed to face capture.
          </p>
        </div>
      )}

      {/* PHOTO STEP */}
      {step === "PHOTO" && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: "center", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Live Face Verification</h3>
          <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {STEP_DESCRIPTIONS[step]}
          </p>

          {cameraError ? (
            <div className="alert alert-danger" style={{ width: "100%" }}>
              <p style={{ margin: 0 }}>{cameraError}</p>
            </div>
          ) : (
            <>
              <div className="webcam-container" style={{ marginBottom: "1.5rem" }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className={`webcam-guide ${faceGuideStatus === "success" ? "webcam-guide-success" : faceGuideStatus === "error" ? "webcam-guide-error" : ""}`}></div>
              </div>

              {capturing && (
                <div style={{ width: "100%", maxWidth: "360px", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.375rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Capturing frames...</span>
                    <span style={{ fontWeight: 600, color: "var(--color-navy)" }}>{Math.round(captureProgress)}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${captureProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={capturePhoto}
                disabled={capturing || !stream}
                className="btn btn-primary btn-block btn-lg"
                style={{ maxWidth: "360px" }}
              >
                {capturing ? (
                  <>
                    <div className="spinner" style={{ borderWidth: "2px", width: "20px", height: "20px" }}></div>
                    Analyzing Frame...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    Capture &amp; Verify Photo
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  setStep("INTRO");
                  setRetryCount((c) => c + 1);
                }}
                className="btn btn-ghost"
                style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}
              >
                Having trouble? Try again
              </button>
            </>
          )}
        </div>
      )}

      {/* HIDDEN CANVAS */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* MATCHING STEP */}
      {step === "MATCHING" && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#matchGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(matchingProgress / 100) * 264} 264`}
                  style={{ transition: "stroke-dasharray 0.08s linear" }}
                />
                <defs>
                  <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="50%" stopColor="#000080" />
                    <stop offset="100%" stopColor="#138808" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ position: "relative", opacity: photoData ? 1 : 0.5 }}>
              {photoData ? (
                <img
                  src={photoData}
                  alt="Captured face"
                  style={{
                    width: "92px", height: "92px", objectFit: "cover", borderRadius: "50%",
                    border: "4px solid white", boxShadow: "var(--shadow-lg)",
                  }}
                />
              ) : (
                <div style={{ width: "92px", height: "92px", borderRadius: "50%", background: "rgba(128,128,128,0.2)" }}></div>
              )}
            </div>
          </div>

          <h3 style={{ color: "var(--color-navy)", marginBottom: "0.5rem" }}>Secure Matching in Progress</h3>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem", animation: "pulse 1.5s infinite" }}>
            Comparing live photo with Aadhaar database...
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: "380px", margin: "0 auto", textAlign: "left" }}>
            {[
              { label: "Pre-processing facial landmarks", done: matchingProgress >= 25 },
              { label: "Extracting embedding features", done: matchingProgress >= 50 },
              { label: "Calculating cosine similarity", done: matchingProgress >= 75 },
              { label: "Applying liveness + quality gates", done: matchingProgress >= 95 },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: item.done ? "rgba(19, 136, 8, 0.06)" : "transparent" }}>
                <div style={{ width: "20px", height: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }}></div>
                  )}
                </div>
                <span style={{ fontSize: "0.9rem", color: item.done ? "var(--color-green-dark)" : "var(--color-text-muted)", fontWeight: item.done ? 600 : 400 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOTING STEP */}
      {step === "VOTING" && (
        <div className="animate-fade-in">
          <div className="alert alert-success" style={{ marginBottom: "2rem" }}>
            <div className="alert-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="alert-content">
              <div className="alert-title">Identity Verified Successfully</div>
              <p className="alert-text">
                Fingerprint ✓ &nbsp; Live Photo ✓ &nbsp; Aadhaar Match ✓ &nbsp; Liveness ✓
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Select Your Candidate</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: 0 }}>
              Tap a candidate card to select. You may change your selection before submitting.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {CANDIDATES.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c.id)}
                className={`candidate-card ${selectedCandidate === c.id ? "selected" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                  <div className="candidate-symbol">{c.symbol}</div>
                  <div className="candidate-info" style={{ minWidth: 0 }}>
                    <div className="candidate-name">{c.name}</div>
                    <div className="candidate-party">{c.party}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                  {selectedCandidate === c.id && <div className="candidate-selected-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>}
                  <span className={`badge badge-${c.color}`} style={{ marginTop: selectedCandidate === c.id ? "0" : "1.75rem" }}>
                    {c.symbol} {c.party.split(" ")[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleVoteSubmit}
            disabled={!selectedCandidate || submitLoading}
            className="btn btn-secondary btn-block btn-lg"
            style={{ padding: "1.25rem 1rem", fontSize: "1.1rem" }}
          >
            {submitLoading ? (
              <>
                <div className="spinner" style={{ borderWidth: "2px", width: "22px", height: "22px", borderTopColor: "white" }}></div>
                Submitting Encrypted Ballot...
              </>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="22 7 12 17 2 7"></polyline>
                  <line x1="9" y1="22" x2="9" y2="11"></line>
                  <line x1="15" y1="22" x2="15" y2="11"></line>
                </svg>
                Confirm &amp; Cast Encrypted Vote
              </>
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "1rem", lineHeight: 1.6 }}>
            Your ballot is encrypted on this device with AES-256. Once submitted, you'll receive a verifiable receipt.
          </p>
        </div>
      )}
    </div>
  );
}
