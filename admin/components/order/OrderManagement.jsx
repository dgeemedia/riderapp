// admin/components/order/OrderManagement.jsx
import { useState } from 'react';
import { 
  ShoppingBagIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function OrderManagement({ orders, riders, loading, onRefresh }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'assigned') return order.status === 'assigned';
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'assigned': return 'bg-blue-500/20 text-blue-300';
      case 'accepted': return 'bg-purple-500/20 text-purple-300';
      case 'preparing': return 'bg-orange-500/20 text-orange-300';
      case 'ready': return 'bg-green-500/20 text-green-300';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatPrice = (priceBigInt) => {
    return `₦${(priceBigInt / 100).toLocaleString()}`;
  };

  const handleAssignRider = async (orderId, riderId) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`/api/orders/${orderId}/assign-rider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ riderId })
      });
      onRefresh();
    } catch (error) {
      console.error('Error assigning rider:', error);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Order Management</h3>
              <p className="text-sm text-slate-400">
                {orders.filter(o => o.status === 'pending').length} pending orders
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'assigned', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBagIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No orders found</p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'pending' ? 'No pending orders' : 'No orders in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm text-slate-400">
                        Order #{order.id?.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 font-medium">
                          {formatPrice(order.total_amount_bigint)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <select
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                        onChange={(e) => e.target.value && handleAssignRider(order.id, e.target.value)}
                      >
                        <option value="">Assign Rider</option>
                        {riders.map(rider => (
                          <option key={rider.id} value={rider.id}>
                            {rider.name || rider.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-1">Delivery Address</p>
                      <p className="text-sm text-slate-400">
                        {order.delivery_address?.address || 'Address not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {order.special_instructions && (
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-1">Special Instructions</p>
                      <p className="text-sm text-slate-400">{order.special_instructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-3 py-1.5 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition-colors">
                      Contact Customer
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-red-500/20 text-red-300 text-sm rounded-lg hover:bg-red-500/30 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}