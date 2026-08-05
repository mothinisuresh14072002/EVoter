"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("id");

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: "3rem 2rem", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(19, 136, 8, 0.1)", color: "var(--color-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      
      <h2 style={{ marginBottom: "0.5rem" }}>Vote Cast Successfully</h2>
      <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
        Your encrypted ballot has been securely submitted to the election ledger.
      </p>

      <div style={{ background: "rgba(0,0,0,0.03)", border: "1px dashed rgba(128,128,128,0.3)", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "0.5rem" }}>Your Unique Receipt ID</p>
        <h3 style={{ fontFamily: "monospace", fontSize: "1.5rem", letterSpacing: "2px", color: "var(--color-navy)" }}>
          {receiptId || "R-XXXXXX"}
        </h3>
      </div>

      <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "2rem", lineHeight: 1.6 }}>
        Keep this receipt ID safe. You can use it to verify that your ballot is included in the final count without revealing who you voted for.
      </p>

      <Link href="/" className="btn btn-primary" style={{ width: "100%" }}>
        Return to Home
      </Link>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <div className="container" style={{ padding: "4rem 0", maxWidth: "500px" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
