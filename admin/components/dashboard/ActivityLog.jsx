// admin/components/dashboard/ActivityLog.jsx
import { useState } from 'react';
import { BellIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ActivityLog({ logs }) {
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.includes('✅') || log.includes('Connected') || log.includes('loaded');
    if (filter === 'error') return log.includes('❌') || log.includes('Error') || log.includes('Failed');
    if (filter === 'info') return log.includes('📍') || log.includes('📋') || log.includes('📢');
    return true;
  });

  const getLogIcon = (log) => {
    if (log.includes('✅') || log.includes('Connected') || log.includes('loaded')) {
      return <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>;
    }
    if (log.includes('❌') || log.includes('Error') || log.includes('Failed')) {
      return <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>;
    }
    if (log.includes('📍') || log.includes('📋') || log.includes('📢')) {
      return <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>;
    }
    return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>;
  };

  const formatLogText = (log) => {
    return log
      .replace('✅', '✓')
      .replace('❌', '✗')
      .replace('📍', '📍')
      .replace('📋', '📋')
      .replace('📢', '📢')
      .replace('🔗', '🔗')
      .replace('⚠️', '⚠️');
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full">
      <div className="p-4 sm:p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Activity Log</h3>
              <p className="text-sm text-slate-400">Real-time system events</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {['all', 'success', 'error', 'info'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  filter === f
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
              <BellIcon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No activity yet</p>
            <p className="text-sm text-slate-500 mt-1">Events will appear here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-start">
                  {getLogIcon(log)}
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{formatLogText(log)}</p>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="w-3 h-3 text-slate-500 mr-1" />
                      <span className="text-xs text-slate-500">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded">
                    <TrashIcon className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}