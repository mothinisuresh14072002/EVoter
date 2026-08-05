import Link from "next/link";

export default function DigiLockerAuth() {
  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--color-navy)" }}>DigiLocker Verification</h2>
          <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>
            EVoter uses DigiLocker to securely verify your identity. 
            We only access your eligibility status, not your personal data.
          </p>
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255, 153, 51, 0.1)", borderRadius: "8px", border: "1px solid rgba(255, 153, 51, 0.3)", fontSize: "0.9rem" }}>
            <strong>Demo Credentials:</strong><br/>
            ID: <code>123456789012</code> &nbsp;|&nbsp; PIN: <code>123456</code>
          </div>
        </div>

        <form action="/api/auth/verify" method="POST" style={{ textAlign: "left" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="aadhaar">Aadhaar / Mobile Number</label>
            <input 
              type="text" 
              id="aadhaar" 
              name="aadhaar" 
              className="form-input" 
              placeholder="Enter your registered number" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="pin">Security PIN</label>
            <input 
              type="password" 
              id="pin" 
              name="pin" 
              className="form-input" 
              placeholder="6-digit security PIN" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
            Authenticate with DigiLocker
          </button>
        </form>

        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(128, 128, 128, 0.2)" }}>
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
            By continuing, you consent to share your eligibility status with EVoter.
          </p>
          <Link href="/" style={{ display: "inline-block", marginTop: "1rem", color: "var(--color-navy)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
