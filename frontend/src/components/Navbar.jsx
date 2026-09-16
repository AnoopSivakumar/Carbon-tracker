import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { user: '/dashboard', employee: '/verify', admin: '/admin' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? roleHome[user.role] : '/'} className="font-bold text-lg tracking-tight">
          🌱 Carbon & Green Rewards Tracker
        </Link>
        {user && (
          <>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/profile" className="flex items-center gap-2 hover:text-green-100">
              {user.avatar_url ? <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-green-300" /> : <span className="h-8 w-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">{user.name?.charAt(0).toUpperCase()}</span>}
              <span className="hidden sm:inline">{user.name} <span className="opacity-75">({user.role})</span></span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-md transition"
            >
              Logout
            </button>
          </div>
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/60 hover:bg-green-800 transition"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className={`block h-0.5 w-5 bg-white transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </span>
          </button>
          </>
        )}
      </div>
      {user && menuOpen && (
        <div className="sm:hidden border-t border-green-600/70 bg-green-800 px-4 pb-4 pt-2 text-sm">
          <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 border-b border-green-700 py-3">
            {user.avatar_url ? <img src={user.avatar_url} alt="Profile" className="h-9 w-9 rounded-full object-cover border border-green-300" /> : <span className="h-9 w-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">{user.name?.charAt(0).toUpperCase()}</span>}
            <span>{user.name} <span className="opacity-75">({user.role})</span></span>
          </Link>
          <button onClick={handleLogout} className="mt-3 w-full rounded-md bg-green-900 px-3 py-2 text-left hover:bg-green-950 transition">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
