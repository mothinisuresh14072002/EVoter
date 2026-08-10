import React, { useState } from 'react';
import { UploadPage } from './upload/UploadPage';
import { WebcamPage } from './webcam/WebcamPage';
import { ResultPage } from './results/ResultPage';

const AshokaChakra = () => (
  <svg viewBox="0 0 24 24" className="brand-chakra" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15 * Math.PI) / 180;
      const x1 = 12 + 2 * Math.cos(angle);
      const y1 = 12 + 2 * Math.sin(angle);
      const x2 = 12 + 10 * Math.cos(angle);
      const y2 = 12 + 10 * Math.sin(angle);
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#FFFFFF"
          strokeWidth="0.7"
        />
      );
    })}
  </svg>
);

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="tricolor-bar" />
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <div className="brand-logo">
              <AshokaChakra />
            </div>
            <div className="brand-text">
              <h1>EVoter</h1>
              <p>Face Verification Demo</p>
            </div>
          </div>
          <div className="header-actions-container">
            <nav className="header-nav">
              <a href="#" className="header-link">Developer Tools</a>
              <a href="#" className="header-link">Settings</a>
              <a href="#" className="header-link">Help</a>
            </nav>
            <div className="official-badge">
              <span className="official-badge-dot" />
              Secure Demo Portal
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="container">{children}</div>
      </main>
      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            Demo environment · No images or biometrics are permanently stored.
            Sessions are ephemeral and auto-deleted after verification.
          </p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Security</a>
            <a href="#">Help</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface StepperProps {
  currentStep: number;
}

function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { n: 1, label: 'Upload ID' },
    { n: 2, label: 'Live Photo' },
    { n: 3, label: 'Match Result' },
  ];
  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="stepper">
      <div className="step-line">
        <div className="step-line-progress" style={{ width: `${progressPct}%` }} />
      </div>
      {steps.map((s) => {
        const state =
          s.n === currentStep ? 'active' : s.n < currentStep ? 'completed' : '';
        return (
          <div key={s.n} className={`step ${state}`}>
            <div className="step-circle">
              {state === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s.n
              )}
            </div>
            <div className="step-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [refSessionId, setRefSessionId] = useState<string | null>(null);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);

  const handleUploadSuccess = (sessionId: string) => {
    setRefSessionId(sessionId);
    setStep(2);
  };

  const handleWebcamSuccess = (sessionId: string) => {
    setLiveSessionId(sessionId);
    setStep(3);
  };

  const handleRestart = () => {
    setRefSessionId(null);
    setLiveSessionId(null);
    setStep(1);
  };

  return (
    <AppShell>
      {step === 1 && (
        <section className="fade-in">
          <div className="hero-section">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Verification Pipeline Active
            </div>
            <h2 className="hero-title">
              <span className="text-gradient">Biometric Voter Authentication</span>
            </h2>
            <p className="hero-description">
              Upload your Aadhaar photo, capture a live selfie, and our AI pipeline
              will verify your identity — with zero permanent storage and
              end-to-end session encryption.
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">99.7%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">2.3s</div>
                <div className="stat-label">Avg Verify</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Images Stored</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">5</div>
                <div className="stat-label">Frames Captured</div>
              </div>
            </div>
          </div>
          <Stepper currentStep={step} />
          <UploadPage onSuccess={handleUploadSuccess} />
        </section>
      )}

      {step === 2 && (
        <section className="fade-in">
          <Stepper currentStep={step} />
          <WebcamPage onSuccess={handleWebcamSuccess} onBack={() => setStep(1)} />
        </section>
      )}

      {step === 3 && refSessionId && liveSessionId && (
        <section className="fade-in">
          <Stepper currentStep={step} />
          <ResultPage
            refSessionId={refSessionId}
            liveSessionId={liveSessionId}
            onRestart={handleRestart}
          />
        </section>
      )}
    </AppShell>
  );
}
