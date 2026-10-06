"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Demo session created",
    description: "You are using invented demo credentials in a short-lived research session.",
    done: true,
  },
  {
    title: "Biometric challenge",
    description: "Upload a non-sensitive reference portrait and complete the one-time camera movement challenge.",
    done: false,
  },
  {
    title: "Verification decision",
    description: "The backend checks face quality, liveness, alignment, and similarity using configured model thresholds.",
    done: false,
  },
  {
    title: "Fictional ballot",
    description: "A successful biometric check unlocks a non-binding ballot with fictional candidates.",
    done: false,
  },
  {
    title: "Demo receipt",
    description: "The flow ends with a clearly labeled research receipt, not an official election record.",
    done: false,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { authenticated: false }))
      .then(({ authenticated }) => {
        if (cancelled) return;
        setSessionOk(authenticated);
        if (!authenticated) router.replace("/auth/demo");
      })
      .catch(() => {
        if (!cancelled) {
          setSessionOk(false);
          router.replace("/auth/demo");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!sessionOk) {
    return (
      <div className="center-content" style={{ minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Checking your demo session...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0 4rem", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <span className="badge badge-info" style={{ marginBottom: "0.75rem" }}>
            Research Demo
          </span>
          <h1 className="page-title">Verification Demo Dashboard</h1>
          <p className="page-subtitle">
            Continue the biometric research flow. No real constituency, turnout, voter
            registry, election schedule, or official ballot is represented here.
          </p>
        </div>
        <span className="badge badge-success">
          <span className="badge-dot" /> Temporary session active
        </span>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
        <div className="alert-content">
          <div className="alert-title">Use test data only</div>
          <p className="alert-text">
            Use a non-sensitive portrait from a consenting test participant. Do not upload
            Aadhaar cards, voter IDs, passports, or other government identity documents.
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: "1.5rem", alignItems: "stretch" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div className="icon-box icon-box-navy" style={{ marginBottom: "1rem" }}>
            <strong>1</strong>
          </div>
          <h2 style={{ marginBottom: "0.75rem" }}>Run the biometric challenge</h2>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            The server creates short-lived reference/live sessions and a one-time left/right
            movement challenge. Failed or expired sessions do not authorize the demo ballot.
          </p>
          <Link href="/verify" className="btn btn-primary btn-lg">
            Start biometric verification
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div className="icon-box icon-box-green" style={{ marginBottom: "1rem" }}>
            <strong>i</strong>
          </div>
          <h2 style={{ marginBottom: "0.75rem" }}>What success means</h2>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            Passing the configured checks grants a five-minute demo authorization. It does
            not prove civil identity, voter eligibility, or suitability for a binding election.
          </p>
          <Link href="/info?tab=security" className="btn btn-outline">
            Review security boundaries
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "1.25rem" }}>Demo flow</h2>
        <div className="timeline">
          {STEPS.map((step, index) => (
            <div key={step.title} className={`timeline-item ${step.done ? "completed" : ""}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div
                  className="timeline-title"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {step.title}
                  {step.done && <span className="badge badge-success">Done</span>}
                  {!step.done && index === 1 && <span className="badge badge-info">Next</span>}
                </div>
                <p className="timeline-text">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel-dark" style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>Research boundary</h2>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8, margin: 0 }}>
          A real election platform would still require independently reviewed election
          protocols and cryptography, voter-roll integration, accessibility validation,
          privacy/legal review, certified operations, key management, auditability,
          penetration testing, disaster recovery, and election-authority governance.
        </p>
      </div>
    </div>
  );
}
