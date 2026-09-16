import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Profile from './pages/Profile';

import UserDashboard from './pages/user/UserDashboard';
import LogActivity from './pages/user/LogActivity';
import ActivityHistory from './pages/user/ActivityHistory';
import Rewards from './pages/user/Rewards';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCampaigns from './pages/admin/ManageCampaigns';
import EmissionFactors from './pages/admin/EmissionFactors';
import Reports from './pages/admin/Reports';
import UserManagement from './pages/admin/UserManagement';

function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const userTabs = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/log-activity', label: 'Log Activity' },
    { to: '/history', label: 'History' },
    { to: '/rewards', label: 'Rewards & Leaderboard' }
  ];
  const adminTabs = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/campaigns', label: 'Campaigns' },
    { to: '/admin/emission-factors', label: 'Emission Factors' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/users', label: 'User Management' }
  ];

  const tabs = user?.role === 'user' ? userTabs : user?.role === 'admin' ? adminTabs : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {tabs.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <Link key={t.to} to={t.to}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  location.pathname === t.to ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700'
                }`}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'user') return <Navigate to="/dashboard" replace />;
  if (user.role === 'employee') return <Navigate to="/verify" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={
        <ProtectedRoute roles={['user', 'employee', 'admin']}><Layout><Profile /></Layout></ProtectedRoute>
      } />
      <Route path="/" element={<LandingRoute />} />

      <Route path="/dashboard" element={
        <ProtectedRoute roles={['user']}><Layout><UserDashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/log-activity" element={
        <ProtectedRoute roles={['user']}><Layout><LogActivity /></Layout></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute roles={['user']}><Layout><ActivityHistory /></Layout></ProtectedRoute>
      } />
      <Route path="/rewards" element={
        <ProtectedRoute roles={['user']}><Layout><Rewards /></Layout></ProtectedRoute>
      } />

      <Route path="/verify" element={
        <ProtectedRoute roles={['employee']}><Layout><EmployeeDashboard /></Layout></ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/campaigns" element={
        <ProtectedRoute roles={['admin']}><Layout><ManageCampaigns /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/emission-factors" element={
        <ProtectedRoute roles={['admin']}><Layout><EmissionFactors /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}><Layout><Reports /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}><Layout><UserManagement /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LandingRoute() {
  const { user } = useAuth();
  return user ? <RoleRedirect /> : <Landing />;
}
