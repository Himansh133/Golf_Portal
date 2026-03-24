'use client';
import { useState, useEffect } from 'react';

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/charities?search=${search}`)
      .then(r => r.json())
      .then(data => { setCharities(data); setLoading(false); })
      .catch(() => { setCharities([]); setLoading(false); });
  }, [search]);

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="section-title fade-in">Our Charity Partners</h1>
          <p className="section-subtitle fade-in">Every subscription makes a real impact</p>
          <input
            className="form-input fade-in"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400, margin: '0 auto' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
        ) : charities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <p>No charities listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid-3">
            {charities.map(c => (
              <div key={c.id} className="card fade-in">
                {c.image_url && <img src={c.image_url} alt={c.name} className="charity-card-img" />}
                {!c.image_url && <div className="charity-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎗️</div>}
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{c.name}</h3>
                {c.featured && <span className="badge badge-accent" style={{ marginBottom: 8 }}>Featured</span>}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.description || 'Supporting great causes through golf.'}</p>
                {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', marginTop: 12, display: 'inline-block' }}>Visit Website →</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
