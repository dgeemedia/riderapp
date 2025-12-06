// admin/pages/index.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import AssignModal from '../components/AssignModal';
import LiveRidersPanel from '../components/LiveRidersPanel';
import TaskQueuePanel from '../components/TaskQueuePanel';
import ActivityLog from '../components/ActivityLog';
import CallPanel from '../components/CallPanel';

// Dynamic imports for components that need SSR disabled
const AdminMap = dynamic(() => import('../components/AdminMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[520px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse"></div>
  )
});

export default function Dashboard() {
  const [riders, setRiders] = useState([]);
  const [log, setLog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [stats, setStats] = useState({
    activeRiders: 0,
    pendingTasks: 0,
    completedToday: 0,
    avgResponse: '4.2m'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Load riders
        const ridersRes = await fetch('/api/riders', {
          headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
        if (ridersRes.ok) {
          const ridersData = await ridersRes.json();
          setRiders(ridersData);
          setStats(prev => ({ ...prev, activeRiders: ridersData.length }));
        }

        // Load tasks
        const tasksRes = await fetch((process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000') + '/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
          const pending = tasksData.filter(t => t.status === 'pending' || t.status === 'assigned').length;
          setStats(prev => ({ ...prev, pendingTasks: pending }));
        }

        // Initial log
        setLog(prev => ['Dashboard loaded successfully', ...prev.slice(0, 49)]);
      } catch (error) {
        console.error('Load error:', error);
        setLog(prev => [`Error loading data: ${error.message}`, ...prev]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Socket connection for real-time updates
    let socket;
    if (typeof window !== 'undefined') {
      try {
        const io = require('socket.io-client');
        socket = io(process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000', {
          auth: { role: 'admin', token },
          transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
          setLog(prev => ['🔗 Connected to real-time server', ...prev.slice(0, 49)]);
        });

        socket.on('location:update', (data) => {
          setLog(prev => [`📍 ${data.riderId} updated location`, ...prev.slice(0, 49)]);
          setRiders(prev => {
            const index = prev.findIndex(p => p.id === data.riderId);
            if (index === -1) {
              return [{ 
                id: data.riderId, 
                phone: data.phone, 
                name: data.name, 
                lastLocation: data.lastLocation 
              }, ...prev];
            }
            const updated = [...prev];
            updated[index] = { ...updated[index], lastLocation: data.lastLocation };
            return updated;
          });
        });

        socket.on('task:assign', ({ task }) => {
          setLog(prev => [`📋 Task ${task.id?.slice(0, 8)} assigned`, ...prev.slice(0, 49)]);
          setTasks(prev => prev.map(p => p.id === task.id ? task : p));
        });

        socket.on('task:accepted', ({ riderId, taskId }) => {
          setLog(prev => [`✅ ${riderId} accepted task ${taskId?.slice(0, 8)}`, ...prev.slice(0, 49)]);
        });

        socket.on('disconnect', () => {
          setLog(prev => ['⚠️ Disconnected from server', ...prev.slice(0, 49)]);
        });

        socket.on('connect_error', (error) => {
          setLog(prev => [`❌ Connection error: ${error.message}`, ...prev.slice(0, 49)]);
        });
      } catch (error) {
        console.error('Socket setup error:', error);
      }
    }

    // Auto-refresh every 30 seconds
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(async () => {
        if (!isLoading) {
          try {
            const tasksRes = await fetch((process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000') + '/api/tasks');
            if (tasksRes.ok) {
              const tasksData = await tasksRes.json();
              setTasks(tasksData);
            }
          } catch (error) {
            console.error('Auto-refresh error:', error);
          }
        }
      }, 30000);
    }

    return () => {
      if (socket) socket.disconnect();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  // Ping rider function
  const pingRider = async (riderId) => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ riderId, message: 'Please check for available tasks' })
      });
      setLog(prev => [`📢 Ping sent to ${riderId}`, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Ping error:', error);
      setLog(prev => [`❌ Failed to ping ${riderId}`, ...prev.slice(0, 49)]);
    }
  };

  // Open assign modal
  const openAssign = (task) => {
    setSelectedTask(task);
    setAssignOpen(true);
  };

  // Assign task
  const doAssign = async (riderId) => {
    setAssignOpen(false);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ taskId: selectedTask.id, riderId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Assign failed');
      }
      setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
      setLog(prev => [`✅ Assigned ${selectedTask.id?.slice(0, 8)} → ${riderId}`, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Assign error:', error);
      setLog(prev => [`❌ Assign failed: ${error.message}`, ...prev.slice(0, 49)]);
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dispatch Control Center</h1>
            <p className="text-slate-400">Monitor riders, assign tasks, and manage deliveries in real-time</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
            </button>
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Map (Full width on mobile, 2/3 on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Map */}
          <div className="glass-card rounded-2xl p-1 overflow-hidden">
            <AdminMap riders={riders} />
          </div>

          {/* Panels Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiveRidersPanel riders={riders} onPing={pingRider} isLoading={isLoading} />
            <TaskQueuePanel tasks={tasks} onAssign={openAssign} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Quick Call Panel */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Quick Call
              </h3>
            </div>
            <div className="p-6">
              <CallPanel />
            </div>
          </div>

          {/* Activity Log */}
          <ActivityLog logs={log} />

          {/* System Status */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Backend API</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400">Operational</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Redis Cache</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400">Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">WebSocket</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400">Live</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        task={selectedTask}
        riders={riders}
        onAssign={doAssign}
      />
    </Layout>
  );
}