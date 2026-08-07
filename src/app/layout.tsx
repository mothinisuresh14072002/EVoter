import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVoter | Secure Government Remote Voting",
  description: "Secure, verifiable remote voting system for official elections with biometric face verification.",
  keywords: ["voting", "election", "face verification", "biometric", "secure", "government", "India"],
  openGraph: {
    title: "EVoter | Secure Government Remote Voting",
    description: "Secure, verifiable remote voting system with biometric authentication.",
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
            <a href="/" className="app-logo">
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
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                <line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line>
              </svg>
              <span>EVoter</span>
            </a>
            <nav className="nav-links">
              <a href="/verify" className="btn btn-ghost btn-icon" title="Verify Receipt">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64"></path>
                </svg>
                <span className="btn-text">Verify</span>
              </a>
              <a href="/admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span className="btn-text">Official Portal</span>
              </a>
            </nav>
          </header>
          <main style={{ minHeight: '60vh' }}>
            {children}
          </main>
          <footer className="app-footer animate-fade-in">
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/security">Security</a>
              <a href="/terms">Terms of Service</a>
              <a href="/help">Help Centre</a>
              <a href="/contact">Contact</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
              <span>Powered by EVoter Infrastructure</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
              &copy; 2026 Election Commission of India. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
