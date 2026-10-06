import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "EVoter | Biometric Verification Research Demo",
  description:
    "Open research prototype for temporary biometric verification and a non-binding demo voting flow.",
  keywords: [
    "biometric verification",
    "research prototype",
    "FastAPI",
    "Next.js",
    "face verification",
  ],
  openGraph: {
    title: "EVoter | Research Demo",
    description:
      "Biometric verification and demo voting workflow for engineering research.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-tricolor-bar-animated" />
        <div className="container">
          <header className="app-header animate-fade-in">
            <Link href="/" className="app-logo" aria-label="EVoter research demo home">
              <svg
                className="chakra-icon"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
              <span>EVoter</span>
              <span className="badge badge-warning" style={{ marginLeft: "0.5rem" }}>
                Research Demo
              </span>
            </Link>

            <nav className="nav-links" aria-label="Primary navigation">
              <Link href="/info?tab=security" className="btn btn-ghost">
                About &amp; Safety
              </Link>
              <Link
                href="/admin"
                className="btn btn-outline"
                style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              >
                Admin Sandbox
              </Link>
            </nav>
          </header>

          <main style={{ minHeight: "60vh" }}>{children}</main>

          <footer className="app-footer animate-fade-in">
            <div className="footer-links">
              <Link href="/info?tab=privacy">Privacy</Link>
              <Link href="/info?tab=security">Security</Link>
              <Link href="/info?tab=terms">Prototype Terms</Link>
              <Link href="/info?tab=help">Help</Link>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.75 }}>
              EVoter is an independent research prototype. It is not affiliated with or
              endorsed by the Election Commission of India, DigiLocker, UIDAI, or any
              government authority.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
