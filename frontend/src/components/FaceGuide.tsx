import React from 'react';

export function FaceGuide() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }}>
      <div style={{
        width: '200px',
        height: '250px',
        border: '3px dashed #00ff00',
        borderRadius: '50%',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
      }}></div>
    </div>
  );
}
