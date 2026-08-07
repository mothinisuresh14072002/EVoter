"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("id") || "R-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const timestampStr = now.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "long",
    timeZone: "Asia/Kolkata",
  });

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Silently fail on old browsers
    }
  };

  const downloadReceipt = () => {
    const content = `
EVOTER VERIFIABLE RECEIPT
=========================

Receipt ID:        ${receiptId}
Election:          2026 Mock Assembly Election
Constituency:      Central District 1A
Submission Time:   ${timestampStr}
Timezone:          IST (UTC+5:30)
Ledger Block:      #284,719
Transaction Hash:  0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join("")}
Voter Credential:  anon_${crypto.randomUUID().slice(0, 12)}
Signature (ecdsa): SIG_${Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("")}

=========================
THIS IS YOUR PROOF OF VOTING.
Your ballot choice cannot be determined from this receipt.
Visit /verify to audit inclusion independently.

Powered by EVoter Infrastructure
© 2026 Election Commission of India
`.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EVoter-Receipt-${receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "3rem 0 4rem", maxWidth: "520px", margin: "0 auto" }}>
      {/* Success Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          className="receipt-success-icon animate-bounce"
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-green), var(--color-green-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            margin: "0 auto 1.25rem",
            boxShadow: "0 12px 32px rgba(19, 136, 8, 0.35)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 className="page-title" style={{ marginBottom: "0.5rem", fontSize: "2.1rem" }}>
          Vote Cast Successfully
        </h2>
        <p className="page-subtitle" style={{ maxWidth: "440px", margin: "0 auto" }}>
          Thank you for exercising your democratic right. Your encrypted ballot has been
          securely recorded on the election immutable ledger.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="receipt-card animate-fade-in">
        <div className="receipt-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <div style={{ fontSize: "0.8rem", color: "var(--color-navy)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Verifiable Ballot Receipt
            </div>
          </div>
          <h3 style={{ fontSize: "1.5rem", margin: 0 }}>EVoter</h3>
        </div>

        <div className="receipt-body">
          {/* QR Placeholder */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className="qr-placeholder" style={{ margin: "0 auto 0.5rem" }}></div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              Scan to verify on the public bulletin board
            </div>
          </div>

          {/* Receipt ID */}
          <div className="receipt-code">
            <div className="receipt-code-label">Your Unique Receipt ID</div>
            <div className="receipt-code-value">{receiptId}</div>
            <button
              onClick={copyReceipt}
              className="btn btn-ghost"
              style={{
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                padding: "0.4rem 0.85rem",
                border: "1px dashed var(--border-color)",
              }}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Receipt ID
                </>
              )}
            </button>
          </div>

          {/* Receipt Details */}
          <div style={{ marginBottom: "1rem" }}>
            <div className="receipt-row">
              <span className="receipt-label">Election</span>
              <span className="receipt-value">2026 Assembly</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Constituency</span>
              <span className="receipt-value">Central 1A</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Submitted (IST)</span>
              <span className="receipt-value">{now.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Ledger Block</span>
              <span className="receipt-value">#284,719</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Ballot Status</span>
              <span className="badge badge-success" style={{ padding: "0.15rem 0.6rem", fontSize: "0.75rem" }}>
                <span className="badge-dot"></span>Committed
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Privacy</span>
              <span className="badge badge-info" style={{ padding: "0.15rem 0.6rem", fontSize: "0.75rem" }}>
                <span className="badge-dot"></span>Anonymous
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Info */}
      <div className="alert alert-info" style={{ marginTop: "2rem", marginBottom: "1.5rem" }}>
        <div className="alert-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <div className="alert-content">
          <div className="alert-title">Keep This Receipt Safe</div>
          <p className="alert-text">
            You can independently verify your ballot was included in the final tally by entering this
            receipt ID at any time after polls close on the <a href="/verify" style={{ fontWeight: 600 }}>Verify Receipt</a> page.
            <strong> Ballot secrecy is preserved — your choice is never revealed.</strong>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link href="/" className="btn btn-primary" style={{ flex: "1 1 180px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Return Home
        </Link>
        <button onClick={downloadReceipt} className="btn btn-ghost" style={{ flex: "1 1 180px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Receipt
        </button>
        <Link href="/verify" className="btn btn-navy" style={{ flex: "1 1 180px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64"></path>
          </svg>
          Verify Now
        </Link>
      </div>

      {/* Sharing Notice */}
      <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", borderRadius: "var(--radius-full)", background: "rgba(220, 38, 38, 0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style={{ color: "var(--color-danger)", fontWeight: 600 }}>
            Do not share this receipt ID on social media.
          </span>
        </div>
        <p style={{ marginTop: "0.5rem", margin: "0", paddingTop: "0.5rem" }}>
          Sharing your receipt publicly allows third parties to correlate timestamps and
          potentially compromise your ballot secrecy. Keep it offline and secure.
        </p>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <div style={{ padding: "1rem 0" }}>
      <Suspense fallback={
        <div className="center-content" style={{ minHeight: "50vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }}></div>
            <p style={{ color: "var(--color-text-muted)" }}>Preparing your receipt...</p>
          </div>
        </div>
      }>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
