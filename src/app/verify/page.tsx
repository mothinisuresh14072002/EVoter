"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Challenge = {
  challenge_id: string;
  challenge: "turn_left" | "turn_right";
  expires_in_seconds: number;
};

type Stage = "reference" | "ready" | "capturing" | "verifying";

async function readJson(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || body?.error || "Request failed.");
  }
  return body;
}

export default function BiometricVerificationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceSession, setReferenceSession] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [stage, setStage] = useState<Stage>("reference");
  const [status, setStatus] = useState(
    "Choose a clear reference portrait, then complete the one-time camera challenge.",
  );
  const [error, setError] = useState<string | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => stopCamera, []);

  async function beginVerification() {
    if (!referenceFile) {
      setError("Choose a reference image first.");
      return;
    }

    setError(null);
    setStatus("Checking the reference image...");

    try {
      const formData = new FormData();
      formData.append("file", referenceFile);

      const reference = await readJson(
        await fetch("/api/biometric/reference", {
          method: "POST",
          body: formData,
        }),
      );

      if (reference.status !== "success" || !reference.session_id) {
        throw new Error(
          reference.reason_codes?.join(", ") || "Reference image was not accepted.",
        );
      }

      const challengeResult = (await readJson(
        await fetch("/api/biometric/challenge", { method: "POST" }),
      )) as Challenge;

      setReferenceSession(reference.session_id);
      setChallenge(challengeResult);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setStage("ready");
      setStatus(
        challengeResult.challenge === "turn_left"
          ? "Camera ready. Start centered; during capture, slowly move your face toward the LEFT side of the frame."
          : "Camera ready. Start centered; during capture, slowly move your face toward the RIGHT side of the frame.",
      );
    } catch (err) {
      stopCamera();
      setReferenceSession("");
      setChallenge(null);
      setStage("reference");
      setError(err instanceof Error ? err.message : "Unable to start verification.");
    }
  }

  function captureFrame(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("Camera is not ready."));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to capture camera frame."));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Frame capture failed."))),
        "image/jpeg",
        0.9,
      );
    });
  }

  async function captureAndVerify() {
    if (!challenge || !referenceSession) {
      setError("Verification session expired. Start again.");
      setStage("reference");
      return;
    }

    setError(null);
    setStage("capturing");

    try {
      const frames: Blob[] = [];

      for (let index = 0; index < 8; index += 1) {
        setStatus(
          `Capturing frame ${index + 1} of 8 — slowly move toward the ${challenge.challenge === "turn_left" ? "LEFT" : "RIGHT"} side of the frame.`,
        );
        frames.push(await captureFrame());
        await new Promise((resolve) => setTimeout(resolve, 280));
      }

      stopCamera();
      setStatus("Checking the one-time movement challenge...");

      const formData = new FormData();
      formData.append("challenge_id", challenge.challenge_id);
      frames.forEach((frame, index) => {
        formData.append("files", frame, `live_${index + 1}.jpg`);
      });

      const live = await readJson(
        await fetch("/api/biometric/capture", {
          method: "POST",
          body: formData,
        }),
      );

      if (live.status !== "success" || !live.session_id) {
        throw new Error(
          live.reason_codes?.join(", ") || "Live capture was not accepted.",
        );
      }

      setStage("verifying");
      setStatus("Comparing the verified live burst with the reference image...");

      const verification = await readJson(
        await fetch("/api/auth/biometric", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference_session_id: referenceSession,
            live_session_id: live.session_id,
          }),
        }),
      );

      if (!verification.success) {
        throw new Error(
          verification.reason_codes?.join(", ") || "Identity verification failed.",
        );
      }

      setStatus("Verification passed. Opening the demo ballot...");
      router.replace("/vote");
    } catch (err) {
      stopCamera();
      setReferenceSession("");
      setChallenge(null);
      setStage("reference");
      setError(err instanceof Error ? err.message : "Verification failed.");
      setStatus("Choose a reference image and try a fresh one-time challenge.");
    }
  }

  return (
    <div style={{ padding: "2rem 0", maxWidth: "720px", margin: "0 auto" }}>
      <Link
        href="/dashboard"
        style={{
          color: "var(--color-navy)",
          textDecoration: "none",
          fontWeight: 600,
          display: "inline-block",
          marginBottom: "1.25rem",
        }}
      >
        ← Back to dashboard
      </Link>

      <div className="page-header">
        <h2 className="page-title">Biometric Verification Demo</h2>
        <p className="page-subtitle">
          This research flow uses a temporary reference portrait plus a one-time head-turn
          challenge. Do not upload government identity documents or other sensitive records.
        </p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
        <div className="alert-content">
          <div className="alert-title">Prototype only</div>
          <p className="alert-text">
            Passing this check authorizes only the demonstration ballot. It is not government
            identity proofing, DigiLocker verification, or election certification.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          <div className="alert-content">
            <div className="alert-title">Verification could not continue</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: "2rem" }}>
        {stage === "reference" && (
          <>
            <label className="form-label" htmlFor="reference-photo">
              Reference portrait
            </label>
            <input
              id="reference-photo"
              className="form-input"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => setReferenceFile(event.target.files?.[0] || null)}
            />
            <div className="form-hint" style={{ marginTop: "0.65rem" }}>
              Use a clear, front-facing portrait of the same consenting person who will use the
              camera. The backend keeps it only in a short-lived verification session.
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: "1.5rem" }}
              onClick={beginVerification}
              disabled={!referenceFile}
            >
              Start one-time camera challenge
            </button>
          </>
        )}

        {(stage === "ready" || stage === "capturing") && (
          <>
            <div
              style={{
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                background: "#0b1020",
                marginBottom: "1rem",
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                style={{ display: "block", width: "100%", transform: "scaleX(-1)" }}
              />
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={captureAndVerify}
              disabled={stage === "capturing"}
            >
              {stage === "capturing" ? "Capturing challenge..." : "I’m ready — capture 8 frames"}
            </button>
          </>
        )}

        {stage === "verifying" && (
          <div className="center-content" style={{ minHeight: "180px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }} />
              <strong>Verification in progress</strong>
            </div>
          </div>
        )}

        <p
          aria-live="polite"
          style={{ marginTop: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}
        >
          {status}
        </p>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
