'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/solver', label: 'Solver' },
  { href: '/topics', label: 'Topics' },
  { href: '/practice', label: 'Practice' },
  { href: '/analytics', label: 'Analytics' },
];

export default function Nav({ user, onLogin, onLogout }) {
  const path = usePathname();

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'rgba(10,8,18,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white' }}>∑</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Math<span style={{ color: 'var(--purple-light)' }}>AI</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ padding: '5px 12px', borderRadius: 8, textDecoration: 'none', color: path === l.href ? 'var(--purple-light)' : 'var(--text-muted)', fontWeight: path === l.href ? 600 : 400, fontSize: 14, transition: 'color 0.2s' }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '5px 13px', fontSize: 13, color: 'var(--gold)' }}>
            ⚡ {(user.coins || 0).toLocaleString()}
          </div>
        )}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white' }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => onLogin('login')}>Log In</button>
            <button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => onLogin('signup')}>Get Started</button>
          </div>
        )}
      </div>
    </nav >
  );
}
