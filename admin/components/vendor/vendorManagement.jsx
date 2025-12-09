// admin/components/vendor/VendorManagement.jsx
import { useState } from 'react';
import { 
  BuildingStorefrontIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function VendorManagement({ vendors, loading, onRefresh }) {
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredVendors = vendors.filter(vendor => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !vendor.is_approved;
    if (activeTab === 'approved') return vendor.is_approved;
    return true;
  });

  const handleApproveVendor = async (vendorId) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      onRefresh();
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <BuildingStorefrontIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Vendor Management</h3>
              <p className="text-sm text-slate-400">
                {vendors.filter(v => !v.is_approved).length} pending approvals
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
        <div className="flex space-x-2 mb-6">
          {['all', 'pending', 'approved'].map((tab) => (
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

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-8">
            <BuildingStorefrontIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No vendors found</p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'pending' ? 'No pending vendor approvals' : 'No vendors in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{vendor.business_name}</h4>
                    <p className="text-sm text-slate-400">{vendor.email}</p>
                  </div>
                  <div className="flex items-center">
                    {vendor.is_approved ? (
                      <span className="flex items-center text-green-400 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-400 text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-300 mb-1">Phone: {vendor.phone}</p>
                  {vendor.address && (
                    <p className="text-sm text-slate-400 truncate">
                      {vendor.address.address || 'Address not specified'}
                    </p>
                  )}
                </div>
                
                {vendor.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{vendor.description}</p>
                )}
                
                <div className="flex space-x-2">
                  {!vendor.is_approved && (
                    <button
                      onClick={() => handleApproveVendor(vendor.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm hover:shadow-lg transition-shadow"
                    >
                      Approve
                    </button>
                  )}
                  <button className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors">
                    View Details
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