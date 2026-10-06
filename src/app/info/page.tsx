"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./info.module.css";

type TabType = "privacy" | "security" | "terms" | "help";

const TAB_CONTENT: Record<
  TabType,
  { title: string; intro: string; sections: Array<{ heading: string; body: string }> }
> = {
  privacy: {
    title: "Privacy Notes",
    intro:
      "EVoter is a research prototype. Use test data only and do not upload government identity documents or other sensitive records.",
    sections: [
      {
        heading: "Temporary biometric data",
        body:
          "Reference and live images are kept only in short-lived in-memory or Redis verification sessions. The verify endpoint deletes both sessions after the comparison request, and TTL expiry removes abandoned sessions.",
      },
      {
        heading: "What is not implemented",
        body:
          "The repository does not contain an official voter registry, DigiLocker/Aadhaar integration, production analytics policy, backup policy, or a legal data-retention program.",
      },
      {
        heading: "Before any real deployment",
        body:
          "Privacy claims must be independently reviewed across application logs, infrastructure logs, backups, monitoring, hosting providers, model assets, access controls, and applicable law.",
      },
    ],
  },
  security: {
    title: "Security Notes",
    intro:
      "The project is designed to fail closed when required biometric checks cannot complete, but it is not a certified security or election product.",
    sections: [
      {
        heading: "Implemented safeguards",
        body:
          "The demo uses signed short-lived web sessions, one-time movement challenges, bounded frame bursts, quality/liveness/similarity gates, Redis-backed temporary sessions for Compose, safe JSON session serialization, server-side admin proxying, readiness checks, and baseline browser headers.",
      },
      {
        heading: "Biometric model responsibility",
        body:
          "Face detection, embedding, and liveness model files are external deployment assets. They must be licensed, integrity-checked, calibrated, tested for demographic and environmental performance, and independently evaluated for the exact cameras and attack types used.",
      },
      {
        heading: "Not a real election security model",
        body:
          "The repository does not implement an official voter roll, certified ballot cryptography, end-to-end verifiability, coercion resistance, durable election tallying, key ceremonies, election-authority governance, or certification.",
      },
      {
        heading: "Public exposure",
        body:
          "Use HTTPS and platform/reverse-proxy rate limiting before exposing the demo. Keep the FastAPI and Redis services private, rotate secrets, monitor failures, and do not log biometric payloads.",
      },
    ],
  },
  terms: {
    title: "Prototype Terms",
    intro:
      "This text is engineering guidance rather than legal terms and requires legal review for any hosted service.",
    sections: [
      {
        heading: "Permitted use",
        body:
          "Use EVoter for research, development, testing, education, and permitted demonstrations with consenting participants and non-sensitive test data.",
      },
      {
        heading: "Do not submit real credentials",
        body:
          "Do not enter Aadhaar numbers, DigiLocker credentials, OTPs, passwords, voter IDs, passports, or other official identity documents. The demo login intentionally accepts invented values only.",
      },
      {
        heading: "Do not misrepresent the project",
        body:
          "Do not present EVoter as affiliated with a government authority, as an official election service, or as a certified biometric/voting product.",
      },
    ],
  },
  help: {
    title: "Help",
    intro:
      "The fastest way to troubleshoot the demo is to identify which layer failed: web session, model readiness, reference quality, live challenge, liveness, or similarity.",
    sections: [
      {
        heading: "The demo will not start",
        body:
          "Check that EVOTER_DEMO_MODE is enabled, SESSION_SIGNING_SECRET is configured, the backend /ready endpoint returns 200, Redis is healthy in Compose, and all three model files are present.",
      },
      {
        heading: "Reference image rejected",
        body:
          "Use one clear, well-lit, front-facing test portrait with exactly one sufficiently large face. The service rejects blur, poor brightness, off-center/small faces, and detection errors.",
      },
      {
        heading: "Live challenge rejected",
        body:
          "Start centered and slowly move toward the requested side during the eight-frame burst. A challenge is single-use, so each retry receives a new challenge.",
      },
      {
        heading: "Verification is borderline or failed",
        body:
          "Inspect the returned reason codes. Thresholds are configuration defaults, not certified operating points, and this repository does not provide a staffed manual-review workflow.",
      },
    ],
  },
};

function InfoContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("privacy");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["privacy", "security", "terms", "help"].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  const content = TAB_CONTENT[activeTab];

  return (
    <div className="glass-panel" style={{ marginTop: "2rem" }}>
      <h1 style={{ marginBottom: "0.5rem", color: "var(--color-navy)" }}>
        EVoter Research Information
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Implementation boundaries, privacy assumptions, security notes, and demo help.
      </p>

      <div className={styles.infoContainer}>
        <div className={styles.sidebar}>
          {(Object.keys(TAB_CONTENT) as TabType[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {TAB_CONTENT[tab].title}
            </button>
          ))}
        </div>

        <div className={styles.contentArea}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{content.title}</h2>
            <div className={styles.sectionContent}>
              <p>
                <strong>{content.intro}</strong>
              </p>
              {content.sections.map((section) => (
                <div key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.body}</p>
                </div>
              ))}

              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 153, 51, 0.08)",
                }}
              >
                Project issues and security reports should be filed through the repository
                maintainers. Never include passwords, API keys, biometric images, or other
                sensitive data in a public issue.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>}>
      <InfoContent />
    </Suspense>
  );
}
