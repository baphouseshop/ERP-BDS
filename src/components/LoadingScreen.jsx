import React from 'react';

const LoadingScreen = ({ message = "Đang khởi tạo hệ thống..." }) => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1f2c 0%, #0d0f14 100%)',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '3px solid rgba(204, 255, 0, 0.1)',
        borderTop: '3px solid #ccff00',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px',
        boxShadow: '0 0 15px rgba(204, 255, 0, 0.2)'
      }}></div>
      
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        letterSpacing: '0.05em',
        color: '#ccff00',
        textShadow: '0 0 10px rgba(204, 255, 0, 0.3)',
        marginBottom: '8px'
      }}>
        BLANCA CRM
      </div>
      
      <div style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.6)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}>
        {message}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
