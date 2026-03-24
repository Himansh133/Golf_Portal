'use client';
import { useState, useEffect } from 'react';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', website: '', featured: false });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadCharities(); }, []);

  async function loadCharities() {
    const data = await fetch('/api/charities').then(r => r.json());
    setCharities(data);
    setLoading(false);
  }

  async function saveCharity(e) {
    e.preventDefault();
    if (editing) {
      await fetch('/api/charities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      setMsg('Charity updated!');
    } else {
      await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setMsg('Charity added!');
    }
    setEditing(null); setCreating(false);
    setForm({ name: '', description: '', image_url: '', website: '', featured: false });
    loadCharities();
  }

  async function deleteCharity(id) {
    if (!confirm('Delete this charity?')) return;
    await fetch('/api/charities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMsg('Charity deleted!');
    loadCharities();
  }

  function startEdit(c) {
    setEditing(c);
    setCreating(false);
    setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', website: c.website || '', featured: c.featured });
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">Charities</h1><p className="page-subtitle">{charities.length} charities listed</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => { setCreating(true); setEditing(null); setForm({ name: '', description: '', image_url: '', website: '', featured: false }); }}>Add Charity</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {(creating || editing) && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{editing ? 'Edit Charity' : 'Add Charity'}</h3>
          <form onSubmit={saveCharity}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={form.website} onChange={e => setForm({...form, website: e.target.value})} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
              <label className="form-label" style={{ marginBottom: 0 }}>Featured Charity</label>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Featured</th><th>Website</th><th>Actions</th></tr></thead>
          <tbody>
            {charities.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.featured ? <span className="badge badge-accent">Featured</span> : '-'}</td>
                <td>{c.website ? <a href={c.website} target="_blank" rel="noopener">Visit</a> : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCharity(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
