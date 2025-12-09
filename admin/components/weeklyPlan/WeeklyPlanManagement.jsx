// admin/components/weeklyPlan/WeeklyPlanManagement.jsx
import { useState } from 'react';
import { 
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function WeeklyPlanManagement({ weeklyPlans, loading, onRefresh }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredPlans = weeklyPlans.filter(plan => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return plan.status === 'active';
    if (activeTab === 'completed') return plan.status === 'completed';
    if (activeTab === 'cancelled') return plan.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'completed': return 'bg-blue-500/20 text-blue-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleProcessDailyOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch('/api/weekly-plans/process-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: today })
      });
      
      const data = await response.json();
      alert(`Created ${data.orders?.length || 0} daily orders`);
      onRefresh();
    } catch (error) {
      console.error('Error processing daily orders:', error);
      alert('Failed to process daily orders');
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Weekly Plan Management</h3>
              <p className="text-sm text-slate-400">
                {weeklyPlans.filter(p => p.status === 'active').length} active plans
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleProcessDailyOrders}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Process Today's Orders
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            {['all', 'active', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No weekly plans found</p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'active' ? 'No active weekly plans' : 'No plans in this category'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-green-500/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                      <span className="text-sm text-slate-400">
                        Plan #{plan.id?.slice(0, 8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          Customer ID: {plan.customer_id?.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(plan)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="p-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <div key={dayIndex} className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">{dayNames[dayIndex].slice(0, 3)}</p>
                      <div className="flex justify-center space-x-1">
                        {mealTypes.map((meal) => {
                          const hasMeal = true; // You would check if this meal exists in the plan
                          return (
                            <div
                              key={meal}
                              className={`w-2 h-2 rounded-full ${hasMeal ? 'bg-green-500' : 'bg-slate-700'}`}
                              title={`${meal} ${hasMeal ? 'scheduled' : 'not scheduled'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Weekly Plan Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  <XCircleIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Plan Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedPlan.status)}`}>
                          {getStatusText(selectedPlan.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Period</p>
                        <p className="text-white">
                          {new Date(selectedPlan.start_date).toLocaleDateString()} to {new Date(selectedPlan.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Created</p>
                        <p className="text-white">
                          {new Date(selectedPlan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Customer Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400">Customer ID</p>
                        <p className="text-white">{selectedPlan.customer_id?.slice(0, 12)}...</p>
                      </div>
                      <button className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors">
                        View Customer Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-4">Meal Schedule</h4>
                  <div className="space-y-4">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                      <div key={dayIndex} className="bg-slate-800/30 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-3">{dayNames[dayIndex]}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {mealTypes.map((meal) => (
                            <div key={meal} className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-sm font-medium text-slate-300 mb-2 capitalize">{meal}</p>
                              <div className="space-y-2">
                                {/* This would be populated with actual meal items */}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400">Chicken Salad</p>
                                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400">Fresh Juice</p>
                                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700/50 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                Generate This Week's Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal (simplified version) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Create Weekly Plan</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  <XCircleIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer ID"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Any special instructions or notes..."
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700/50 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}