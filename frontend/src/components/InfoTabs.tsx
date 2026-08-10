import React from 'react';
import {
  privacyContent,
  securityContent,
  termsContent,
  helpContent,
  contactContent
} from '../data/infoContent';

interface InfoTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function InfoTabs({ activeTab, setActiveTab }: InfoTabsProps) {
  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'security', label: 'Security' },
    { id: 'terms', label: 'Terms and Conditions' },
    { id: 'help', label: 'Help Centre' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("This prototype form is not connected yet. Please use the listed contact email for urgent issues.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className="info-content-panel fade-in">
            <h2>{privacyContent.title}</h2>
            <ul>
              {privacyContent.content.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{item}</li>
              ))}
            </ul>
          </div>
        );
      case 'security':
        return (
          <div className="info-content-panel fade-in">
            <h2>{securityContent.title}</h2>
            <ul>
              {securityContent.content.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{item}</li>
              ))}
            </ul>
          </div>
        );
      case 'terms':
        return (
          <div className="info-content-panel fade-in">
            <h2>{termsContent.title}</h2>
            <ul>
              {termsContent.content.map((item, i) => (
                <li key={i} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{item}</li>
              ))}
            </ul>
          </div>
        );
      case 'help':
        return (
          <div className="info-content-panel fade-in">
            <h2>{helpContent.title}</h2>
            <div className="faq-list">
              {helpContent.faqs.map((faq, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{faq.q}</h4>
                  <p style={{ lineHeight: '1.6' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="info-content-panel fade-in">
            <h2>{contactContent.title}</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {contactContent.emails.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong>{item.label}:</strong> {item.email}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: 'rgba(255,153,51,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,153,51,0.3)', marginBottom: '2rem' }}>
              <strong>Warning:</strong> Do not submit Aadhaar numbers, OTPs, passwords, raw face images, or sensitive documents through this form.
            </div>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="name" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Name</label>
                <input id="name" type="text" placeholder="Your Name" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="emailOrPhone" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Email or Phone</label>
                <input id="emailOrPhone" type="text" required placeholder="Email or Phone" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="category" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Category</label>
                <select id="category" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option>General Support</option>
                  <option>Verification Issue</option>
                  <option>Privacy Request</option>
                  <option>Security Report</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="subject" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Subject</label>
                <input id="subject" type="text" required placeholder="Subject" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="message" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Message</label>
                <textarea id="message" required rows={4} placeholder="Your message..." style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <input id="consent" type="checkbox" required style={{ marginTop: '0.25rem' }} />
                <label htmlFor="consent" style={{ fontSize: '0.9rem' }}>I consent to submitting this inquiry. I understand this form does not securely accept sensitive information.</label>
              </div>
              <button type="submit" className="button button-primary" style={{ marginTop: '1rem', padding: '0.75rem', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: '#fff' }}>
                Submit Contact Form
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="info-tabs-container">
      <div 
        className="tabs-nav" 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem', 
          marginBottom: '2rem', 
          borderBottom: '1px solid #eee', 
          paddingBottom: '1rem' 
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-color)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {renderContent()}
      </div>
    </div>
  );
}
