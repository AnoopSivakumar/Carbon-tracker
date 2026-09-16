import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import CarbonTrendChart from '../../components/charts/CarbonTrendChart';

export default function Reports() {
  const [trend, setTrend] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [trendRes, monthlyRes] = await Promise.all([
        api.get('/reports/carbon-footprint'),
        api.get('/reports/monthly-impact')
      ]);
      setTrend(trendRes.data.trend.map((t) => ({ ...t, total_carbon_kg: Number(t.total_carbon_kg) })));
      setMonthly(monthlyRes.data.carbon_by_month);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-gray-500">Loading reports…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Community Carbon Reports</h1>

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Community Carbon Footprint — Last 30 Days</h2>
        {trend.length ? <CarbonTrendChart data={trend} /> : <p className="text-gray-400 text-sm">No verified activity in this period.</p>}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <h2 className="font-semibold text-gray-700 p-5 pb-0">Monthly Community Impact Report</h2>
        <table className="w-full text-sm mt-3">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Total CO2 (kg)</th>
              <th className="px-4 py-3">Active Users</th>
              <th className="px-4 py-3">Verified Activities</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month} className="border-t border-gray-100">
                <td className="px-4 py-3">{m.month}</td>
                <td className="px-4 py-3 font-medium">{m.total_carbon_kg}</td>
                <td className="px-4 py-3">{m.active_users}</td>
                <td className="px-4 py-3">{m.verified_activities}</td>
              </tr>
            ))}
            {!monthly.length && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No monthly data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
