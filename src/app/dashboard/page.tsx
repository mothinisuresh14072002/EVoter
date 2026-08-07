"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ELECTIONS = [
  {
    id: "e1",
    title: "2026 Mock Assembly Election",
    constituency: "Central District 1A",
    status: "active",
    startTime: "2026-08-01T08:00:00Z",
    endTime: "2026-08-08T18:00:00Z",
    totalVoters: 482931,
    votesCast: 284762,
  },
  {
    id: "e2",
    title: "Municipal Corporation By-Election",
    constituency: "Ward 14, South Zone",
    status: "upcoming",
    startTime: "2026-09-15T07:00:00Z",
    endTime: "2026-09-15T20:00:00Z",
    totalVoters: 62144,
    votesCast: 0,
  },
];

const TIMELINE_STEPS = [
  { title: "DigiLocker Authentication", status: "completed", desc: "Eligibility verified via DigiLocker credentials" },
  { title: "Biometric Presence Check", status: "pending", desc: "Fingerprint or device biometric scan" },
  { title: "Live Face + Aadhaar Match", status: "pending", desc: "AI face verification against Aadhaar photo" },
  { title: "Cast Encrypted Ballot", status: "pending", desc: "Select candidate and submit anonymously" },
  { title: "Receive Verifiable Receipt", status: "pending", desc: "Get unique receipt ID for independent audit" },
];

function getTimeRemaining(endIso: string) {
  const now = Date.now();
  const end = new Date(endIso).getTime();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, mins, totalMs: diff };
}

export default function Dashboard() {
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; totalMs: number }>(() =>
    getTimeRemaining(ELECTIONS[0].endTime)
  );

  useEffect(() => {
    const cookieMatch = document.cookie.includes("evoter_session");
    setSessionOk(cookieMatch);
    if (!cookieMatch) {
      const timer = setTimeout(() => router.push("/auth/digilocker"), 200);
      return () => clearTimeout(timer);
    }
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeRemaining(ELECTIONS[0].endTime));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  if (!sessionOk) {
    return (
      <div className="center-content" style={{ minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--color-text-muted)" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const turnout = (ELECTIONS[0].votesCast / ELECTIONS[0].totalVoters) * 100;

  return (
    <div style={{ padding: "2rem 0", maxWidth: "900px", margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="page-title">Voter Dashboard</h2>
          <p className="page-subtitle">Welcome, registered voter. You have one active ballot available.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span className="badge badge-success">
            <span className="badge-dot"></span>Eligibility Verified
          </span>
          <span className="badge badge-info">
            <span className="badge-dot"></span>Session: 12 min left
          </span>
        </div>
      </div>

      {/* COUNTDOWN + TURNOUT */}
      <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
        <div className="glass-panel animate-slide-up">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div className="icon-box icon-box-saffron">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 500 }}>POLLS CLOSE IN</div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Time Remaining</h3>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", textAlign: "center" }}>
            <div style={{ padding: "0.85rem", borderRadius: "var(--radius-md)", background: "rgba(255, 153, 51, 0.08)" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-saffron)" }}>{timeLeft.days}</div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>Days</div>
            </div>
            <div style={{ padding: "0.85rem", borderRadius: "var(--radius-md)", background: "rgba(0, 0, 128, 0.06)" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-navy)" }}>{String(timeLeft.hours).padStart(2, "0")}</div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>Hours</div>
            </div>
            <div style={{ padding: "0.85rem", borderRadius: "var(--radius-md)", background: "rgba(19, 136, 8, 0.06)" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-green)" }}>{String(timeLeft.mins).padStart(2, "0")}</div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>Minutes</div>
            </div>
          </div>
        </div>

        <div className="glass-panel animate-slide-up animation-delay-100">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div className="icon-box icon-box-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 500 }}>CONSTITUENCY TURNOUT</div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Live Voter Turnout</h3>
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>
              {ELECTIONS[0].votesCast.toLocaleString()} of {ELECTIONS[0].totalVoters.toLocaleString()} votes
            </span>
            <span style={{ fontWeight: 700, color: "var(--color-navy)" }}>{turnout.toFixed(1)}%</span>
          </div>
          <div className="progress" style={{ marginBottom: "1rem" }}>
            <div className="progress-bar" style={{ width: `${turnout}%` }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            <span>Opened: {new Date(ELECTIONS[0].startTime).toLocaleDateString()}</span>
            <span>Projected: ~{(turnout + 10).toFixed(0)}% final</span>
          </div>
        </div>
      </div>

      {/* ACTIVE ELECTIONS */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-navy)" }}>
            <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="22 7 12 17 2 7"></polyline>
            <line x1="9" y1="22" x2="9" y2="11"></line>
            <line x1="15" y1="22" x2="15" y2="11"></line>
          </svg>
          Active Elections
        </h3>

        {ELECTIONS.filter(e => e.status === "active").map((election, idx) => (
          <div
            key={election.id}
            className="glass-panel animate-slide-up card-hover"
            style={{
              animationDelay: `${idx * 0.08}s`,
              opacity: 0,
              padding: "2rem",
              marginBottom: "1rem",
              borderLeft: "4px solid var(--color-green)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0, fontSize: "1.3rem" }}>{election.title}</h4>
                  <span className="badge badge-success"><span className="badge-dot"></span>Polls Open</span>
                </div>
                <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {election.constituency}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {new Date(election.startTime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/vote" className="btn btn-primary btn-lg">
                  Cast Vote
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {ELECTIONS.filter(e => e.status === "upcoming").map((election, idx) => (
          <div
            key={election.id}
            className="glass-panel animate-slide-up"
            style={{
              animationDelay: `${(idx + 1) * 0.08}s`,
              opacity: 0,
              padding: "1.5rem 2rem",
              marginBottom: "1rem",
              borderLeft: "4px solid var(--color-saffron)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-warning"><span className="badge-dot"></span>Upcoming</span>
                <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--color-text-muted)" }}>{election.title}</h4>
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                Opens {new Date(election.startTime).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEXT STEPS TIMELINE */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-saffron)" }}>
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Next Steps to Vote
        </h3>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div className="timeline">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={i} className={`timeline-item ${step.status === "completed" ? "completed" : ""}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {step.title}
                    {step.status === "completed" && <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Done</span>}
                    {step.status === "pending" && i === 1 && <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>Next</span>}
                  </div>
                  <p className="timeline-text">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="glass-panel-dark animate-fade-in" style={{ padding: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="icon-box icon-box-navy" style={{ width: "36px", height: "36px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          Important Voting Instructions
        </h3>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 2 }}>
          <li>Ensure you are in a private, well-lit environment before casting your vote.</li>
          <li>You will be required to authenticate via biometrics and a live face scan to cast your ballot.</li>
          <li>Your ballot is encrypted on your device before submission and cannot be linked back to your identity.</li>
          <li>Once submitted, you will receive a unique, verifiable receipt code. Store this safely for audit purposes.</li>
          <li>All biometric and image data is discarded immediately after the verification session completes.</li>
        </ul>
      </div>
    </div>
  );
}
