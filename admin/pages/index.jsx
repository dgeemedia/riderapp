// admin/pages/index.jsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/layout/Layout';
import LiveRidersPanel from '../components/dashboard/LiveRidersPanel';
import TaskQueuePanel from '../components/dashboard/TaskQueuePanel';
import ActivityLog from '../components/dashboard/ActivityLog';
import SystemStatus from '../components/dashboard/SystemStatus';
import AssignModal from '../components/modals/AssignModal';

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
  const [riders, setRiders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
    setupWebSocket();
    
    return () => {
      // Cleanup
    };
  }, []);

  const loadData = async () => {
    // Your data loading logic here
  };

  const setupWebSocket = () => {
    // Your WebSocket setup logic here
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
            
            <button className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm">
              Export
            </button>
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