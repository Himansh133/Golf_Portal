'use client';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const data = await fetch('/api/admin/users').then(r => r.json());
    setUsers(data);
    setLoading(false);
  }

  async function saveUser(user) {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    setEditing(null);
    setMsg('User updated!');
    loadUsers();
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{users.length} total users</p>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={editing.full_name || ''} onChange={e => setEditing({...editing, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={editing.role} onChange={e => setEditing({...editing, role: e.target.value})}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subscription Status</label>
              <select className="form-select" value={editing.subscription_status} onChange={e => setEditing({...editing, subscription_status: e.target.value})}>
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => saveUser(editing)}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Subscription</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name || '-'}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-success'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.subscription_status === 'active' ? 'badge-success' : 'badge-warning'}`}>{u.subscription_status}</span></td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => setEditing({...u})}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
