import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const emptyForm = { name: '', email: '', password: '', role: 'user', phone: '' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadUsers(search = query) {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: search ? { q: search } : {} });
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(''); }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function addUser(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', form);
      setForm(emptyForm);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add user.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    await api.put(`/users/${user.id}`, { is_active: !user.is_active });
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, is_active: !item.is_active } : item));
  }

  async function changeRole(user, role) {
    await api.put(`/users/${user.id}`, { role });
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role } : item));
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await api.delete(`/users/${user.id}`);
    setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">User Management</h1><p className="text-sm text-gray-500 mt-1">Create, search, update, deactivate, and remove platform accounts.</p></div>

      <section className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Add user</h2>
        {error && <p className="bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">{error}</p>}
        <form onSubmit={addUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input required placeholder="Full name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <select value={form.role} onChange={(e) => updateForm('role', e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="user">User</option><option value="employee">Employee</option><option value="admin">Admin</option></select>
          <button disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-3 py-2 text-sm font-medium">{saving ? 'Adding…' : 'Add user'}</button>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Accounts</h2>
          <form onSubmit={(event) => { event.preventDefault(); loadUsers(); }} className="flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="border rounded-lg px-3 py-2 text-sm" /><button className="border rounded-lg px-3 py-2 text-sm">Search</button></form>
        </div>
        {loading ? <p className="p-5 text-gray-500 text-sm">Loading users…</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-gray-100"><td className="px-5 py-3 font-medium">{user.name}</td><td className="px-5 py-3">{user.email}</td><td className="px-5 py-3"><select value={user.role} onChange={(e) => changeRole(user, e.target.value)} className="border rounded px-2 py-1 text-xs"><option value="user">User</option><option value="employee">Employee</option><option value="admin">Admin</option></select></td><td className="px-5 py-3">{user.is_active ? 'Active' : 'Inactive'}</td><td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => toggleActive(user)} className="text-xs text-green-700">{user.is_active ? 'Deactivate' : 'Activate'}</button><button onClick={() => removeUser(user)} className="text-xs text-red-700">Delete</button></div></td></tr>)}{!users.length && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No users found.</td></tr>}</tbody></table></div>}
      </section>
    </div>
  );
}