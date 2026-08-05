import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("evoter_session");

  if (!session) {
    redirect("/auth/digilocker");
  }

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Voter Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--color-green)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-green)", display: "inline-block" }}></span>
            Eligibility Verified
          </span>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: "2rem" }}>
        <h3 style={{ color: "var(--color-navy)", marginBottom: "1rem" }}>Active Elections</h3>
        
        <div style={{ border: "1px solid rgba(128,128,128,0.2)", borderRadius: "8px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)" }}>
          <div>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>2026 Mock Assembly Election</h4>
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>Constituency: Central District 1A</p>
            <p style={{ color: "var(--color-saffron)", fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600 }}>Closes in 14 hours</p>
          </div>
          <div>
            <Link href="/vote" className="btn btn-primary">
              Cast Vote
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", opacity: 0.9 }}>Important Instructions</h3>
        <ul style={{ paddingLeft: "1.5rem", opacity: 0.8, lineHeight: 1.8 }}>
          <li>Ensure you are in a private environment before casting your vote.</li>
          <li>You will be required to authenticate via your device's biometric sensor to confirm your vote.</li>
          <li>Your ballot will be encrypted on this device and cannot be linked back to you.</li>
          <li>Once submitted, you will receive a verifiable receipt code. Keep this code safe.</li>
        </ul>
      </div>
    </div>
  );
}
