import React from 'react';

export function StatusMessage({ status, error }: { status?: string, error?: string }) {
  if (error) {
    return <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>;
  }
  if (status) {
    return <p style={{ color: 'blue' }}>{status}</p>;
  }
  return null;
}
