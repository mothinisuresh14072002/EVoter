"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DemoVoterAccess() {
  const router = useRouter();
  const [voterCode, setVoterCode] = useState("");
  const [demoPin, setDemoPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^[A-Za-z0-9_-]{4,32}$/.test(voterCode)) {
      setError("Use a 4–32 character demo voter code.");
      return;
    }

    if (!/^\d{6}$/.test(demoPin)) {
      setError("Use any 6-digit demo PIN.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("voter_code", voterCode);
      formData.append("demo_pin", demoPin);

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        body: formData,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Demo access is unavailable.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start the demo session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem 0", maxWidth: "560px", margin: "0 auto" }}>
      <Link
        href="/"
        style={{
          color: "var(--color-navy)",
          textDecoration: "none",
          fontWeight: 600,
          display: "inline-block",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to home
      </Link>

      <div className="page-header">
        <h2 className="page-title">EVoter Research Demo Access</h2>
        <p className="page-subtitle">
          Start a temporary demo voter session. This screen does not connect to DigiLocker,
          Aadhaar, or any government identity system.
        </p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
        <div className="alert-content">
          <div className="alert-title">Do not enter real credentials</div>
          <p className="alert-text">
            Use invented demo values only. Real Aadhaar numbers, DigiLocker PINs, passwords,
            OTPs, and other personal credentials are not required by this prototype.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          <div className="alert-content">
            <div className="alert-title">Unable to continue</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="voter-code">
              Demo voter code
            </label>
            <input
              id="voter-code"
              className="form-input"
              value={voterCode}
              onChange={(event) =>
                setVoterCode(event.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32))
              }
              placeholder="example: DEMO_VOTER_01"
              autoComplete="off"
              required
            />
            <div className="form-hint">
              This is an invented identifier used only to enter the research demo.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="demo-pin">
              Demo PIN
            </label>
            <input
              id="demo-pin"
              className="form-input"
              type="password"
              inputMode="numeric"
              value={demoPin}
              onChange={(event) =>
                setDemoPin(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Any 6 digits"
              autoComplete="off"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Starting demo session..." : "Continue to demo dashboard"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: "1rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
        The next step uses the project’s biometric verification service with a temporary
        reference portrait and a one-time live-camera challenge. It remains a research
        demonstration and is not suitable for a real election.
      </div>
    </div>
  );
}
