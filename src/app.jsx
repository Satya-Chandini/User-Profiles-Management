import React, { useEffect, useState } from 'react';

// useLocalStorage hook
function useLocalStorage(key, initialValue = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : initialValue;
        if (mounted) {
          setData(parsed);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load data from localStorage');
          setData(initialValue);
          setLoading(false);
        }
      }
    }, 450);
    return () => { mounted = false; };
  }, [key]);

  const save = (newData) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
      return { ok: true };
    } catch (err) {
      setError(err.message || 'Save failed');
      return { ok: false, error: err.message || 'Save failed' };
    }
  };

  return { data, setData, save, loading, error, setError };
}

// generate unique id
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Toast
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className={`px-4 py-2 rounded shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
        {toast.message}
      </div>
    </div>
  );
}

// ConfirmModal
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

// UserForm
function UserForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ name: '', email: '', role: '', avatar: '', ...initial });
  const [errors, setErrors] = useState({});

  useEffect(() => setForm({ name: '', email: '', role: '', avatar: '', ...initial }), [initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 px-3 py-2 border rounded w-full"/>
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 px-3 py-2 border rounded w-full"/>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="mt-1 px-3 py-2 border rounded w-full" placeholder="e.g. Frontend Developer"/>
      </div>

      <div>
        <label className="block text-sm font-medium">Avatar URL (optional)</label>
        <input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} className="mt-1 px-3 py-2 border rounded w-full" placeholder="https://..."/>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

// UserCard
function UserCard({ profile, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
          ) : (
            <span className="text-xl text-gray-500">{profile.name ? profile.name[0].toUpperCase() : '?'}</span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{profile.name}</h4>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-xs text-gray-400 mt-1">{profile.role}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={() => onEdit(profile)} className="px-3 py-1 border rounded text-sm">Edit</button>
        <button onClick={() => onDelete(profile)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Delete</button>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const { data: profiles, setData, save, loading, error, setError } = useLocalStorage('user_profiles_v1', []);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, target: null });
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (profile) => { setEditing(profile); setShowForm(true); };

  const handleSave = async (form) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const current = Array.isArray(profiles) ? profiles : [];

    if (editing) {
      const updated = current.map(p => p.id === editing.id ? { ...p, ...form } : p);
      const res = save(updated);
      if (!res.ok) setToast({ type: 'error', message: 'Failed to save changes' });
      else setToast({ type: 'success', message: 'Profile updated' });
    } else {
      const newProfile = { id: uid(), ...form, createdAt: new Date().toISOString() };
      const updated = [newProfile, ...current];
      const res = save(updated);
      if (!res.ok) setToast({ type: 'error', message: 'Failed to create profile' });
      else setToast({ type: 'success', message: 'Profile created' });
    }

    setSaving(false);
    setShowForm(false);
  };

  const requestDelete = (profile) => setConfirm({ open: true, target: profile });
  const cancelDelete = () => setConfirm({ open: false, target: null });

  const confirmDelete = async () => {
    const target = confirm.target;
    if (!target) return cancelDelete();
    await new Promise(r => setTimeout(r, 350));
    const current = Array.isArray(profiles) ? profiles : [];
    const remaining = current.filter(p => p.id !== target.id);
    const res = save(remaining);
    if (!res.ok) setToast({ type: 'error', message: 'Failed to delete profile' });
    else setToast({ type: 'success', message: 'Profile deleted' });
    cancelDelete();
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">User Profiles Management</h1>
          <div className="flex gap-3">
            <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded">Add New User</button>
            <button onClick={() => { localStorage.removeItem('user_profiles_v1'); setData([]); setToast({ type: 'success', message: 'All data cleared' }); }} className="px-3 py-2 border rounded">Clear All</button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-red-700">{error}</p></div>
              <div><button onClick={clearError} className="text-sm px-2 py-1 border rounded">Dismiss</button></div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading profiles...</span>
          </div>
        ) : (
          <>
            {(!profiles || profiles.length === 0) ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No profiles found.</p>
                <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded">Create your first profile</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(p => (<UserCard key={p.id} profile={p} onEdit={openEdit} onDelete={requestDelete} />))}
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Profile' : 'Add New Profile'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500">Close</button>
              </div>
              <UserForm initial={editing || {}} onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
            </div>
          </div>
        )}

        <ConfirmModal open={confirm.open} title="Delete profile" message={`Are you sure you want to delete ${confirm.target?.name || 'this profile'}?`} onConfirm={confirmDelete} onCancel={cancelDelete} />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
