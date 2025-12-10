// rider-web/components/tasks/TaskCard.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { acceptTask } from '../../../lib/api';

export default function TaskCard({ task }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!confirm('Accept this task?')) return;
    
    setLoading(true);
    try {
      await acceptTask(task.id);
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      alert('Failed to accept task');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₦${(price / 100).toLocaleString()}`;
  };

  const getTaskTypeIcon = () => {
    switch (task.type) {
      case 'delivery': return '🚚';
      case 'food': return '🍕';
      case 'parcel': return '📦';
      default: return '📦';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getTaskTypeIcon()}</span>
          <div>
            <h3 className="font-medium text-gray-900">{task.title || 'Delivery Task'}</h3>
            <p className="text-sm text-gray-500">
              {task.distance_km ? `${task.distance_km} km` : 'Nearby'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-primary-600">
            {formatPrice(task.price_bigint || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {task.estimated_duration_minutes || 30} min
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{task.pickup?.address || 'Pickup location'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{task.dropoff?.address || 'Dropoff location'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {task.urgent && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 mr-2">
              URGENT
            </span>
          )}
          <span className="text-xs text-gray-500">
            Expires in {task.expires_in || 5} min
          </span>
        </div>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Accepting...' : 'Accept Task'}
        </button>
      </div>
    </div>
  );
}