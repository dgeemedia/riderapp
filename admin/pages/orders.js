// admin/pages/orders.js
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import OrderManagement from '../components/order/OrderManagement';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch orders
      const ordersRes = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);
      
      // Fetch riders for assignment
      const ridersRes = await fetch('/api/riders/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const ridersData = await ridersRes.json();
      setRiders(ridersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-slate-400">Manage food and grocery delivery orders</p>
        </div>
        <OrderManagement 
          orders={orders} 
          riders={riders} 
          loading={loading} 
          onRefresh={fetchData} 
        />
      </div>
    </Layout>
  );
}