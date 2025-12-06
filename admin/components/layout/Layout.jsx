// admin/components/layout/Layout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Import actual icon components
import {
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import Header from './Header';
import Footer from './Footer';
import StatsCards from './StatsCards';
import MobileMenu from './MobileMenu';

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Load admin info from localStorage
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdmin({ email: payload.email, name: payload.name || 'Admin' });
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [router]);

  // Pass actual icon components, not strings
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: ChartBarIcon,  // Actual component, not string
      current: router.pathname === '/' 
    },
    { 
      name: 'Live Riders', 
      href: '#riders', 
      icon: UsersIcon  // Actual component
    },
    { 
      name: 'Task Queue', 
      href: '#tasks', 
      icon: ClipboardDocumentListIcon  // Actual component
    },
    { 
      name: 'Call Center', 
      href: '/call-demo', 
      icon: PhoneIcon  // Actual component
    },
    { 
      name: 'Analytics', 
      href: '#analytics', 
      icon: ChartBarIcon  // Actual component
    },
    { 
      name: 'Settings', 
      href: '#settings', 
      icon: Cog6ToothIcon  // Actual component
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <title>MypadiFood Admin Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col">
        <Header 
          admin={admin} 
          onMenuClick={() => setSidebarOpen(true)} 
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <StatsCards />
          {children}
        </main>
        
        <Footer />
        
        <MobileMenu 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          navItems={navItems}
        />
      </div>
    </>
  );
}