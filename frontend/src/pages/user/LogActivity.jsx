import React, { useState } from 'react';
import api from '../../api/api';

const commuteOptions = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Motorbike' },
  { value: 'bus', label: 'Bus' },
  { value: 'train', label: 'Train/Metro' },
  { value: 'cycle', label: 'Bicycle' },
  { value: 'walk', label: 'Walking' },
  { value: 'wfh', label: 'Work from home' }
];

export default function LogActivity() {
  const [form, setForm] = useState({
    activity_date: new Date().toISOString().slice(0, 10),
    commute_mode: 'bus',
    commute_distance_km: '',
    electricity_kwh: '',
    water_liters: '',
    waste_segregated: false,
    notes: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/activities', form);
      setResult(data.activity);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log activity.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Log Today's Green Activity</h1>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-3 mb-4">
          Saved! Estimated carbon footprint for the day: <strong>{result.carbon_score} kg CO2e</strong>.
          Status: <strong>{result.status}</strong> (awaiting employee verification).
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.activity_date} onChange={(e) => update('activity_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commute mode</label>
            <select value={form.commute_mode} onChange={(e) => update('commute_mode', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              {commuteOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commute distance (km)</label>
            <input type="number" min="0" step="0.1" value={form.commute_distance_km}
              onChange={(e) => update('commute_distance_km', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Electricity used (kWh)</label>
            <input type="number" min="0" step="0.1" value={form.electricity_kwh}
              onChange={(e) => update('electricity_kwh', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water usage (liters)</label>
            <input type="number" min="0" step="1" value={form.water_liters}
              onChange={(e) => update('water_liters', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="waste" type="checkbox" checked={form.waste_segregated}
              onChange={(e) => update('waste_segregated', e.target.checked)}
              className="h-4 w-4 text-green-600 rounded" />
            <label htmlFor="waste" className="text-sm text-gray-700">I segregated waste today</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <button type="submit" disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg transition">
          {loading ? 'Saving…' : 'Log Activity'}
        </button>
      </form>
    </div>
  );
}
