import React, { useEffect, useState } from 'react';
import { verifyFaces, type VerifyFacesResult } from '../api/client';
import { StatusMessage } from '../components/StatusMessage';

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

  useEffect(() => {
    let cancelled = false;

    verifyFaces(refSessionId, liveSessionId)
      .then((response) => {
        if (!cancelled) setResult(response);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(
          reason instanceof Error
            ? reason.message
            : 'The configured verification backend could not be reached.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refSessionId, liveSessionId]);

  const status = result?.status ?? 'failed';
  const confidence = result?.confidence_score;
  const framesReceived = result?.quality_metrics?.frames_received;
  const framesValid = result?.quality_metrics?.frames_valid;

  const title =
    status === 'verified'
      ? 'Verification passed'
      : status === 'manual_review'
      ? 'Borderline verification result'
      : 'Verification did not pass';

  const description =
    status === 'verified'
      ? 'Face similarity, quality, and liveness met the configured research thresholds for this run.'
      : status === 'manual_review'
      ? 'Similarity fell into the configured manual-review band. This repository does not include a staffed adjudication workflow.'
      : 'The reference/live comparison did not satisfy all configured verification gates.';

  return (
    <div className="glass-panel fade-in">
      <h2 className="page-title">Step 3 · Verification Result</h2>
      <p className="page-subtitle">
        The backend deletes both short-lived biometric sessions after this verification request.
      </p>

      {loading && (
        <div className="result-card">
          <div className="spinner-lg" style={{ margin: '2rem auto' }} />
          <StatusMessage status="Running face, quality, liveness, and similarity checks…" />
        </div>
      )}

      {!loading && error && (
        <div>
          <StatusMessage error={error} />
          <div className="action-row">
            <button className="btn btn-primary" onClick={onRestart}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <div className="result-card">
          <div
            className={`result-status-badge ${
              status === 'verified'
                ? 'verified'
                : status === 'manual_review'
                ? 'review'
                : 'failed'
            }`}
          >
            {status === 'verified'
              ? '✓ VERIFIED'
              : status === 'manual_review'
              ? '⚑ BORDERLINE'
              : '✗ FAILED'}
          </div>

          <h3 className="result-title">{title}</h3>
          <p className="result-subtitle">{description}</p>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Similarity</div>
              <div className="metric-value">
                {confidence == null ? 'N/A' : `${Math.round(confidence * 100)}%`}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Liveness</div>
              <div className="metric-value">{result.liveness_result || 'N/A'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Valid Frames</div>
              <div className="metric-value">
                {framesValid == null || framesReceived == null
                  ? 'N/A'
                  : `${Math.round(framesValid)}/${Math.round(framesReceived)}`}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Processing</div>
              <div className="metric-value">
                {result.processing_time_ms == null
                  ? 'N/A'
                  : `${Math.round(result.processing_time_ms)} ms`}
              </div>
            </div>
          </div>

          {result.reason_codes && result.reason_codes.length > 0 && (
            <div className="reason-codes">
              <div className="reason-codes-title">Reason Codes</div>
              {result.reason_codes.map((code) => (
                <span key={code} className="reason-code-chip">
                  {code}
                </span>
              ))}
            </div>
          )}

          <div className="alert alert-warning" style={{ marginTop: 20 }}>
            <div className="alert-content">
              <div className="alert-title">Research result only</div>
              <div className="alert-desc">
                This outcome is not a government identity decision, legal eligibility decision,
                election authorization, or certification of the configured biometric models.
              </div>
            </div>
          </div>

          <div className="action-row" style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-lg" onClick={onRestart}>
              Run Another Check
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
