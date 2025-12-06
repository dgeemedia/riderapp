// admin/pages/_app.js
import { useState, useEffect } from 'react';
import '../styles.css';

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            margin: '0 auto 20px',
            animation: 'float 3s ease-in-out infinite'
          }}></div>
          <h2 style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            fontWeight: '700'
          }}>MypadiFood Admin</h2>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp;