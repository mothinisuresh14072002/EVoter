'use client';

import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface Candidate {
  id: string;
  name: string;
  party: string;
  place?: string;
  district?: string;
  votes?: number;
}

export default function AdminPortal() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tally, setTally] = useState<Candidate[]>([]);
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [place, setPlace] = useState('');
  const [district, setDistrict] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if user previously logged in during this session
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/candidates`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCandidates(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTally = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/tally`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTally(data);
      } else {
        setTally([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchCandidates();
    fetchTally();
    const interval = setInterval(fetchTally, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'EVOTER_ADMIN_2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPasscode('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !party || !place || !district) {
      setError('Please fill in all fields (name, party, place, district).');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, party, place, district })
      });
      if (res.ok) {
        setName('');
        setParty('');
        setPlace('');
        setDistrict('');
        setError('');
        fetchCandidates();
        fetchTally();
      } else {
        setError('Failed to register candidate.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="glass-panel" style={{ marginTop: '4rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-navy)' }}>Admin Restricted</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please enter your official passcode.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loginError && <div style={{ color: 'red', fontSize: '0.9rem' }}>{loginError}</div>}
          <input 
            type="password" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter Passcode"
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', color: 'black', textAlign: 'center' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-navy)' }}>Official Admin Portal</h1>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Logout</button>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Secure election management dashboard.</p>
      
      <div style={{ backgroundColor: 'rgba(255, 153, 51, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 153, 51, 0.3)', margin: '1.5rem 0' }}>
        <strong>Security Notice:</strong> By design, individual voting records are not stored and cannot be accessed. You can only view the aggregated tallies and register candidates. This prevents voter fraud and guarantees ballot secrecy.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Registration Section */}
        <div style={{ backgroundColor: 'var(--surface-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Register Candidate</h2>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="name" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Candidate Name</label>
              <input 
                id="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                type="text" 
                placeholder="e.g. Jane Doe" 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', color: 'black' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="party" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Party/Affiliation</label>
              <input 
                id="party"
                value={party} 
                onChange={(e) => setParty(e.target.value)} 
                type="text" 
                placeholder="e.g. Independent" 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', color: 'black' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="place" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Place/Constituency</label>
              <input 
                id="place"
                value={place} 
                onChange={(e) => setPlace(e.target.value)} 
                type="text" 
                placeholder="e.g. Central City" 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', color: 'black' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="district" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>District</label>
              <input 
                id="district"
                value={district} 
                onChange={(e) => setDistrict(e.target.value)} 
                type="text" 
                placeholder="e.g. North District" 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', color: 'black' }} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Register
            </button>
          </form>
        </div>

        {/* Tally Section */}
        <div style={{ backgroundColor: 'var(--surface-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Live Vote Tally</h2>
          {tally.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No candidates registered yet.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {tally.map((c, i) => (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.party} &bull; {c.place}, {c.district}</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-green)' }}>
                    {c.votes}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
