// admin/components/Layout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MapPinIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Load admin info from localStorage
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode token to get admin info (simplified)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdmin({ email: payload.email, name: payload.name || 'Admin' });
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [router]);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: ChartBarIcon, current: router.pathname === '/' },
    { name: 'Live Riders', href: '#riders', icon: UsersIcon },
    { name: 'Task Queue', href: '#tasks', icon: ClipboardDocumentListIcon },
    { name: 'Call Center', href: '/call-demo', icon: PhoneIcon },
    { name: 'Analytics', href: '#analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '#settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950">
      {/* Top Navigation Bar */}
      <nav className="glass-card border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Search */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  MypadiFood
                </h1>
                <p className="text-xs text-slate-400">Admin Dashboard</p>
              </div>
            </div>

            <div className="hidden md:block relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="search"
                placeholder="Search riders, tasks..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: User Menu and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <BellIcon className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Admin Profile */}
            {admin && (
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white">{admin.name}</p>
                  <p className="text-xs text-slate-400">{admin.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Riders</p>
                <p className="text-3xl font-bold text-white mt-2">24</p>
                <p className="text-xs text-green-400 mt-1">↑ 12% from last week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Tasks</p>
                <p className="text-3xl font-bold text-white mt-2">18</p>
                <p className="text-xs text-yellow-400 mt-1">3 pending assignment</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg. Response</p>
                <p className="text-3xl font-bold text-white mt-2">4.2m</p>
                <p className="text-xs text-cyan-400 mt-1">↓ 0.5m improvement</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-3xl font-bold text-white mt-2">98.7%</p>
                <p className="text-xs text-purple-400 mt-1">Consistent performance</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="mb-2 md:mb-0">
            © {new Date().getFullYear()} MypadiFood Admin Dashboard v1.0.0
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              System Status: Operational
            </span>
            <span>Last Updated: Just now</span>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center z-50"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <div className="absolute top-0 right-0 w-64 h-full glass-card shadow-xl">
            {/* Mobile menu content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Menu</h3>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}