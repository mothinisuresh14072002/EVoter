import React, { useEffect, useState } from 'react';
import { verifyFaces, type VerifyFacesResult } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';

const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const CheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoChipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BoltChipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TrashChipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1.5 14a2 2 0 0 1-2 1.9h-7a2 2 0 0 1-2-1.9L5 6" />
  </svg>
);

interface PipelineStep {
  label: string;
  status: 'pending' | 'loading' | 'done';
}

export function ResultPage({
  refSessionId,
  liveSessionId,
  onRestart,
}: {
  refSessionId: string;
  liveSessionId: string;
  onRestart: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyFacesResult | null>(null);
  const [error, setError] = useState('');
  const [pipeline, setPipeline] = useState<PipelineStep[]>([
    { label: 'Pre-processing & landmark detection', status: 'loading' },
    { label: 'Embedding extraction (reference + live)', status: 'pending' },
    { label: 'Cosine similarity scoring', status: 'pending' },
    { label: 'Liveness + quality gates', status: 'pending' },
  ]);

  useEffect(() => {
    let cancelled = false;

    const runPipeline = async () => {
      for (let i = 0; i < pipeline.length; i++) {
        await new Promise((r) => setTimeout(r, 380));
        if (cancelled) return;
        setPipeline((prev) =>
          prev.map((p, idx) => {
            if (idx === i) return { ...p, status: 'done' as const };
            if (idx === i + 1) return { ...p, status: 'loading' as const };
            return p;
          })
        );
      }

      try {
        const res = await verifyFaces(refSessionId, liveSessionId);
        if (cancelled) return;
        setResult(res);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Network error';
        setError(
          `${msg}. Please verify that the backend is running on http://127.0.0.1:8000 and CORS is enabled.`
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runPipeline();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayStatus = (() => {
    if (!result) return 'unknown';
    const s = result.status;
    if (s === 'verified' || s === 'match') return 'verified';
    if (s === 'manual_review') return 'review';
    return 'failed';
  })();

  const score = result?.confidence_score ?? 0;
  const scorePct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (scorePct / 100) * circumference;
  const scoreClass = score >= 0.85 ? 'high' : score >= 0.65 ? 'mid' : 'low';

  return (
    <div className="glass-panel fade-in">
      <h2 className="page-title">Step 3 · Verification Result</h2>
      <p className="page-subtitle">
        Sessions are destroyed immediately after this response is delivered.
      </p>

      {loading && (
        <div className="result-card">
          <div className="confidence-ring-wrap" style={{ opacity: 0.5 }}>
            <svg className="confidence-ring-svg" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF9933" />
                  <stop offset="100%" stopColor="#138808" />
                </linearGradient>
              </defs>
              <circle className="confidence-ring-bg" cx="70" cy="70" r="60" />
              <circle
                className="confidence-ring-fill"
                cx="70"
                cy="70"
                r="60"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (25 / 100) * circumference}
                style={{ opacity: 0.6 }}
              />
            </svg>
            <div className="confidence-ring-inner">
              <div className="spinner-lg" style={{ margin: 0, borderTopColor: 'var(--color-saffron)' }} />
            </div>
          </div>
          <StatusMessage status="Running verification pipeline…" />
          <div className="pipeline-list">
            {pipeline.map((p, idx) => (
              <div
                key={idx}
                className={`pipeline-item ${p.status === 'done' ? 'completed' : ''}`}
              >
                <div className={`pipeline-check ${p.status}`}>
                  {p.status === 'done' && <CheckSmall />}
                </div>
                <div className="pipeline-text">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div>
          <StatusMessage error={error} />
          <div className="action-row">
            <button className="btn btn-primary" onClick={onRestart}>
              <RotateIcon /> Start Over
            </button>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <div className="result-card">
          <div
            className={`result-icon ${displayStatus === 'verified' ? 'verified' : displayStatus === 'review' ? 'review' : 'failed'}`}
          >
            {displayStatus === 'verified' ? (
              <div style={{ color: 'var(--color-green-dark)' }}><CheckIcon /></div>
            ) : displayStatus === 'review' ? (
              <div style={{ color: '#856404' }}><AlertCircleIcon /></div>
            ) : (
              <div style={{ color: 'var(--color-red)' }}><XIcon /></div>
            )}
          </div>

          <div
            className={`result-status-badge ${displayStatus === 'verified' ? 'verified' : displayStatus === 'review' ? 'review' : 'failed'}`}
          >
            {displayStatus === 'verified' && <>✓ Identity VERIFIED</>}
            {displayStatus === 'review' && <>⚑ Manual Review Required</>}
            {displayStatus === 'failed' && <>✗ Match FAILED</>}
          </div>

          <h3 className="result-title">
            {displayStatus === 'verified' && 'Voter identity authenticated'}
            {displayStatus === 'review' && 'Needs a human officer check'}
            {displayStatus === 'failed' && 'Unable to verify identity'}
          </h3>
          <p className="result-subtitle">
            {displayStatus === 'verified' &&
              'Face match confidence meets the election commission threshold. You may proceed to cast a ballot.'}
            {displayStatus === 'review' &&
              'Automated scoring was borderline. A poll officer will review and decide shortly.'}
            {displayStatus === 'failed' &&
              'The live face did not match the reference ID photo within the allowed threshold.'}
          </p>

          <div className="confidence-ring-wrap">
            <svg className="confidence-ring-svg" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF9933" />
                  <stop offset="100%" stopColor="#138808" />
                </linearGradient>
              </defs>
              <circle className="confidence-ring-bg" cx="70" cy="70" r="60" />
              <circle
                className="confidence-ring-fill"
                cx="70"
                cy="70"
                r="60"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="confidence-ring-inner">
              <div className={`confidence-value ${scoreClass === 'high' ? '' : ''}`} style={{
                color: scoreClass === 'high' ? 'var(--color-green-dark)' : scoreClass === 'mid' ? '#856404' : 'var(--color-red)',
                WebkitTextFillColor: 'unset',
                background: 'none',
                WebkitBackgroundClip: 'unset',
              }}>
                {scorePct}%
              </div>
              <div className="confidence-label">Confidence</div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Confidence</div>
              <div className={`metric-value ${scoreClass}`}>{scorePct}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Processing</div>
              <div className="metric-value">
                {result.processing_time_ms != null
                  ? `${(result.processing_time_ms / 1000).toFixed(2)} s`
                  : '—'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Quality</div>
              <div className={`metric-value ${(result.quality_metrics?.sharpness ?? 0) > 60 ? 'high' : 'mid'}`}>
                {result.quality_metrics?.sharpness != null
                  ? `${Math.round(result.quality_metrics.sharpness)}%`
                  : 'N/A'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Liveness</div>
              <div className={`metric-value ${displayStatus === 'verified' ? 'high' : displayStatus === 'review' ? 'mid' : 'low'}`}>
                {displayStatus === 'verified' ? 'PASS' : displayStatus === 'review' ? 'AMBIG' : '—'}
              </div>
            </div>
          </div>

          {result.reason_codes && result.reason_codes.length > 0 && (
            <div className="reason-codes">
              <div className="reason-codes-title">Reason Codes</div>
              {result.reason_codes.map((code, i) => (
                <span key={i} className="reason-code-chip">
                  {code}
                </span>
              ))}
            </div>
          )}

          <div className="pipeline-list" style={{ marginTop: 24 }}>
            {pipeline.map((p, idx) => (
              <div key={idx} className="pipeline-item completed">
                <div className="pipeline-check done">
                  <CheckSmall />
                </div>
                <div className="pipeline-text">{p.label}</div>
              </div>
            ))}
          </div>

          <div className="action-row" style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={onRestart}>
              <RotateIcon /> Start Over
            </button>
            <button
              className={`btn ${displayStatus === 'verified' ? 'btn-success' : 'btn-primary'} btn-lg`}
              onClick={() => window.location.reload()}
            >
              {displayStatus === 'verified' ? 'Proceed to Ballot →' : 'Re-verify Identity'}
            </button>
          </div>

          <div className="info-strip">
            <div className="info-strip-item">
              <InfoChipIcon /> Sessions destroyed
            </div>
            <div className="info-strip-item">
              <BoltChipIcon /> {result.processing_time_ms ?? '--'} ms
            </div>
            <div className="info-strip-item">
              <TrashChipIcon /> 0 images retained
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
