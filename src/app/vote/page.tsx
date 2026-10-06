"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_CANDIDATES = [
  { id: "demo-a", name: "Demo Candidate A", party: "Civic Future Demo", symbol: "A" },
  { id: "demo-b", name: "Demo Candidate B", party: "People First Demo", symbol: "B" },
  { id: "demo-c", name: "Demo Candidate C", party: "Independent Demo", symbol: "C" },
];

export default function VotePage() {
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) =>
        response.ok
          ? response.json()
          : { authenticated: false, biometricVerified: false },
      )
      .then((state) => {
        if (cancelled) return;

        if (!state.authenticated) {
          router.replace("/auth/digilocker");
          return;
        }

        if (!state.biometricVerified) {
          router.replace("/verify");
          return;
        }

        setAccessChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/auth/digilocker");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function submitDemoBallot() {
    if (!selectedCandidate || submitLoading) return;

    setError(null);
    setSubmitLoading(true);

    try {
      // The server receives only an opaque one-time demo token, not the selected
      // candidate. This prototype demonstrates authorization separation and receipt
      // issuance; it intentionally does not implement a real election tally.
      const ballotToken = crypto.randomUUID();

      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ballotToken }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Unable to submit the demo ballot.");
      }

      router.replace(`/receipt?id=${encodeURIComponent(body.receiptId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo ballot submission failed.");
      setSubmitLoading(false);
    }
  }

  if (!accessChecked) {
    return (
      <div className="center-content" style={{ minHeight: "55vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-muted)" }}>
            Checking your temporary verification session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0", maxWidth: "760px", margin: "0 auto" }}>
      <Link
        href="/dashboard"
        style={{
          color: "var(--color-navy)",
          textDecoration: "none",
          fontWeight: 600,
          display: "inline-block",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to dashboard
      </Link>

      <div className="page-header">
        <h2 className="page-title">Demo Ballot</h2>
        <p className="page-subtitle">
          Your temporary biometric demo check passed. Select a fictional candidate to
          complete the non-binding voting simulation.
        </p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
        <div className="alert-content">
          <div className="alert-title">Research simulation only</div>
          <p className="alert-text">
            These candidates are fictional. This page does not conduct, record, encrypt,
            tally, or certify a real election vote.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          <div className="alert-content">
            <div className="alert-title">Submission failed</div>
            <p className="alert-text">{error}</p>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Choose a fictional candidate</h3>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
          Your selection remains local to this demonstration page. The server receives
          only an opaque demo submission token.
        </p>

        <div style={{ display: "grid", gap: "0.9rem" }}>
          {DEMO_CANDIDATES.map((candidate) => {
            const selected = selectedCandidate === candidate.id;

            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedCandidate(candidate.id)}
                aria-pressed={selected}
                className="glass-panel card-hover"
                style={{
                  padding: "1rem 1.1rem",
                  border: selected
                    ? "2px solid var(--color-green)"
                    : "1px solid var(--border-color)",
                  background: selected
                    ? "rgba(19, 136, 8, 0.06)"
                    : "var(--surface-card)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    background: "rgba(0, 0, 128, 0.08)",
                    color: "var(--color-navy)",
                    flexShrink: 0,
                  }}
                >
                  {candidate.symbol}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{candidate.name}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                    {candidate.party}
                  </div>
                </div>
                <div aria-hidden="true" style={{ fontWeight: 800 }}>
                  {selected ? "✓" : ""}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: "1.5rem" }}
          disabled={!selectedCandidate || submitLoading}
          onClick={submitDemoBallot}
        >
          {submitLoading ? "Submitting demo ballot..." : "Submit demo ballot"}
        </button>
      </div>

      <p
        style={{
          marginTop: "1rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.65,
          fontSize: "0.9rem",
        }}
      >
        A real election system would require independently reviewed cryptography,
        end-to-end verifiability, durable audit controls, certified infrastructure,
        accessibility testing, legal approval, and election-authority governance.
      </p>
    </div>
  );
}
