import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const statusStyle = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [actRes, rewardRes] = await Promise.all([
        api.get('/activities/history'),
        api.get('/rewards/mine')
      ]);
      setActivities(actRes.data.activities);
      setRewards(rewardRes.data.rewards);
      setLoading(false);
    }
    load();
  }, []);

  function rewardFor(activityId) {
    return rewards.find((r) => r.activity_id === activityId);
  }

  if (loading) return <p className="text-gray-500">Loading history…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Activity History</h1>
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Commute</th>
              <th className="px-4 py-3">Electricity</th>
              <th className="px-4 py-3">Water</th>
              <th className="px-4 py-3">Waste Seg.</th>
              <th className="px-4 py-3">CO2 (kg)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reward pts</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => {
              const reward = rewardFor(a.id);
              return (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{a.activity_date}</td>
                  <td className="px-4 py-3 capitalize">{a.commute_mode} · {a.commute_distance_km} km</td>
                  <td className="px-4 py-3">{a.electricity_kwh} kWh</td>
                  <td className="px-4 py-3">{a.water_liters} L</td>
                  <td className="px-4 py-3">{a.waste_segregated ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 font-medium">{a.carbon_score}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {reward ? `${reward.points} (${reward.status})` : '—'}
                  </td>
                </tr>
              );
            })}
            {!activities.length && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No activities logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
