import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#0a0b10',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif",
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ 
            padding: '40px', 
            backgroundColor: '#161922', 
            borderRadius: '16px', 
            border: '1px solid #2a2e39',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            maxWidth: '600px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #ff4444, #ff8800)'
            }}></div>
            
            <h1 style={{ 
              color: '#ff4444', 
              marginBottom: '20px', 
              fontSize: '24px',
              letterSpacing: '1px'
            }}>⚠️ HỆ THỐNG GẶP SỰ CỐ</h1>
            
            <p style={{ color: '#8b92a5', marginBottom: '30px', fontSize: '15px', lineHeight: '1.6' }}>
              Đã xảy ra lỗi không mong muốn trong quá trình xử lý dữ liệu. <br/>
              Vui lòng thử tải lại trang hoặc liên hệ bộ phận kỹ thuật để được hỗ trợ.
            </p>
            
            <div style={{ 
              backgroundColor: '#0a0b10', 
              padding: '15px', 
              borderRadius: '8px', 
              textAlign: 'left',
              fontSize: '12px',
              fontFamily: "'Fira Code', monospace",
              color: '#ff4444',
              marginBottom: '30px',
              overflowX: 'auto',
              border: '1px solid #2a2e39',
              maxHeight: '150px'
            }}>
              <span style={{ color: '#5c677d' }}>[ERROR_LOG]:</span> {this.state.error && this.state.error.toString()}
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                padding: '12px 32px', 
                backgroundColor: '#ccff00', 
                color: '#000', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'transform 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              TẢI LẠI TRANG
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
