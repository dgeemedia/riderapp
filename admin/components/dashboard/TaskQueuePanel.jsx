// admin/components/dashboard/TaskQueuePanel.jsx
import { useState } from 'react';
import { ClipboardDocumentListIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TaskQueuePanel({ tasks, onAssign, isLoading }) {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'assigned') return task.status === 'assigned' || task.status === 'accepted';
    if (filter === 'completed') return task.status === 'delivered' || task.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'assigned': return 'bg-blue-500/20 text-blue-300';
      case 'accepted': return 'bg-purple-500/20 text-purple-300';
      case 'picked_up': return 'bg-indigo-500/20 text-indigo-300';
      case 'delivered': return 'bg-green-500/20 text-green-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full">
      <div className="p-4 sm:p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Task Queue</h3>
              <p className="text-sm text-slate-400">
                {tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length} pending
              </p>
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'pending', 'assigned', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-700 rounded w-20"></div>
                </div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No tasks available</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter === 'all' ? 'All tasks are processed' : `No ${filter} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                      #{task.id?.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ₦{(task.price_bigint || 1500) / 100}
                    </p>
                    <p className="text-xs text-slate-400">Delivery</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-300">Pickup</p>
                      <p className="text-xs text-slate-400 truncate">
                        {task.pickup?.address || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-300">Dropoff</p>
                      <p className="text-xs text-slate-400 truncate">
                        {task.dropoff?.address || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  <div className="flex items-center space-x-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">
                      {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {task.status === 'pending' || task.status === 'assigned' ? (
                    <button
                      onClick={() => onAssign(task)}
                      className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Assign
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}