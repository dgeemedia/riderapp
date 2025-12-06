// admin/pages/_app.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="text-center">
        <div className="w-20 h-20 gradient-primary rounded-2xl mx-auto mb-6 animate-float flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gradient mb-2">MypadiFood Admin</h2>
        <p className="text-slate-400">Loading dashboard...</p>
        <div className="mt-4 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full gradient-primary rounded-full animate-pulse-subtle w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    // Initialize mobile viewport height fix
    const setVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setVH);
    };
  }, []);

  if (isLoading) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          <title>MypadiFood Admin</title>
        </Head>
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <title>MypadiFood Admin Dashboard</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;