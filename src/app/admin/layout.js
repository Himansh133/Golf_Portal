'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const links = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/users', label: '👥 Users' },
    { href: '/admin/draws', label: '🎯 Draws' },
    { href: '/admin/charities', label: '🎗️ Charities' },
    { href: '/admin/winners', label: '🏆 Winners' },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Admin Panel</h3>
        <ul className="sidebar-nav">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="main-content">{children}</div>
    </div>
  );
}
