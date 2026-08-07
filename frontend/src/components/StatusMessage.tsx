import React from 'react';

export function StatusMessage({ status, error }: { status?: string; error?: string }) {
  if (error) {
    return <div className="status-text error">{error}</div>;
  }
  if (status) {
    return <div className="status-text info">{status}</div>;
  }
  return null;
}
