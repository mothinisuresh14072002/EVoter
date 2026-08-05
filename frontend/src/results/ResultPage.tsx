import React, { useEffect, useState } from 'react';
import { verifyFaces } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';

interface ResultData {
  status: string;
  confidence_score?: number;
  reason_codes?: string[];
}

export function ResultPage({ 
  refSessionId, 
  liveSessionId, 
  onRestart 
}: { 
  refSessionId: string, 
  liveSessionId: string, 
  onRestart: () => void 
}) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyFaces(refSessionId, liveSessionId)
      .then(res => {
        setResult(res);
        setLoading(false);
      })
      .catch(err => {
        setError('Verification failed due to network error.');
        setLoading(false);
      });
  }, [refSessionId, liveSessionId]);

  if (loading) {
    return (
      <div>
        <h2>Step 3: Verification Result</h2>
        <StatusMessage status="Verifying faces... Please wait." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <h2>Step 3: Verification Result</h2>
        <StatusMessage error={error} />
        <button onClick={onRestart} style={{ marginTop: '20px', padding: '8px 16px' }}>Start Over</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Step 3: Verification Result</h2>
      
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: result?.status === 'match' ? '#e6ffe6' : '#ffe6e6',
        display: 'inline-block'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Status: {result?.status.toUpperCase()}</h3>
        
        {result?.confidence_score !== undefined && (
          <p style={{ margin: '5px 0' }}>
            <strong>Confidence:</strong> {(result.confidence_score * 100).toFixed(1)}%
          </p>
        )}
        
        {result?.reason_codes && result.reason_codes.length > 0 && (
          <p style={{ margin: '5px 0', color: '#555' }}>
            <strong>Reasons:</strong> {result.reason_codes.join(', ')}
          </p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={onRestart} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Start Over
        </button>
      </div>
    </div>
  );
}
