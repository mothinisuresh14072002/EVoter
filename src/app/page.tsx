import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "4rem 0", display: "flex", flexDirection: "column", gap: "3rem", alignItems: "center", textAlign: "center" }} className="animate-fade-in">
      <div style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
          Secure. Transparent. <span className="text-gradient">Verifiable.</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-dark)", opacity: 0.8, marginBottom: "2rem" }}>
          EVoter is the next-generation remote voting infrastructure for high-stakes public elections.
          Verify your identity seamlessly and cast your vote from anywhere with cryptographic certainty.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/auth/digilocker" className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
            Login with DigiLocker
          </Link>
          <Link href="/learn-more" className="btn btn-outline" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
            Learn How It Works
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", width: "100%", marginTop: "3rem" }}>
        <div className="glass-panel" style={{ textAlign: "left" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255, 153, 51, 0.1)", color: "var(--color-saffron)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3>Bank-Grade Security</h3>
          <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>Your ballot is encrypted directly on your device. We use advanced cryptography to ensure your vote is secure and private.</p>
        </div>

        <div className="glass-panel" style={{ textAlign: "left" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(19, 136, 8, 0.1)", color: "var(--color-green)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          </div>
          <h3>Biometric Verification</h3>
          <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>Confirm your presence with your phone's built-in fingerprint or Face ID. Biometric data never leaves your device.</p>
        </div>

        <div className="glass-panel" style={{ textAlign: "left" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0, 0, 128, 0.1)", color: "var(--color-navy)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <h3>Fully Auditable</h3>
          <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>Get a secure receipt to verify your vote was included in the tally, while maintaining absolute ballot secrecy.</p>
        </div>
      </div>
    </main>
  );
}
