'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ score: '', played_date: '' });
  const [msg, setMsg] = useState('');
  const [supabase] = useState(() => createBrowserSupabaseClient());

  useEffect(() => { loadData(); }, [supabase]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const [profileRes, charitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      fetch('/api/charities').then(r => r.json()).catch(() => []),
    ]);
    setProfile(profileRes.data);
    setCharities(charitiesRes);

    const [scoresRes, winnersRes, drawsRes] = await Promise.all([
      fetch(`/api/scores?user_id=${user.id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/winners?user_id=${user.id}`).then(r => r.json()).catch(() => []),
      fetch('/api/draws').then(r => r.json()).catch(() => []),
    ]);
    setScores(scoresRes);
    setWinners(winnersRes || []);
    setDraws(drawsRes || []);
    setLoading(false);
  }

  async function addScore(e) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, score: parseInt(scoreForm.score), played_date: scoreForm.played_date }),
    });
    const data = await res.json();
    if (data.error) return setMsg(data.error);
    setScoreForm({ score: '', played_date: '' });
    setMsg('Score added!');
    const updated = await fetch(`/api/scores?user_id=${user.id}`).then(r => r.json());
    setScores(updated);
  }

  async function updateCharity(charityId) {
    await supabase.from('profiles').update({ selected_charity_id: charityId }).eq('id', user.id);
    setProfile({ ...profile, selected_charity_id: charityId });
    setMsg('Charity updated!');
  }

  function updateCharityPct(pct) {
    const val = parseInt(pct);
    setProfile({ ...profile, charity_percentage: isNaN(val) ? '' : val });
  }

  async function saveCharityPct() {
    const val = Math.max(10, Math.min(100, parseInt(profile?.charity_percentage) || 10));
    await supabase.from('profiles').update({ charity_percentage: val }).eq('id', user.id);
    setProfile({ ...profile, charity_percentage: val });
    setMsg('Charity percentage saved!');
    setTimeout(() => setMsg(''), 3000);
  }

  async function subscribe(plan) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function uploadProof(winnerId, e) {
    const file = e.target.files[0];
    if (!file) return;
    const path = `proofs/${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('proofs').upload(path, file);
    if (error) return setMsg('Upload failed');
    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path);
    await fetch('/api/winners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: winnerId, proof_url: publicUrl }),
    });
    setMsg('Proof uploaded!');
    loadData();
  }

  if (loading) return <div className="dashboard"><div className="main-content" style={{ marginLeft: 0 }}><div style={{ textAlign: 'center', padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div></div></div>;

  const selectedCharity = charities.find?.(c => c.id === profile?.selected_charity_id);
  const totalWon = winners.reduce((s, w) => s + parseFloat(w.prize_amount || 0), 0);

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome, {profile?.full_name || 'Golfer'} 👋</h1>
          <p className="page-subtitle">Your GolfCharity dashboard</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Subscription Status */}
        <div className="card card-glow fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Subscription</h3>
              <span className={`badge ${profile?.subscription_status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {profile?.subscription_status || 'Inactive'}
              </span>
              {profile?.subscription_plan && <span className="badge badge-accent" style={{ marginLeft: 8 }}>{profile.subscription_plan}</span>}
              {profile?.subscription_expires_at && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Renews: {new Date(profile.subscription_expires_at).toLocaleDateString()}</p>}
            </div>
            {profile?.subscription_status !== 'active' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => subscribe('monthly')} className="btn btn-primary btn-sm">Monthly — £9.99</button>
                <button onClick={() => subscribe('yearly')} className="btn btn-secondary btn-sm">Yearly — £99.99</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in fade-in-delay-1" style={{ marginBottom: 32 }}>
          <div className="card stat-card"><div className="stat-value">{scores.length}</div><div className="stat-label">Scores Entered</div></div>
          <div className="card stat-card"><div className="stat-value">{winners.length}</div><div className="stat-label">Wins</div></div>
          <div className="card stat-card"><div className="stat-value">£{totalWon.toFixed(2)}</div><div className="stat-label">Total Won</div></div>
          <div className="card stat-card"><div className="stat-value">{profile?.charity_percentage || 10}%</div><div className="stat-label">Charity Contribution</div></div>
        </div>

        <div className="grid-2" style={{ marginBottom: 32 }}>
          {/* Score Entry */}
          <div className="card fade-in fade-in-delay-2">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Enter Score</h3>
            <form onSubmit={addScore}>
              <div className="form-group">
                <label className="form-label">Stableford Score (1-45)</label>
                <input className="form-input" type="number" min="1" max="45" required value={scoreForm.score} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Date Played</label>
                <input className="form-input" type="date" required value={scoreForm.played_date} onChange={e => setScoreForm({ ...scoreForm, played_date: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Add Score</button>
            </form>

            <h4 style={{ fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Your Latest Scores</h4>
            {scores.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scores yet</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Score</th><th>Date</th></tr></thead>
                  <tbody>
                    {scores.map(s => (
                      <tr key={s.id}><td><strong>{s.score}</strong></td><td>{new Date(s.played_date).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Charity Selection */}
          <div className="card fade-in fade-in-delay-3">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Your Charity</h3>
            {selectedCharity ? (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                <strong>{selectedCharity.name}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>{selectedCharity.description}</p>
              </div>
            ) : <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No charity selected</p>}

            <div className="form-group">
              <label className="form-label">Select Charity</label>
              <select className="form-select" value={profile?.selected_charity_id || ''} onChange={e => updateCharity(e.target.value)}>
                <option value="">Choose a charity</option>
                {charities.map?.(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contribution % (min 10%)</label>
              <input className="form-input" type="number" min="10" max="100" value={profile?.charity_percentage ?? 10} onChange={e => updateCharityPct(e.target.value)} onBlur={saveCharityPct} />
            </div>

            <h4 style={{ fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Winnings</h4>
            {winners.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No wins yet — keep playing!</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Draw</th><th>Match</th><th>Prize</th><th>Status</th></tr></thead>
                  <tbody>
                    {winners.map(w => (
                      <tr key={w.id}>
                        <td>{w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : '-'}</td>
                        <td><span className="badge badge-accent">{w.match_type}</span></td>
                        <td>£{parseFloat(w.prize_amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${w.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{w.payment_status}</span>
                          {w.verification_status === 'pending' && !w.proof_url && (
                            <label className="btn btn-secondary btn-sm" style={{ marginLeft: 8, cursor: 'pointer' }}>
                              Upload Proof
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadProof(w.id, e)} />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Draws */}
        <div className="card fade-in" style={{ marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Draws</h3>
          {draws.filter(d => d.status === 'published').length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No draws published yet</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Winning Numbers</th><th>Prize Pool</th></tr></thead>
                <tbody>
                  {draws.filter(d => d.status === 'published').slice(0, 5).map(d => (
                    <tr key={d.id}>
                      <td>{new Date(d.draw_date).toLocaleDateString()}</td>
                      <td>{d.winning_numbers?.join(', ') || '-'}</td>
                      <td>£{parseFloat(d.prize_pool_total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
