"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  {
    title: "One-time movement challenge",
    desc: "The server issues a short-lived left/right camera challenge before accepting a live frame burst.",
  },
  {
    title: "Fail-closed biometrics",
    desc: "Missing models, poor-quality images, failed liveness, or low similarity do not silently pass verification.",
  },
  {
    title: "Ephemeral verification sessions",
    desc: "Reference and live images stay in short-lived memory/Redis sessions and are deleted after verification.",
  },
  {
    title: "Signed demo authorization",
    desc: "Short-lived voter, biometric, and admin cookies are HMAC-signed and validated server-side.",
  },
  {
    title: "Separated demo ballot",
    desc: "The demonstration ballot is opened only after biometric authorization and does not send the fictional candidate choice to the server.",
  },
  {
    title: "Transparent limitations",
    desc: "The project explicitly avoids claiming government integration, official election certification, or a production tally system.",
  },
];

const PROCESS = [
  {
    title: "Start a demo session",
    desc: "Use invented demo credentials. Never enter Aadhaar, DigiLocker, OTP, or other real credentials.",
  },
  {
    title: "Choose a reference portrait",
    desc: "Provide a clear image of the same consenting person who will use the live camera.",
  },
  {
    title: "Complete the one-time challenge",
    desc: "Capture an eight-frame burst while moving toward the server-selected side of the camera frame.",
  },
  {
    title: "Run biometric checks",
    desc: "The backend evaluates face detection, image quality, liveness, alignment, embedding similarity, and configured thresholds.",
  },
  {
    title: "Use the fictional ballot",
    desc: "A successful check opens a non-binding demo ballot and returns a clearly labeled demo receipt.",
  },
];

const FAQS = [
  {
    q: "Is EVoter connected to DigiLocker or Aadhaar?",
    a: "No. The current repository is a research prototype and does not connect to DigiLocker, Aadhaar, the Election Commission of India, or any government identity/election system.",
  },
  {
    q: "Should I upload a government ID?",
    a: "No. Use a non-sensitive reference portrait from a consenting test participant. Do not upload Aadhaar cards, passports, voter IDs, or other sensitive documents.",
  },
  {
    q: "Does the demo cast or tally a real vote?",
    a: "No. The ballot uses fictional candidates. The server intentionally receives only an opaque demo submission token, not the selected candidate, and the receipt is not an election record.",
  },
  {
    q: "Are the biometric models automatically trustworthy?",
    a: "No. Model files are supplied separately and must be licensed, calibrated, evaluated for the target camera/environment, and independently tested. The API fails closed when required model assets are missing.",
  },
  {
    q: "Can this be used for a public election?",
    a: "Not as-is. Real election use would require election-authority governance, independently reviewed cryptography, accessibility testing, privacy/legal review, security audits, operational controls, incident response, certification, and much more.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section className="hero-section animate-fade-in">
        <div className="hero-badge animate-slide-up animation-delay-100">
          <span>Research Demo · Not an Official Election System</span>
        </div>

        <h1 className="hero-title animate-slide-up animation-delay-200">
          Explore biometric verification
          <br />
          <span className="text-gradient">without pretending it is production voting.</span>
        </h1>

        <p className="hero-description animate-slide-up animation-delay-300">
          EVoter is an open research prototype for studying temporary biometric
          verification, signed authorization boundaries, and a clear demo voter journey.
          It deliberately separates what is implemented from what a certified election
          platform would still require.
        </p>

        <div className="hero-actions animate-slide-up animation-delay-400">
          <Link href="/auth/demo" className="btn btn-primary btn-lg">
            Open Research Demo
          </Link>
          <a href="#how-it-works" className="btn btn-outline btn-lg">
            See How It Works
          </a>
        </div>

        <div className="stats-grid animate-slide-up animation-delay-500">
          <div className="stat-item">
            <div className="stat-value">8</div>
            <div className="stat-label">Live Frames per Challenge</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5 min</div>
            <div className="stat-label">Default Biometric Session TTL</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">3</div>
            <div className="stat-label">Decision States</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">Real Votes Cast</div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-header animate-fade-in">
          <span className="section-label">What the Prototype Actually Implements</span>
          <h2 className="section-title">Clear boundaries, safer defaults</h2>
          <p className="section-description">
            The project focuses on a reproducible demo deployment and fail-closed
            verification behavior rather than making unsupported election claims.
          </p>
        </div>

        <div className="grid grid-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
            >
              <div className="feature-icon icon-box icon-box-navy">
                <strong>{index + 1}</strong>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="section-header animate-fade-in">
          <span className="section-label">Demo Journey</span>
          <h2 className="section-title">Five explicit steps</h2>
          <p className="section-description">
            Each step is designed to make it obvious when you are using a prototype rather
            than an official identity or election service.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "820px",
            margin: "0 auto",
          }}
        >
          {PROCESS.map((step, index) => (
            <div
              key={step.title}
              className="process-step animate-slide-in-left"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className="process-number">{index + 1}</div>
              <div className="process-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div
          className="glass-panel animate-fade-in"
          style={{ textAlign: "center", padding: "3rem 2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <span className="badge badge-success">Redis-ready sessions</span>
            <span className="badge badge-info">Docker Compose</span>
            <span className="badge badge-warning">CI builds both frontends</span>
            <span className="badge badge-info">Readiness checks</span>
          </div>
          <h3 style={{ marginBottom: "1rem" }}>Built to be inspectable</h3>
          <p
            style={{
              color: "var(--color-text-muted)",
              maxWidth: "680px",
              margin: "0 auto 1.5rem",
            }}
          >
            The source, deployment configuration, API contracts, privacy assumptions, and
            remaining production gaps are documented in the repository. That makes this a
            useful engineering prototype—not a certified voting product.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/info?tab=security" className="btn btn-navy">
              Security Notes
            </Link>
            <Link href="/admin" className="btn btn-ghost">
              Admin Sandbox
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="section-header animate-fade-in">
          <span className="section-label">Important Questions</span>
          <h2 className="section-title">Know the limits before testing</h2>
        </div>

        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="faq-item">
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
                style={{ width: "100%", textAlign: "left", border: 0, background: "transparent" }}
              >
                <span>{faq.q}</span>
                <span aria-hidden="true">{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: "5rem" }}>
        <div
          className="glass-panel animate-fade-in"
          style={{ textAlign: "center", padding: "3rem 2rem" }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>Ready to test the research flow?</h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              maxWidth: "560px",
              margin: "0 auto 1.5rem",
            }}
          >
            Use invented demo credentials and a non-sensitive portrait from a consenting
            test participant. Do not enter official credentials or identity documents.
          </p>
          <Link href="/auth/demo" className="btn btn-primary btn-lg">
            Start Demo
          </Link>
        </div>
      </section>
    </>
  );
}
