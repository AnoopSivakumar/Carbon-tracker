import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CarbonTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="activity_date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft', fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="total_carbon_kg" stroke="#16a34a" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
