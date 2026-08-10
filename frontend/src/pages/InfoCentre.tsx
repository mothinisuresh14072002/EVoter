import React, { useState } from 'react';
import { InfoTabs } from '../components/InfoTabs';

export function InfoCentre() {
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <div className="info-centre-page fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', border: '1px solid #ffeeba' }}>
        <strong>Prototype notice:</strong> EVoter content must be reviewed by legal, privacy, security, and election-authority experts before production use.
      </div>
      
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>EVoter Information Centre</h1>
      
      <div className="card" style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <InfoTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
