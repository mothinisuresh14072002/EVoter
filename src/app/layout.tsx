import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVoter | Secure Government Remote Voting",
  description: "Secure, verifiable remote voting system for official elections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-tricolor-bar" />
        <div className="container">
          <header className="app-header animate-fade-in">
            <a href="/" className="app-logo">
              <svg 
                className="chakra-icon"
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                <line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line>
              </svg>
              EVoter
            </a>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <a href="/verify" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Verify Receipt</a>
              <a href="/admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Official Portal</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
