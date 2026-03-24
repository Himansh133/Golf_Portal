'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supabase] = useState(() => createBrowserSupabaseClient());

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="nav-logo">Golf<span>Charity</span></Link>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><Link href="/charities">Charities</Link></li>
          {user ? (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              {profile?.role === 'admin' && <li><Link href="/admin">Admin</Link></li>}
              <li><button onClick={handleLogout} className="btn btn-secondary btn-sm">Log Out</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login">Log In</Link></li>
              <li><Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
