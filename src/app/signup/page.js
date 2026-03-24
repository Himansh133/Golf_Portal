'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSuccess(true);
  };

  if (success) return (
    <div className="auth-page">
      <div className="auth-card card card-glow">
        <h1>Check Your Email ✉️</h1>
        <p>We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card card card-glow fade-in">
        <h1>Create Account</h1>
        <p>Start playing, winning, and giving back.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
