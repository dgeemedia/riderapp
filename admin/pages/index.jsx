// admin/pages/index.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/layout/Layout';
import LiveRidersPanel from '../components/dashboard/LiveRidersPanel';
import TaskQueuePanel from '../components/dashboard/TaskQueuePanel';
import ActivityLog from '../components/dashboard/ActivityLog';
import SystemStatus from '../components/dashboard/SystemStatus';
import AssignModal from '../components/modals/AssignModal';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ArrowPathIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

// Dynamic imports for better performance
const AdminMap = dynamic(() => import('../components/map/AdminMap'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

// Loading skeleton for map
const MapLoadingSkeleton = () => (
  <div className="glass-card rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 animate-pulse">
    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full gradient-primary mx-auto mb-4 animate-pulse-subtle"></div>
        <p className="text-sm text-slate-400">Loading live map...</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [riders, setRiders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Food delivery stats
  const [foodStats, setFoodStats] = useState({
    pendingVendors: 0,
    activeOrders: 0,
    weeklyPlans: 0,
    todaysDeliveries: 0,
    totalProducts: 0,
    outOfStockProducts: 0
  });

  useEffect(() => {
    loadData();
    loadFoodStats();
    setupWebSocket();
    
    return () => {
      // Cleanup
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load riders
      const ridersRes = await fetch('/api/riders/available');
      const ridersData = await ridersRes.json();
      setRiders(ridersData);
      
      // Load tasks
      const tasksRes = await fetch((process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000') + '/api/tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFoodStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Load pending vendors count
      const vendorsRes = await fetch('/api/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorsData = await vendorsRes.json();
      const pendingVendors = vendorsData.vendors?.filter(v => !v.is_approved).length || 0;
      
      // Load active orders count
      const ordersRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      const activeOrders = ordersData.orders?.filter(o => 
        ['pending', 'assigned', 'accepted', 'preparing'].includes(o.status)
      ).length || 0;
      
      // Load weekly plans count
      const plansRes = await fetch('/api/weekly-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const plansData = await plansRes.json();
      const weeklyPlans = plansData.weeklyPlans?.length || 0;
      
      // Load products count
      const productsRes = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsData = await productsRes.json();
      const totalProducts = productsData.products?.length || 0;
      const outOfStockProducts = productsData.products?.filter(p => !p.in_stock).length || 0;
      
      // Today's deliveries
      const todaysDeliveries = ordersData.orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString() && o.status === 'delivered';
      }).length || 0;
      
      setFoodStats({
        pendingVendors,
        activeOrders,
        weeklyPlans,
        todaysDeliveries,
        totalProducts,
        outOfStockProducts
      });
    } catch (error) {
      console.error('Error loading food stats:', error);
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem('admin_token');
    const socket = require('socket.io-client')(process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000', {
      auth: { role: 'admin', token }
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    
    socket.on('vendor:registration', () => {
      loadFoodStats(); // Refresh stats when new vendor registers
    });
    
    socket.on('order:created', () => {
      loadFoodStats(); // Refresh stats when new order is created
    });
    
    socket.on('weekly_plan:created', () => {
      loadFoodStats(); // Refresh stats when new weekly plan is created
    });

    socket.on('product:updated', () => {
      loadFoodStats(); // Refresh stats when product is updated
    });
    
    return () => socket.disconnect();
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              Dispatch Control Center
            </h1>
            <p className="text-sm text-slate-400">
              Monitor riders, assign tasks, and manage deliveries in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-sm ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="hidden sm:inline">
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </span>
              <span className="sm:hidden">
                {autoRefresh ? 'ON' : 'OFF'}
              </span>
            </button>
            
            <button 
              onClick={() => {
                loadData();
                loadFoodStats();
              }}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh All</span>
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Food Delivery Overview Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Food Delivery Overview</h2>
          <button 
            onClick={loadFoodStats}
            className="flex items-center space-x-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Stats</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <div className="glass-card rounded-xl hover-card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Pending Vendor Approvals</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{foodStats.pendingVendors}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/vendors')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Manage Vendors
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl hover-card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Active Food Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{foodStats.activeOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                  <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/orders')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl hover-card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Weekly Plans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{foodStats.weeklyPlans}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/weekly-plans')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Manage Plans
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl hover-card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Today's Deliveries</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{foodStats.todaysDeliveries}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button 
                onClick={() => router.push('/orders')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="glass-card rounded-xl hover-card">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Total Products</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{foodStats.totalProducts}</p>
                  <p className="text-xs text-red-400 mt-1">{foodStats.outOfStockProducts} out of stock</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <button 
                onClick={() => router.push('/products')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
              >
                Manage Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Map and Panels */}
        <div className="lg:flex-1 space-y-6">
          {/* Live Map */}
          <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
            <AdminMap riders={riders} />
          </div>

          {/* Panels Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <LiveRidersPanel 
              riders={riders} 
              onPing={() => {}} 
              isLoading={isLoading} 
            />
            <TaskQueuePanel 
              tasks={tasks} 
              onAssign={(task) => {
                setSelectedTask(task);
                setAssignOpen(true);
              }} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-96 space-y-6">
          {/* Quick Call Panel - Simplified for mobile */}
          <div className="glass-card rounded-xl sm:rounded-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Quick Call
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter rider ID or phone"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button className="w-full py-2.5 gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
                  Start Call
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <ActivityLog logs={[]} />

          {/* System Status */}
          <SystemStatus />
        </div>
      </div>

      {/* Assign Modal */}
      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        task={selectedTask}
        riders={riders}
        onAssign={() => {}}
      />
    </Layout>
  );
}