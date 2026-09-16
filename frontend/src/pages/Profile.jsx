import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const maxFileSize = 2 * 1024 * 1024;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAvatar(user?.avatar_url || null);
  }, [user]);

  function choosePicture(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setSaved(false);
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    if (file.size > maxFileSize) {
      setError('Profile pictures must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { data } = await api.put(`/users/${user.id}`, { name, phone, avatar_url: avatar });
      updateUser({ ...user, ...data.user });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Your profile</h1>
      <p className="text-sm text-gray-500 mb-5">Personalize your account with a profile picture.</p>
      <form onSubmit={saveProfile} className="bg-white rounded-2xl shadow p-6 space-y-5">
        <div className="flex items-center gap-5">
          {avatar ? <img src={avatar} alt="Profile preview" className="h-24 w-24 rounded-full object-cover border-4 border-green-100" /> : <div className="h-24 w-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold">{name.charAt(0).toUpperCase() || '?'}</div>}
          <div><label htmlFor="profile-picture" className="inline-block cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg">Choose picture</label><input id="profile-picture" type="file" accept="image/*" onChange={choosePicture} className="sr-only" /><p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP, or GIF · max 2 MB</p>{avatar && <button type="button" onClick={() => setAvatar(null)} className="text-xs text-red-600 mt-2">Remove picture</button>}</div>
        </div>
        {error && <p className="bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</p>}
        {saved && <p className="bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm">Profile updated.</p>}
        <div><label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label><input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
        <div><label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label><input id="profile-email" value={user.email} disabled className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2" /></div>
        <div><label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
        <button disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </div>
  );
}