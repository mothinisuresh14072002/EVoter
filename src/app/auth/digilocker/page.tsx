"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DigiLockerAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");

  const [rawAadhaar, setRawAadhaar] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(queryError ? "Invalid credentials. Please try again." : null);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, "");
    let newRaw = "";
    let rawIndex = 0;

    for (let i = 0; i < val.length; i++) {
      if (val[i] === "•" || val[i] === "*") {
        if (rawIndex < rawAadhaar.length) {
          newRaw += rawAadhaar[rawIndex];
          rawIndex++;
        }
      } else if (/\d/.test(val[i])) {
        newRaw += val[i];
      }
    }
    
    setRawAadhaar(newRaw.slice(0, 12));
  };

  const getMaskedAadhaar = (raw: string) => {
    return raw
      .split("")
      .map((char, index) => (index < 6 ? "•" : char))
      .join("")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanAadhaar = rawAadhaar;

    if (cleanAadhaar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      setLoading(false);
      return;
    }
    if (pin.length < 6) {
      setError("Please enter a valid 6-digit security PIN.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("aadhaar", cleanAadhaar);
      formData.append("pin", pin);

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Authentication failed. Please check your credentials and try again.");
      }
    } catch {
      setError("Unable to sign in right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem 0", maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "var(--color-navy)", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </Link>
        <h2 className="page-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Voter Identity Verification
        </h2>
        <p className="page-subtitle">
          Sign in securely using your DigiLocker-linked credentials to access your ballot.
        </p>
      </div>

      {/* STEPPER */}
      <div className="stepper" style={{ marginBottom: "2.5rem" }}>
        <div className="stepper-line">
          <div className="stepper-line-progress" style={{ width: "33%" }}></div>
        </div>
        <div className="stepper-step active">
          <div className="stepper-circle">1</div>
          <div className="stepper-label">DigiLocker</div>
        </div>
        <div className="stepper-step">
          <div className="stepper-circle">2</div>
          <div className="stepper-label">Biometrics</div>
        </div>
        <div className="stepper-step">
          <div className="stepper-circle">3</div>
          <div className="stepper-label">Cast Vote</div>
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
            <div className="alert-title">Authentication Error</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      )}

      <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem 2rem" }}>
        {/* DigiLocker Badge */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, rgba(255, 153, 51, 0.12), rgba(19, 136, 8, 0.12))", border: "1px solid var(--border-color)" }}>
            <div className="icon-box icon-box-saffron" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-navy)" }}>DigiLocker Powered</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Government of India</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="aadhaar">
              Aadhaar / Mobile Number
            </label>
            <input
              type="text"
              id="aadhaar"
              className={`form-input ${error?.includes("Aadhaar") ? "form-input-error" : ""}`}
              placeholder="please enter aadhaar number"
              value={getMaskedAadhaar(rawAadhaar)}
              onChange={handleAadhaarChange}
              inputMode="numeric"
              name="aadhaar_input_field"
              autoComplete="new-password"
              required
            />
            <div className="form-hint" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Your Aadhaar number is encrypted in transit. We never store this value.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pin">
              Security PIN
            </label>
            <input
              type="password"
              id="pin"
              className={`form-input ${error?.includes("PIN") ? "form-input-error" : ""}`}
              placeholder="please enter the digilock pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              name="pin_input_field"
              autoComplete="new-password"
              required
            />
            <div className="form-hint">
              This is your DigiLocker 6-digit security PIN, NOT your Aadhaar OTP.
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginBottom: "1.5rem" }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ borderWidth: "2px", width: "20px", height: "20px" }}></div>
                Authenticating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Authenticate &amp; Continue
              </>
            )}
          </button>

          <div style={{ textAlign: "center" }}>
            <a href="#" style={{ fontSize: "0.9rem", color: "var(--color-navy)", textDecoration: "none", fontWeight: 500 }}>
              Forgot your DigiLocker PIN?
            </a>
          </div>
        </form>

        <div className="divider"></div>

        {/* Privacy Notice */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div className="icon-box icon-box-green" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Your Privacy Matters</div>
            <div style={{ color: "var(--color-text-muted)" }}>
              By continuing, you consent to share only your <strong>voter eligibility status</strong> with EVoter.
              We do not access or store any personal documents from DigiLocker. This session expires in 15 minutes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
