import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { user: '/dashboard', employee: '/verify', admin: '/admin' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-atmosphere" aria-hidden="true" />
      <div className="auth-card">
        <Link to="/" className="auth-brand"><span className="auth-brand-dot" /> carbon<span>circle</span></Link>
        <p className="auth-kicker">Your daily impact, made visible</p>
        <h1 className="text-3xl font-semibold text-white mb-2">Welcome back</h1>
        <p className="text-white/70 text-sm mb-6">Sign in to your Green Rewards Tracker account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="auth-submit"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-white/65 mt-6 text-center">
          New here?{' '}
          <Link to="/register" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
