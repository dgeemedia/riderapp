// rider-web/pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RiderLayout from '../components/layout/RiderLayout';
import RiderMap from '../components/map/RiderMap';
import TaskCard from '../components/tasks/TaskCard';
import EarningsCard from '../components/common/EarningsCard';
import { useAuth } from '../contexts/AuthContext';
import { getRiderStats, getAvailableTasks } from '../lib/api';

export default function RiderDashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const { rider } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!rider) {
      router.push('/auth/login');
      return;
    }
    fetchData();
    getCurrentLocation();
  }, [rider]);

  const fetchData = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        getRiderStats(),
        getAvailableTasks()
      ]);
      setStats(statsData);
      setTasks(tasksData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Lagos coordinates
          setLocation({ lat: 6.5244, lng: 3.3792 });
        }
      );
    }
  };

  const handleGoOnline = async () => {
    try {
      // API call to update rider status
      // await goOnline();
      alert('You are now online and ready to receive tasks!');
    } catch (error) {
      console.error('Error going online:', error);
    }
  };

  if (!rider) return null;

  return (
    <RiderLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <EarningsCard
            title="Today's Earnings"
            amount={stats?.today_earnings || 0}
            change="+12%"
            color="green"
          />
          <EarningsCard
            title="Completed Tasks"
            amount={stats?.today_tasks || 0}
            change="+5%"
            color="blue"
          />
          <EarningsCard
            title="Current Rating"
            amount={rider.rating || 5.0}
            subtitle={`${rider.total_deliveries || 0} deliveries`}
            color="purple"
          />
          <EarningsCard
            title="Wallet Balance"
            amount={stats?.wallet_balance || 0}
            change=""
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Live Map</h2>
                <button
                  onClick={handleGoOnline}
                  className="bg-green-500 text-white px-4 py-2 rounded-md font-medium hover:bg-green-600"
                >
                  {rider.is_online ? 'Online' : 'Go Online'}
                </button>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                {location ? (
                  <RiderMap location={location} tasks={tasks} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Tasks */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tasks</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-600">No available tasks</p>
                  <p className="text-sm text-gray-500">New tasks will appear here</p>
                </div>
              )}
              <button
                onClick={() => router.push('/tasks')}
                className="w-full mt-4 bg-primary-100 text-primary-700 py-2 rounded-md font-medium hover:bg-primary-200"
              >
                View All Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/tasks/active')}
            className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg"
          >
            <div className="text-2xl mb-2">📦</div>
            <span className="font-medium">Active Tasks</span>
          </button>
          <button
            onClick={() => router.push('/earnings')}
            className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg"
          >
            <div className="text-2xl mb-2">💰</div>
            <span className="font-medium">Earnings</span>
          </button>
          <button
            onClick={() => router.push('/schedule')}
            className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg"
          >
            <div className="text-2xl mb-2">📅</div>
            <span className="font-medium">Schedule</span>
          </button>
          <button
            onClick={() => router.push('/support')}
            className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg"
          >
            <div className="text-2xl mb-2">🆘</div>
            <span className="font-medium">Support</span>
          </button>
        </div>
      </div>
    </RiderLayout>
  );
}