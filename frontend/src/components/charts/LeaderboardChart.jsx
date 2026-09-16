import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LeaderboardChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
        <Tooltip />
        <Bar dataKey="total_points" fill="#22c55e" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
