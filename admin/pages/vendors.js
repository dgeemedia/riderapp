// admin/pages/vendors.js
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import VendorManagement from '../components/vendor/VendorManagement';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Vendor Management</h1>
          <p className="text-slate-400">Manage food vendors and their approval status</p>
        </div>
        <VendorManagement vendors={vendors} loading={loading} onRefresh={fetchVendors} />
      </div>
    </Layout>
  );
}