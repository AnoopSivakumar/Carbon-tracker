import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const empty = { category: 'commute', key: '', label: '', factor_value: '', unit: 'km' };
const categories = ['commute', 'electricity', 'water', 'waste'];

export default function EmissionFactors() {
  const [factors, setFactors] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/emission-factors');
    setFactors(data.emission_factors);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/emission-factors', form);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add factor.');
    } finally {
      setSaving(false);
    }
  }

  async function updateValue(f, newValue) {
    await api.put(`/emission-factors/${f.id}`, { factor_value: newValue });
    load();
  }

  async function toggleActive(f) {
    await api.put(`/emission-factors/${f.id}`, { is_active: !f.is_active });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this emission factor?')) return;
    await api.delete(`/emission-factors/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Emission Factor Rules</h1>
      <p className="text-gray-500 text-sm -mt-4">
        These configurable factors (kg CO2e per unit) drive every user's computed carbon score.
      </p>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={form.category} onChange={(e) => update('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Key</label>
          <input required placeholder="e.g. car" value={form.key} onChange={(e) => update('key', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Label</label>
          <input required placeholder="Display label" value={form.label} onChange={(e) => update('label', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Factor (kg CO2e/unit)</label>
          <input required type="number" step="0.0001" value={form.factor_value} onChange={(e) => update('factor_value', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit</label>
          <input required placeholder="km / kwh / liter / flat" value={form.unit} onChange={(e) => update('unit', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <button type="submit" disabled={saving}
          className="sm:col-span-5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition">
          {saving ? 'Adding…' : 'Add Emission Factor'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Factor</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f) => (
              <tr key={f.id} className="border-t border-gray-100">
                <td className="px-4 py-3 capitalize">{f.category}</td>
                <td className="px-4 py-3">{f.key}</td>
                <td className="px-4 py-3">{f.label}</td>
                <td className="px-4 py-3">
                  <input type="number" step="0.0001" defaultValue={f.factor_value}
                    onBlur={(e) => e.target.value != f.factor_value && updateValue(f, e.target.value)}
                    className="w-24 border border-gray-200 rounded-md px-2 py-1" />
                </td>
                <td className="px-4 py-3">{f.unit}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {f.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => toggleActive(f)} className="text-xs text-green-700 hover:underline">
                    {f.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => remove(f.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && !factors.length && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No emission factors configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
