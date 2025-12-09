// admin/pages/weekly-plans.js
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import WeeklyPlanManagement from '../components/weeklyPlan/WeeklyPlanManagement';

export default function WeeklyPlansPage() {
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyPlans();
  }, []);

  const fetchWeeklyPlans = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/weekly-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setWeeklyPlans(data.weeklyPlans || []);
    } catch (error) {
      console.error('Error fetching weekly plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Weekly Plans</h1>
          <p className="text-slate-400">Manage customer weekly meal plans</p>
        </div>
        <WeeklyPlanManagement 
          weeklyPlans={weeklyPlans} 
          loading={loading} 
          onRefresh={fetchWeeklyPlans} 
        />
      </div>
    </Layout>
  );
}