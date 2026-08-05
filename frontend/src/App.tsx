import React, { useState } from 'react';
import { UploadPage } from './upload/UploadPage';
import { WebcamPage } from './webcam/WebcamPage';
import { ResultPage } from './results/ResultPage';

export default function App() {
  const [step, setStep] = useState(1);
  const [refSessionId, setRefSessionId] = useState<string | null>(null);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);

  const handleUploadSuccess = (sessionId: string) => {
    setRefSessionId(sessionId);
    setStep(2);
  };

  const handleWebcamSuccess = (sessionId: string) => {
    setLiveSessionId(sessionId);
    setStep(3);
  };

  const handleRestart = () => {
    setRefSessionId(null);
    setLiveSessionId(null);
    setStep(1);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        EVoter Face Verification
      </h1>
      
      <div style={{ marginTop: '30px' }}>
        {step === 1 && (
          <UploadPage onSuccess={handleUploadSuccess} />
        )}
        
        {step === 2 && (
          <WebcamPage onSuccess={handleWebcamSuccess} />
        )}
        
        {step === 3 && refSessionId && liveSessionId && (
          <ResultPage 
            refSessionId={refSessionId} 
            liveSessionId={liveSessionId} 
            onRestart={handleRestart} 
          />
        )}
      </div>
    </div>
  );
}
