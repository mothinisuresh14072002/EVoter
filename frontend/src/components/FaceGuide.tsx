import React from 'react';

export interface FaceGuideProps {
  state?: 'idle' | 'scanning' | 'success' | 'error';
}

export function FaceGuide({ state = 'idle' }: FaceGuideProps) {
  return (
    <div className={`face-guide-overlay ${state}`}>
      <div className="face-guide-oval" />
      <div className="face-guide-scanline" />
    </div>
  );
}
