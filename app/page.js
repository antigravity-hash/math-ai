'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal } from '@/components/shared';
import Link from 'next/link';

export default function HomePage() {
  const { user, login, logout } = useAuth();
  const { toast, showToast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
  const handleAuth = (userData) => {
    login(userData);
    setShowAuth(false);
    showToast(`Welcome, ${userData.name}! 🎉`);
  };

  const features = [
    { icon: '🪜', title: 'Step-by-Step Solver', desc: 'AI breaks every problem into clear numbered steps with full mathematical explanations.', href: '/solver' },
    { icon: '📊', title: 'Interactive Graphing', desc: 'Visualize functions and their derivatives on beautiful interactive SVG graphs.', href: '/solver' },
    { icon: '🏆', title: 'Daily Challenges', desc: 'Fresh AI-generated challenges every day with coin rewards to keep you motivated.', href: '/practice' },
    { icon: '🧠', title: 'Concept Learning', desc: 'Explore math topics from Algebra to Linear Algebra with AI-guided explanations.', href: '/topics' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav user={user} onLogin={openAuth} onLogout={logout} />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="tag" style={{ marginBottom: 22 }}>✦ AI-Powered Mathematics Learning</div>
        <h1 style={{ fontSize: 'clamp(38px,6vw,76px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 22, letterSpacing: '-2px' }}>
          Master Mathematics<br />
          <span style={{ background: 'linear-gradient(135deg,#9d5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with AI Precision</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 38px', lineHeight: 1.7 }}>
          Solve complex equations, visualize graphs, and get step-by-step AI guidance for Algebra, Calculus, Geometry, and beyond.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/solver">
            <button className="btn-primary animate-glow" style={{ padding: '15px 36px', fontSize: 16, fontWeight: 700 }}>
              Start Solving Free →
            </button>
          </Link>
          <Link href="/topics">
            <button className="btn-ghost" style={{ padding: '15px 36px', fontSize: 16 }}>Explore Topics</button>
          </Link>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>✓ Free to start · No credit card required</p>
      </section>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {[{ v: '10M+', l: 'Students' }, { v: '500K+', l: 'Problems Solved' }, { v: '6', l: 'Math Topics' }, { v: '24/7', l: 'AI Available' }].map((s, i, arr) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '28px 20px', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none', maxWidth: 200 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--purple-light)' }}>{s.v}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 34, fontWeight: 700, marginBottom: 10 }}>Why Math<span style={{ color: 'var(--purple-light)' }}>AI</span>?</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 52, fontSize: 16 }}>Experience the future of learning with tools designed to make math click.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22 }}>
          {features.map((f, i) => (
            <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 26, cursor: 'pointer', transition: 'all 0.22s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'white' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ margin: '0 32px 80px', background: 'linear-gradient(135deg,var(--purple-dim),#1e0a3e)', border: '1px solid var(--purple)', borderRadius: 20, padding: '52px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10 }}>Ready to transform your math grades?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Join thousands of students who use MathAI to solve problems instantly.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '13px 30px', fontSize: 15 }} onClick={() => openAuth('signup')}>Get Started Free</button>
          <Link href="/solver"><button className="btn-ghost" style={{ padding: '13px 30px', fontSize: 15 }}>Try the Solver</button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 32px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
        © 2026 MathAI · Built with Gemini AI
      </footer>

      {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
      {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
    </div>
  );
}
