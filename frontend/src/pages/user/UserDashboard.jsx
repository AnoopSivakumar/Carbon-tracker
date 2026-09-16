import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CarbonTrendChart from '../../components/charts/CarbonTrendChart';

export default function UserDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [activities, setActivities] = useState([]);
  const [rewardTotal, setRewardTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [actRes, rewardRes] = await Promise.all([
          api.get('/activities/mine'),
          api.get('/rewards/mine')
        ]);
        setInsights(actRes.data.insights);
        setActivities(actRes.data.activities);
        setRewardTotal(rewardRes.data.total_approved_points);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = [...activities]
    .filter((a) => a.status === 'verified')
    .sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date))
    .map((a) => ({ activity_date: a.activity_date?.slice(5, 10), total_carbon_kg: Number(a.carbon_score) }));

  if (loading) return <p className="text-gray-500">Loading your dashboard…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Hi {user.name.split(' ')[0]}, here's your green summary 🌍</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Activities Logged" value={insights?.total_logged ?? 0} />
        <StatCard label="Verified" value={insights?.verified_count ?? 0} />
        <StatCard label="Avg Daily CO2 (kg)" value={insights?.average_daily_carbon_kg ?? 0} />
        <StatCard label="Reward Points" value={rewardTotal} accent />
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Your carbon footprint trend</h2>
        {chartData.length ? (
          <CarbonTrendChart data={chartData} />
        ) : (
          <p className="text-gray-400 text-sm">Log and get activities verified to see your trend here.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-2xl shadow p-5 ${accent ? 'bg-green-600 text-white' : 'bg-white text-gray-800'}`}>
      <p className={`text-sm ${accent ? 'text-green-100' : 'text-gray-500'}`}>{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
