'use client';
import { useState, useEffect } from 'react';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadWinners(); }, []);

  async function loadWinners() {
    const data = await fetch('/api/winners').then(r => r.json());
    setWinners(data);
    setLoading(false);
  }

  async function updateWinner(id, updates) {
    await fetch('/api/winners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    setMsg('Winner updated!');
    loadWinners();
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Winners Management</h1>
        <p className="page-subtitle">Verify submissions and manage payouts</p>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {winners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-muted)' }}>No winners yet</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Draw Date</th><th>Match</th><th>Prize</th><th>Proof</th><th>Verification</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {winners.map(w => (
                <tr key={w.id}>
                  <td>{w.profiles?.full_name || w.profiles?.email || '-'}</td>
                  <td>{w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : '-'}</td>
                  <td><span className="badge badge-accent">{w.match_type}</span></td>
                  <td>£{parseFloat(w.prize_amount).toFixed(2)}</td>
                  <td>{w.proof_url ? <a href={w.proof_url} target="_blank" rel="noopener">View</a> : <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                  <td><span className={`badge ${w.verification_status === 'approved' ? 'badge-success' : w.verification_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{w.verification_status}</span></td>
                  <td><span className={`badge ${w.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{w.payment_status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {w.verification_status === 'pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => updateWinner(w.id, { verification_status: 'approved' })}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateWinner(w.id, { verification_status: 'rejected' })}>Reject</button>
                        </>
                      )}
                      {w.verification_status === 'approved' && w.payment_status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateWinner(w.id, { payment_status: 'paid' })}>Mark Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
