"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './info.module.css';

type TabType = 'privacy' | 'security' | 'terms' | 'help' | 'contact';

function InfoContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('privacy');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['privacy', 'security', 'terms', 'help', 'contact'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Privacy Policy</h2>
            <div className={styles.sectionContent}>
              <p><strong>What EVoter is:</strong> EVoter is a secure, verifiable remote voting system designed to facilitate official elections with robust biometric authentication.</p>
              
              <h3>What data EVoter may process</h3>
              <ul>
                <li><strong>DigiLocker or Aadhaar-related verification data:</strong> Used strictly for verifying voter identity against official records.</li>
                <li><strong>Phone biometric confirmation:</strong> EVoter uses standard device APIs to confirm user presence. <strong>EVoter does not collect raw phone fingerprint data</strong> and <strong>does not receive raw lockscreen biometric data.</strong></li>
                <li><strong>Face verification data:</strong> <strong>Face verification is only for identity proofing.</strong> We temporarily process live photos to match against official ID photos.</li>
                <li><strong>Voting data and ballot secrecy:</strong> Your vote is fully encrypted. <strong>Candidate choice must not be stored together with voter identity.</strong> <strong>Face-verification data must not be linked to vote choice.</strong></li>
              </ul>

              <h3>Data EVoter does not collect by default</h3>
              <p>We do not collect background location, browsing history, or raw device sensor data.</p>

              <h3>Data retention</h3>
              <p><strong>Raw face images and embeddings are not stored by default unless legally required and approved.</strong> Verification sessions are ephemeral and are destroyed within 60 seconds of completion or inactivity.</p>

              <h3>Data sharing</h3>
              <p>EVoter does not share your data with third parties, marketers, or analytics providers. Data is strictly managed by the Election Commission.</p>

              <h3>User rights and support</h3>
              <p>You have the right to request information on how your data is handled. Please refer to the Contact section for support channels.</p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Security</h2>
            <div className={styles.sectionContent}>
              <p>EVoter employs comprehensive security measures to ensure the integrity of the electoral process.</p>
              
              <h3>Identity security</h3>
              <p>Identity is verified against official records using robust authentication mechanisms. <strong>Identity proofing data must not be linked to vote choice.</strong></p>

              <h3>Phone biometric security</h3>
              <p>When device-level authentication is used, <strong>phone fingerprint data stays on the device.</strong> <strong>EVoter receives only local biometric success or failure where supported.</strong></p>

              <h3>Face-verification security</h3>
              <p>Face verification uses temporary sessions to prevent spoofing. <strong>Face images and embeddings are not stored by default.</strong></p>

              <h3>Ballot secrecy</h3>
              <p>Your vote is cryptographically separated from your identity to ensure absolute ballot secrecy.</p>

              <h3>Encryption</h3>
              <p>All data in transit is secured using modern TLS encryption, and ballots are encrypted on your device before transmission.</p>

              <h3>Audit logs & Admin controls</h3>
              <p>System access and verification events are logged for auditing purposes. Admin controls are strictly limited and do not have access to unencrypted ballots or persistent biometric data.</p>
              
              <h3>Anti-spoofing and fraud prevention</h3>
              <p>Our biometric engine includes robust liveness checks to prevent presentation attacks (e.g., photos of photos, masks).</p>

              <h3>Responsible disclosure & Security limitations</h3>
              <p>We welcome responsible disclosure of potential vulnerabilities. Please note that <strong>EVoter is not “unhackable.”</strong> While we take extreme precautions, <strong>production public elections require independent audit, legal approval, and certification.</strong></p>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Terms and Conditions</h2>
            <div className={styles.sectionContent}>
              <p><strong>This is prototype text and needs legal review.</strong></p>
              
              <h3>Acceptance of terms</h3>
              <p>By using EVoter, you agree to abide by these terms.</p>
              
              <h3>Eligibility & Account and identity verification</h3>
              <p>You must be eligible to vote. Identity verification is strictly required.</p>
              
              <h3>Permitted use</h3>
              <p>You may use this system solely for casting your own vote in an authorized election.</p>
              
              <h3>Prohibited use</h3>
              <p>The following actions are strictly prohibited and may result in legal action:</p>
              <ul>
                <li>Impersonating another voter.</li>
                <li>Uploading fake documents.</li>
                <li>Vote coercion.</li>
                <li>Vote buying or selling.</li>
                <li>Face spoofing.</li>
                <li>Replay attacks.</li>
                <li>Phishing.</li>
                <li>Attacking the system.</li>
                <li>Scraping.</li>
                <li>Bypassing controls.</li>
              </ul>
              
              <h3>Voting integrity rules & User responsibilities</h3>
              <p>You are responsible for ensuring your voting environment is private. <strong>EVoter must not be used to force or buy votes.</strong> <strong>Users must not try to bypass verification.</strong></p>
              
              <h3>Service availability</h3>
              <p>The service is provided during designated election periods. We aim for high availability but do not guarantee uninterrupted access.</p>
              
              <h3>Privacy and security reference</h3>
              <p>Your use of EVoter is also subject to our Privacy Policy and Security standards outlined in this Information Centre.</p>
              
              <h3>Disclaimers & Contact</h3>
              <p><strong>Remote voting for binding public elections requires official approval.</strong> If you need assistance, please use the Contact section.</p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Help Centre</h2>
            <div className={styles.sectionContent}>
              <h3>Frequently Asked Questions</h3>
              
              <div style={{ marginTop: '1rem' }}>
                <h4>What is EVoter?</h4>
                <p>EVoter is a secure remote voting system designed for binding public elections.</p>
                
                <h4>How do I verify my identity?</h4>
                <p>Identity is verified using your official document via DigiLocker, followed by a live biometric check (face verification or phone biometric authentication).</p>
                
                <h4>Why do I need DigiLocker verification?</h4>
                <p>DigiLocker ensures that your identity is tied to an official, government-issued document, which is required to prevent voter fraud.</p>
                
                <h4>Does EVoter store my fingerprint?</h4>
                <p>No. <strong>EVoter does not store raw phone fingerprint data.</strong> It only receives a local success/failure signal from your device.</p>
                
                <h4>Why did face verification fail?</h4>
                <p><strong>Face verification can fail because of lighting, blur, multiple faces, camera permission, or liveness failure.</strong></p>
                
                <h4>How do I improve camera lighting?</h4>
                <p>Move to a well-lit area where the light source is in front of you, illuminating your face evenly without creating harsh shadows.</p>
                
                <h4>What if my phone camera does not work?</h4>
                <p>You will need a device with a functioning camera to complete the verification process. Please try using another supported device.</p>
                
                <h4>What if I cannot use fingerprint or face verification?</h4>
                <p>If you cannot use biometric verification, please contact the election authority for alternative voting arrangements.</p>
                
                <h4>How do I know my vote was submitted?</h4>
                <p>You will receive a cryptographically secure voting receipt once your ballot is successfully cast.</p>
                
                <h4>Can anyone see who I voted for?</h4>
                <p>No. Your identity verification and your encrypted ballot are processed separately to guarantee secrecy.</p>
                
                <h4>What should I do if someone is forcing me to vote?</h4>
                <p><strong>If someone is forcing the voter, they should leave the voting flow and contact official support or election authority.</strong></p>
                
                <h4>How do I report a problem?</h4>
                <p>Use the Contact section to reach our support desk. Note: <strong>Users should not be told how to bypass verification.</strong></p>
                
                <h4>What happens if the app is down?</h4>
                <p>In the rare event of downtime, please wait and try again later. Election timelines are strictly monitored for such interruptions.</p>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Support</h2>
            <div className={styles.sectionContent}>
              <p>For assistance, please reach out to the appropriate department:</p>
              
              <div style={{ margin: '1.5rem 0' }}>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  <li><strong>General support:</strong> support@example.com</li>
                  <li><strong>Verification & Face verification issues:</strong> support@example.com</li>
                  <li><strong>Privacy requests:</strong> privacy@example.com</li>
                  <li><strong>Security reports:</strong> security@example.com</li>
                  <li><strong>Election official inquiry:</strong> support@example.com</li>
                  <li><strong>Accessibility support:</strong> support@example.com</li>
                </ul>
              </div>
              
              <div style={{ backgroundColor: 'rgba(255, 153, 51, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <strong>Important:</strong> Do not submit your Aadhaar number, OTP, password, raw face image, or sensitive documents.
              </div>
              
              <form className={styles.contactForm} onSubmit={(e) => { e.preventDefault(); alert("Message sent to support."); }}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" placeholder="Enter your name" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contactInfo">Email or phone</label>
                  <input type="text" id="contactInfo" placeholder="Email address or phone number" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>
                  <select id="category" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
                    <option value="general">General Support</option>
                    <option value="verification">Verification Issue</option>
                    <option value="privacy">Privacy Request</option>
                    <option value="security">Security Report</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" placeholder="Brief subject" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows={4} placeholder="Describe the problem you are facing..." required></textarea>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="consent" required />
                  <label htmlFor="consent" style={{ fontSize: '0.85rem' }}>I consent to processing this data for support purposes.</label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Submit Request</button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-navy)' }}>EVoter Information Centre</h1>
      <p style={{ color: 'var(--text-muted)' }}>Find resources, policies, and assistance for the EVoter system.</p>
      
      <div className={styles.infoContainer}>
        <div className={styles.sidebar}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'privacy' ? styles.active : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'terms' ? styles.active : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms and Conditions
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'help' ? styles.active : ''}`}
            onClick={() => setActiveTab('help')}
          >
            Help Centre
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'contact' ? styles.active : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>
        
        <div className={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <InfoContent />
    </Suspense>
  );
}
