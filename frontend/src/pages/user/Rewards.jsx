import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rewardRes, leaderboardRes] = await Promise.all([
          api.get('/rewards/mine'),
          api.get('/rewards/leaderboard')
        ]);
        setRewards(rewardRes.data.rewards);
        setLeaderboard(leaderboardRes.data.leaderboard);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-gray-500">Loading rewards…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Rewards & Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">Verified activity earns points after admin approval.</p>
      </div>

      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">My reward history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr><th className="px-5 py-3">Activity date</th><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Points</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr key={reward.id} className="border-t border-gray-100">
                  <td className="px-5 py-3">{reward.activity_date || '—'}</td>
                  <td className="px-5 py-3">{reward.campaign_title || 'Standard reward'}</td>
                  <td className="px-5 py-3 font-semibold">{reward.points}</td>
                  <td className="px-5 py-3 capitalize">{reward.status}</td>
                </tr>
              ))}
              {!rewards.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No rewards yet. Get an activity verified to earn points.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Community leaderboard</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div className="flex items-center gap-3"><span className="w-6 text-gray-400">{index + 1}</span><span className="font-medium text-gray-800">{entry.name}</span></div>
              <span className="font-semibold text-green-700">{entry.total_points} pts</span>
            </div>
          ))}
          {!leaderboard.length && <p className="px-5 py-8 text-center text-gray-400 text-sm">The leaderboard will appear after the first reward is approved.</p>}
        </div>
      </section>
    </div>
  );
}