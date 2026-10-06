"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  place: string;
  district: string;
  votes?: number;
}

export default function AdminSandbox() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tally, setTally] = useState<Candidate[]>([]);
  const [form, setForm] = useState({
    name: "",
    party: "",
    place: "",
    district: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    const [candidateResponse, tallyResponse] = await Promise.all([
      fetch("/api/admin/candidates", { cache: "no-store" }),
      fetch("/api/admin/tally", { cache: "no-store" }),
    ]);

    if (candidateResponse.status === 401 || tallyResponse.status === 401) {
      setAuthenticated(false);
      return;
    }

    if (!candidateResponse.ok || !tallyResponse.ok) {
      throw new Error("Unable to load the admin sandbox.");
    }

    const [candidateData, tallyData] = await Promise.all([
      candidateResponse.json(),
      tallyResponse.json(),
    ]);

    setCandidates(Array.isArray(candidateData) ? candidateData : []);
    setTally(Array.isArray(tallyData) ? tallyData : []);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(({ authenticated: active }) => setAuthenticated(Boolean(active)))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    loadData().catch((error) =>
      setMessage(error instanceof Error ? error.message : "Unable to load admin data."),
    );

    const timer = window.setInterval(() => {
      loadData().catch(() => undefined);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [authenticated, loadData]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Admin login failed.");
      }

      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Admin login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setAuthenticated(false);
    setCandidates([]);
    setTally([]);
  }

  async function registerCandidate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || body?.detail || "Candidate registration failed.");
      }

      setForm({ name: "", party: "", place: "", district: "" });
      setMessage("Sandbox candidate added.");
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Candidate registration failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (authenticated === null) {
    return (
      <div className="center-content" style={{ minHeight: "55vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner spinner-lg" style={{ margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ maxWidth: "460px", margin: "4rem auto" }}>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h1 className="page-title" style={{ fontSize: "1.8rem" }}>
            Admin Sandbox
          </h1>
          <p className="page-subtitle" style={{ marginBottom: "1rem" }}>
            This area manages only ephemeral prototype data. It is not an election
            authority console.
          </p>

          {message && (
            <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
              <div className="alert-content">
                <p className="alert-text">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={login}>
            <label className="form-label" htmlFor="admin-password">
              Admin sandbox password
            </label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: "1rem" }}
              disabled={busy}
            >
              {busy ? "Signing in..." : "Open admin sandbox"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0", maxWidth: "980px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 className="page-title">Admin Sandbox</h1>
          <p className="page-subtitle">
            Ephemeral candidate and tally data for development testing only.
          </p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
        <div className="alert-content">
          <div className="alert-title">Not a production election console</div>
          <p className="alert-text">
            This backend store is in-memory prototype state. The demo ballot does not add
            votes to this tally, and restarting the backend clears this data.
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
          <div className="alert-content">
            <p className="alert-text">{message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ gap: "1.5rem", alignItems: "start" }}>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Add sandbox candidate</h2>
          <form onSubmit={registerCandidate}>
            {(["name", "party", "place", "district"] as const).map((field) => (
              <div className="form-group" key={field}>
                <label className="form-label" htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  className="form-input"
                  value={form[field]}
                  maxLength={120}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {busy ? "Saving..." : "Add sandbox candidate"}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Sandbox state</h2>
          {candidates.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>
              No sandbox candidates are registered.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {candidates.map((candidate) => {
                const tallyEntry = tally.find((item) => item.id === candidate.id);
                return (
                  <div
                    key={candidate.id}
                    style={{
                      padding: "0.9rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <strong>{candidate.name}</strong>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                      {candidate.party} · {candidate.place}, {candidate.district}
                    </div>
                    <div style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>
                      Mock tally: <strong>{tallyEntry?.votes ?? 0}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
