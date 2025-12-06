// admin/components/LiveRidersPanel.js
import { useState } from 'react';
import { UsersIcon, PhoneIcon, BellIcon } from '@heroicons/react/24/outline';

export default function LiveRidersPanel({ riders, onPing, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRiders = riders.filter(rider =>
    rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.phone?.includes(searchTerm)
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Live Riders</h3>
              <p className="text-sm text-slate-400">{riders.length} online</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                    <div>
                      <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
              <UsersIcon className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No riders online</p>
            <p className="text-sm text-slate-500 mt-1">Check back later</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {rider.name?.charAt(0)?.toUpperCase() || rider.phone?.charAt(0) || 'R'}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        rider.lastLocation ? 'bg-green-500' : 'bg-slate-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {rider.name || 'Unknown Rider'}
                      </p>
                      <p className="text-sm text-slate-400">{rider.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPing(rider.id)}
                      className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                      title="Ping rider"
                    >
                      <BellIcon className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${rider.phone}`}
                      className="p-2 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                      title="Call rider"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {rider.lastLocation && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Last location:</span>
                      <span className="text-slate-300">
                        {rider.lastLocation.lat?.toFixed(4)}, {rider.lastLocation.lng?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-slate-400">Updated:</span>
                      <span className="text-slate-300">
                        {new Date(rider.lastLocation.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}