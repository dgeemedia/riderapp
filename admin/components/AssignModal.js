// admin/components/AssignModal.js
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function AssignModal({ open, onClose, task, riders = [], onAssign }) {
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');

  // Filter riders based on search
  const filteredRiders = riders.filter(rider => 
    rider.name?.toLowerCase().includes(search.toLowerCase()) ||
    rider.phone?.includes(search)
  );

  // Reset when task changed
  useEffect(() => {
    setSelected('');
    setSearch('');
  }, [task]);

  const handleAssign = () => {
    if (!selected) return;
    onAssign(selected);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl glass-card border border-slate-700/50 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <UserGroupIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          Assign Task to Rider
                        </Dialog.Title>
                        <p className="text-sm text-slate-400 mt-1">
                          Select the best rider for this delivery
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Task Info */}
                {task && (
                  <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                            Task #{task.id?.slice(0, 8)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            task.status === 'assigned' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {task.pickup?.address || 'Pickup location'} → {task.dropoff?.address || 'Dropoff location'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ₦{(task.price_bigint || 1500) / 100}
                        </p>
                        <p className="text-xs text-slate-400">Delivery fee</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="p-6">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Search riders by name or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Riders List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {filteredRiders.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
                          <UserGroupIcon className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400">No riders found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your search</p>
                      </div>
                    ) : (
                      filteredRiders.map((rider) => (
                        <div
                          key={rider.id}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-purple-500/50 ${
                            selected === rider.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-slate-700/50 bg-slate-800/30'
                          }`}
                          onClick={() => setSelected(rider.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {rider.name?.charAt(0)?.toUpperCase() || rider.phone?.charAt(0) || 'R'}
                                  </span>
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                                  rider.lastLocation ? 'bg-green-500' : 'bg-slate-500'
                                }`}></div>
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {rider.name || 'Unknown Rider'}
                                </p>
                                <p className="text-sm text-slate-400">{rider.phone}</p>
                                {rider.lastLocation && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Last seen: {new Date(rider.lastLocation.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-2 mb-2">
                                <span className="px-2 py-1 bg-slate-700/50 text-xs rounded">4.8★</span>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                                  {rider.lastLocation ? 'Online' : 'Offline'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                {rider.lastLocation ? 'Nearby' : 'Location unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selected}
                      onClick={handleAssign}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        selected
                          ? 'gradient-primary text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {selected ? (
                        <span className="flex items-center space-x-2">
                          <span>Assign Task</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      ) : (
                        'Select a rider'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}