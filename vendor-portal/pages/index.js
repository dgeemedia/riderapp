// vendor-portal/pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatsCards from '../components/dashboard/StatsCards';
import SalesChart from '../components/dashboard/SalesChart';
import { useAuth } from '../contexts/AuthContext';
import { getVendorStats } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { vendor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!vendor) {
      router.push('/auth/login');
      return;
    }
    fetchStats();
  }, [vendor]);

  const fetchStats = async () => {
    try {
      const data = await getVendorStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-6"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <StatsCards stats={stats} />
                <div className="mt-8">
                  <SalesChart />
                </div>
                
                {/* Recent Orders */}
                <div className="mt-8 bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Orders
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <p className="text-gray-500 text-center py-8">
                      Recent orders will appear here
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}