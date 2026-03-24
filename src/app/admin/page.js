'use client';
import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, active: 0, pool: 0, charities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/draws').then(r => r.json()),
      fetch('/api/charities').then(r => r.json()),
    ]).then(([users, draws, charities]) => {
      const activeUsers = users.filter(u => u.subscription_status === 'active').length;
      const totalPool = draws.reduce((s, d) => s + parseFloat(d.prize_pool_total || 0), 0);
      setStats({ users: users.length, active: activeUsers, pool: totalPool, charities: charities.length });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-subtitle">Platform analytics & quick stats</p>
      </div>
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="card stat-card"><div className="stat-value">{stats.users}</div><div className="stat-label">Total Users</div></div>
        <div className="card stat-card"><div className="stat-value">{stats.active}</div><div className="stat-label">Active Subscribers</div></div>
        <div className="card stat-card"><div className="stat-value">£{stats.pool.toFixed(2)}</div><div className="stat-label">Total Prize Pool</div></div>
        <div className="card stat-card"><div className="stat-value">{stats.charities}</div><div className="stat-label">Charities</div></div>
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Quick Actions</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Use the sidebar to manage users, run draws, manage charities, and verify winners.</p>
      </div>
    </>
  );
}
