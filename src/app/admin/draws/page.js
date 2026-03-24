'use client';
import { useState, useEffect } from 'react';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ draw_date: '', draw_type: 'random' });

  useEffect(() => { loadDraws(); }, []);

  async function loadDraws() {
    const data = await fetch('/api/draws').then(r => r.json());
    setDraws(data);
    setLoading(false);
  }

  async function createDraw(e) {
    e.preventDefault();
    await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    });
    setForm({ draw_date: '', draw_type: 'random' });
    setMsg('Draw created!');
    loadDraws();
  }

  async function runAction(drawId, action, drawType) {
    await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, draw_id: drawId, draw_type: drawType }),
    });
    setMsg(action === 'publish' ? 'Draw published!' : 'Simulation complete!');
    loadDraws();
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Draw Management</h1>
        <p className="page-subtitle">Configure, simulate, and publish monthly draws</p>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Create New Draw</h3>
        <form onSubmit={createDraw} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label className="form-label">Draw Date</label>
            <input className="form-input" type="date" required value={form.draw_date} onChange={e => setForm({...form, draw_date: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label className="form-label">Draw Type</label>
            <select className="form-select" value={form.draw_type} onChange={e => setForm({...form, draw_type: e.target.value})}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (Score-weighted)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Create Draw</button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Winning Numbers</th><th>Prize Pool</th><th>Actions</th></tr></thead>
          <tbody>
            {draws.map(d => (
              <tr key={d.id}>
                <td>{new Date(d.draw_date).toLocaleDateString()}</td>
                <td><span className="badge badge-accent">{d.draw_type}</span></td>
                <td><span className={`badge ${d.status === 'published' ? 'badge-success' : d.status === 'simulated' ? 'badge-warning' : 'badge-danger'}`}>{d.status}</span></td>
                <td>{d.winning_numbers?.length > 0 ? d.winning_numbers.join(', ') : '-'}</td>
                <td>£{parseFloat(d.prize_pool_total || 0).toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {d.status !== 'published' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => runAction(d.id, 'simulate', d.draw_type)}>Simulate</button>
                    )}
                    {d.status !== 'published' && (
                      <button className="btn btn-primary btn-sm" onClick={() => runAction(d.id, 'publish', d.draw_type)}>Publish</button>
                    )}
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
