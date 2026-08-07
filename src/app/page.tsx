"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    ),
    title: "Bank-Grade Encryption",
    desc: "Your ballot is encrypted end-to-end on your device using AES-256. Not even election officials can read your vote.",
    color: "saffron",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
    ),
    title: "Biometric Verification",
    desc: "Confirm your identity with fingerprint or face ID. Biometric data is processed on-device and never stored.",
    color: "green",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    ),
    title: "100% Auditable",
    desc: "Get a unique verifiable receipt. Independently confirm your vote counted without revealing your choice.",
    color: "navy",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ),
    title: "DigiLocker Identity",
    desc: "Seamlessly verify your voter eligibility using government-issued DigiLocker credentials.",
    color: "saffron",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
    ),
    title: "AI Face Matching",
    desc: "Advanced deep learning matches your live photo against Aadhaar records with 99.7% accuracy.",
    color: "green",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    ),
    title: "Any Device, Anywhere",
    desc: "Vote securely from your phone, tablet, or computer. Works offline during submission.",
    color: "navy",
  },
];

const PROCESS_STEPS = [
  {
    title: "Authenticate with DigiLocker",
    desc: "Sign in using your Aadhaar-linked mobile number and secure PIN to prove voter eligibility.",
  },
  {
    title: "Biometric Identity Check",
    desc: "Complete a quick face scan and fingerprint verification to confirm you're the registered voter.",
  },
  {
    title: "Face Match Aadhaar Record",
    desc: "Our AI system compares your live face against your Aadhaar photo in real-time with zero data storage.",
  },
  {
    title: "Cast Encrypted Vote",
    desc: "Select your candidate. Your ballot is encrypted on-device and submitted to the secure ledger.",
  },
  {
    title: "Receive Verifiable Receipt",
    desc: "Get a unique receipt ID to independently verify your vote was counted while keeping your choice private.",
  },
];

const FAQS = [
  {
    q: "Is my face photo stored anywhere?",
    a: "No. EVoter follows strict privacy protocols. Your live face image and Aadhaar photo are processed in temporary memory, matched, and immediately discarded. Nothing is written to permanent storage. Face embeddings are also deleted after the verification session completes.",
  },
  {
    q: "Can anyone see who I voted for?",
    a: "Absolutely not. Your ballot is encrypted directly on your device before submission. The election ledger only sees anonymous encrypted ballots. Your identity (voter session) and your ballot are cryptographically separated — there is no way to link them.",
  },
  {
    q: "What happens if face verification fails?",
    a: "You will get a clear reason code (e.g., 'lighting_too_dim', 'multiple_faces_detected', 'face_not_centered'). You can retry up to 3 times. After 3 failures, the system routes you to a manual review queue with an election officer video call.",
  },
  {
    q: "How do I know my vote actually counted?",
    a: "After submission, you receive a unique Receipt ID. You can enter this ID on the Verify Receipt page at any time after polls close to see a cryptographic proof that your encrypted ballot is present in the final tally. This proof reveals nothing about who you voted for.",
  },
  {
    q: "Is this system safe from hacking?",
    a: "EVoter uses defense-in-depth: signed client apps, end-to-end encryption, zero-knowledge proofs, hardware-enforced biometrics, and a write-only immutable ledger. Our infrastructure undergoes continuous third-party security audits. You can read the security whitepaper for full details.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section animate-fade-in">
        <div className="hero-badge animate-slide-up animation-delay-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>2026 Assembly Elections — Now Live</span>
        </div>

        <h1 className="hero-title animate-slide-up animation-delay-200">
          Secure. Transparent.
          <br />
          <span className="text-gradient">Verifiable Democracy.</span>
        </h1>

        <p className="hero-description animate-slide-up animation-delay-300">
          EVoter is the next-generation remote voting infrastructure for high-stakes public elections.
          Verify your identity seamlessly with biometric face matching and cast your vote from anywhere
          with cryptographic certainty.
        </p>

        <div className="hero-actions animate-slide-up animation-delay-400">
          <Link href="/auth/digilocker" className="btn btn-primary btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Login to Vote
          </Link>
          <a href="#how-it-works" className="btn btn-outline btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
            How It Works
          </a>
        </div>

        {/* STATS */}
        <div className="stats-grid animate-slide-up animation-delay-500">
          <div className="stat-item">
            <div className="stat-value">99.7%</div>
            <div className="stat-label">Face Match Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">2.3s</div>
            <div className="stat-label">Avg. Verification Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Images Permanently Stored</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">ISO 27001</div>
            <div className="stat-label">Security Certified</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="section" id="features">
        <div className="section-header animate-fade-in">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">Built for Trust, Designed for Everyone</h2>
          <p className="section-description">
            Every aspect of EVoter was designed with input from election officials, cryptographers, and citizen advocacy groups.
          </p>
        </div>

        <div className="grid grid-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card card-hover animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              <div className={`feature-icon icon-box icon-box-${f.color}`}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="section" id="how-it-works" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255, 153, 51, 0.02) 50%, transparent 100%)' }}>
        <div className="section-header animate-fade-in">
          <span className="section-label">Voting Process</span>
          <h2 className="section-title">Cast Your Vote in 5 Simple Steps</h2>
          <p className="section-description">
            The entire process takes under 2 minutes and is designed to be accessible to all voters.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={i}
              className="process-step animate-slide-in-left"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <div className="process-number">{i + 1}</div>
              <div className="process-content">
                <h4 style={{ color: i === 0 ? 'var(--color-saffron)' : i === PROCESS_STEPS.length - 1 ? 'var(--color-green)' : 'var(--text-primary)' }}>
                  {step.title}
                </h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST / SECURITY STRIP */}
      <section className="section">
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success"><span className="badge-dot"></span>Zero-Knowledge Architecture</span>
            <span className="badge badge-info"><span className="badge-dot"></span>GDPR &amp; DPDP Compliant</span>
            <span className="badge badge-warning"><span className="badge-dot"></span>Open-Auditable Codebase</span>
            <span className="badge badge-success"><span className="badge-dot"></span>SCERT Audited</span>
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Your Vote. Your Choice. Always Private.</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            EVoter was architected under the principle that no system — not even ours — should ever know who you voted for.
            Ballot secrecy isn't just a feature; it's a mathematical guarantee.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/security" className="btn btn-navy">
              Read Security Whitepaper
            </Link>
            <Link href="/privacy" className="btn btn-ghost">
              View Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section" id="faq">
        <div className="section-header animate-fade-in">
          <span className="section-label">Frequently Asked</span>
          <h2 className="section-title">Questions? We've Got Answers</h2>
          <p className="section-description">
            Still unsure? Reach out to our 24/7 voter support helpline.
          </p>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="faq-item animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.25s ease',
                    color: 'var(--color-navy)',
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {openFaq === i && (
                <div className="faq-answer" style={{ animation: 'fadeIn 0.3s ease' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section" style={{ paddingBottom: '5rem' }}>
        <div
          className="glass-panel animate-fade-in"
          style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.08), rgba(0, 0, 128, 0.08))',
            borderColor: 'rgba(0, 0, 128, 0.12)',
          }}
        >
          <div className="icon-box icon-box-lg icon-box-green" style={{ margin: '0 auto 1.5rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Ready to Exercise Your Democratic Right?</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            The 2026 Mock Assembly Election closes in 14 hours. Every vote matters. Every voice counts.
          </p>
          <Link href="/auth/digilocker" className="btn btn-primary btn-lg">
            Start Voting Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
