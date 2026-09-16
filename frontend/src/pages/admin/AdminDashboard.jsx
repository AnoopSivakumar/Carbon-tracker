import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import LeaderboardChart from '../../components/charts/LeaderboardChart';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [sumRes, lbRes, rewardsRes] = await Promise.all([
      api.get('/reports/summary'),
      api.get('/rewards/leaderboard'),
      api.get('/rewards/pending')
    ]);
    setSummary(sumRes.data);
    setLeaderboard(lbRes.data.leaderboard.map((r) => ({ ...r, total_points: Number(r.total_points) })));
    setPendingRewards(rewardsRes.data.rewards);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decideReward(id, decision) {
    setBusyId(id);
    try {
      await api.put(`/rewards/${id}/decision`, { decision });
      setPendingRewards((p) => p.filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-gray-500">Loading admin dashboard…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-2 text-sm">
          <Link to="/admin/campaigns" className="bg-white shadow px-3 py-1.5 rounded-lg hover:bg-gray-50">Campaigns</Link>
          <Link to="/admin/emission-factors" className="bg-white shadow px-3 py-1.5 rounded-lg hover:bg-gray-50">Emission Factors</Link>
          <Link to="/admin/reports" className="bg-white shadow px-3 py-1.5 rounded-lg hover:bg-gray-50">Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={summary.total_users} />
        <StatCard label="Pending Verifications" value={summary.pending_activity_reviews} />
        <StatCard label="Pending Reward Approvals" value={summary.pending_reward_approvals} />
        <StatCard label="Verified CO2 (kg)" value={summary.total_verified_carbon_kg} />
        <StatCard label="Active Campaigns" value={summary.active_campaigns} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Leaderboard</h2>
          {leaderboard.length ? <LeaderboardChart data={leaderboard} /> : <p className="text-gray-400 text-sm">No approved rewards yet.</p>}
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Reward Approvals</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pendingRewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.user_name}</p>
                  <p className="text-xs text-gray-500">{r.activity_date} · {r.points} pts</p>
                </div>
                <div className="flex gap-1">
                  <button disabled={busyId === r.id} onClick={() => decideReward(r.id, 'approved')}
                    className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-2.5 py-1 rounded-md">Approve</button>
                  <button disabled={busyId === r.id} onClick={() => decideReward(r.id, 'rejected')}
                    className="text-xs bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-700 px-2.5 py-1 rounded-md">Reject</button>
                </div>
              </div>
            ))}
            {!pendingRewards.length && <p className="text-gray-400 text-sm">No pending reward approvals.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-2xl shadow p-4 ${accent ? 'bg-green-600 text-white' : 'bg-white text-gray-800'}`}>
      <p className={`text-xs ${accent ? 'text-green-100' : 'text-gray-500'}`}>{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
