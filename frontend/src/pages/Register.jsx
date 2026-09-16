import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-atmosphere" aria-hidden="true" />
      <div className="auth-card auth-card-tall">
        <Link to="/" className="auth-brand"><span className="auth-brand-dot" /> carbon<span>circle</span></Link>
        <p className="auth-kicker">A lighter future starts here</p>
        <h1 className="text-3xl font-semibold text-white mb-2">Create your account</h1>
        <p className="text-white/70 text-sm mb-6">Join the community and start tracking your green habits.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)}
              className="auth-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
              className="auth-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)}
              className="auth-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)}
              className="auth-input" />
          </div>
          <button type="submit" disabled={loading}
            className="auth-submit">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-white/65 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
