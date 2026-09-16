import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const empty = { title: '', description: '', start_date: '', end_date: '', points_multiplier: 1 };

export default function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/campaigns');
    setCampaigns(data.campaigns);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/campaigns', form);
      setForm(empty);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    await api.put(`/campaigns/${c.id}`, { is_active: !c.is_active });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this campaign?')) return;
    await api.delete(`/campaigns/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Reward Campaigns</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required placeholder="Campaign title" value={form.title} onChange={(e) => update('title', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start date</label>
          <input type="date" required value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End date</label>
          <input type="date" required value={form.end_date} onChange={(e) => update('end_date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Points multiplier</label>
          <input type="number" step="0.1" min="0.1" value={form.points_multiplier}
            onChange={(e) => update('points_multiplier', e.target.value)}
            className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" disabled={saving}
          className="sm:col-span-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition">
          {saving ? 'Creating…' : 'Create Campaign'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Multiplier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3">{c.start_date} → {c.end_date}</td>
                <td className="px-4 py-3">x{c.points_multiplier}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => toggleActive(c)} className="text-xs text-green-700 hover:underline">
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => remove(c.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && !campaigns.length && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No campaigns yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
