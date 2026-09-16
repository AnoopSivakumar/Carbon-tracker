import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function EmployeeDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});

  async function load() {
    setLoading(true);
    const { data } = await api.get('/activities/pending');
    setPending(data.activities);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(activityId, decision) {
    setBusyId(activityId);
    try {
      await api.post(`/verifications/${activityId}`, {
        decision,
        remarks: remarksMap[activityId] || ''
      });
      setPending((p) => p.filter((a) => a.id !== activityId));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-gray-500">Loading pending activities…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Activity Verification Queue</h1>
      <p className="text-gray-500 text-sm mb-4">Review submitted activities before rewards are credited.</p>

      <div className="space-y-4">
        {pending.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800">{a.user_name} <span className="text-gray-400 text-sm">({a.user_email})</span></p>
                <p className="text-sm text-gray-500">{a.activity_date}</p>
              </div>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                {a.carbon_score} kg CO2e
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm text-gray-600">
              <div>Commute: <strong className="capitalize">{a.commute_mode}</strong> ({a.commute_distance_km} km)</div>
              <div>Electricity: <strong>{a.electricity_kwh} kWh</strong></div>
              <div>Water: <strong>{a.water_liters} L</strong></div>
              <div>Waste segregated: <strong>{a.waste_segregated ? 'Yes' : 'No'}</strong></div>
            </div>
            {a.notes && <p className="text-sm text-gray-500 mt-2 italic">"{a.notes}"</p>}

            <textarea
              placeholder="Optional remarks…"
              value={remarksMap[a.id] || ''}
              onChange={(e) => setRemarksMap((m) => ({ ...m, [a.id]: e.target.value }))}
              className="w-full mt-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
            />

            <div className="flex gap-2 mt-3">
              <button disabled={busyId === a.id} onClick={() => decide(a.id, 'verified')}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                Verify
              </button>
              <button disabled={busyId === a.id} onClick={() => decide(a.id, 'rejected')}
                className="bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-700 text-sm font-medium px-4 py-2 rounded-lg transition">
                Reject
              </button>
            </div>
          </div>
        ))}
        {!pending.length && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            No pending activities to review. 🎉
          </div>
        )}
      </div>
    </div>
  );
}
