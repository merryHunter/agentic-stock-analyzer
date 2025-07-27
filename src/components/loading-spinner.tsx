import React from 'react';

export const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '8px',
  }}>
    <div style={{
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
    }}></div>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
); 