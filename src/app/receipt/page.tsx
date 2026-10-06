"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const rawReceiptId = searchParams.get("id") || "";
  const receiptId = /^R-[0-9A-F]{8}$/.test(rawReceiptId) ? rawReceiptId : "";
  const [copied, setCopied] = useState(false);

  const createdAt = useMemo(
    () =>
      new Date().toLocaleString("en-IN", {
        dateStyle: "long",
        timeStyle: "medium",
        timeZone: "Asia/Kolkata",
      }),
    [],
  );

  async function copyReceipt() {
    if (!receiptId) return;

    try {
      await navigator.clipboard.writeText(receiptId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadReceipt() {
    if (!receiptId) return;

    const content = [
      "EVOTER RESEARCH DEMO RECEIPT",
      "============================",
      `Receipt ID: ${receiptId}`,
      `Displayed at: ${createdAt} IST`,
      "",
      "This receipt confirms only that the EVoter prototype completed its demo submission flow.",
      "It is not proof of participation in a real election, is not a ledger inclusion proof,",
      "and does not represent a vote certified or recorded by any election authority.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `EVoter-Demo-Receipt-${receiptId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (!receiptId) {
    return (
      <div style={{ maxWidth: "560px", margin: "4rem auto", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 className="page-title">No valid demo receipt</h2>
          <p className="page-subtitle">
            Complete the research demo ballot flow to receive a receipt identifier.
          </p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(19, 136, 8, 0.1)",
            color: "var(--color-green)",
            display: "grid",
            placeItems: "center",
            fontSize: "2rem",
            fontWeight: 800,
            margin: "0 auto 1rem",
          }}
          aria-hidden="true"
        >
          ✓
        </div>
        <h2 className="page-title">Demo Submission Complete</h2>
        <p className="page-subtitle">
          The prototype flow completed and your temporary voter/biometric authorization
          cookies were cleared.
        </p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
        <div className="alert-content">
          <div className="alert-title">Non-binding research receipt</div>
          <p className="alert-text">
            This is not an official election receipt, blockchain record, tally inclusion
            proof, government record, or cryptographic proof of a real vote.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          DEMO RECEIPT ID
        </div>
        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            margin: "0.6rem 0",
          }}
        >
          {receiptId}
        </div>
        <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          Displayed at {createdAt} IST
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          <button type="button" className="btn btn-ghost" onClick={copyReceipt}>
            {copied ? "Copied" : "Copy ID"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={downloadReceipt}>
            Download demo receipt
          </button>
          <Link href="/" className="btn btn-primary">
            Return home
          </Link>
        </div>
      </div>

      <p
        style={{
          marginTop: "1.25rem",
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        The server intentionally does not receive the fictional candidate selected on the
        demo ballot. The current project demonstrates authorization boundaries and UI flow,
        not a production election tally or end-to-end verifiable voting protocol.
      </p>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="center-content" style={{ minHeight: "50vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Opening demo receipt...</p>
          </div>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
