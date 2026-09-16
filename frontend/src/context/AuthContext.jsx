import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cct_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cct_token', data.token);
    localStorage.setItem('cct_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('cct_token', data.token);
    localStorage.setItem('cct_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function updateUser(userData) {
    localStorage.setItem('cct_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('cct_token');
    localStorage.removeItem('cct_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
