'use client';
import { useState, useEffect, useCallback } from 'react';

// ── Shared Context ──────────────────────────────────────────
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('math_ai_user', JSON.stringify(data.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('math_ai_user');
                }
            } catch {
                // Fallback to localStorage if API fails
                const stored = localStorage.getItem('math_ai_user');
                if (stored) { try { setUser(JSON.parse(stored)); } catch { } }
            }
            setLoading(false);
        };
        verify();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('math_ai_user', JSON.stringify(userData));
    };

    const logout = async () => {
        await fetch('/api/auth/login', { method: 'DELETE' });
        setUser(null);
        localStorage.removeItem('math_ai_user');
    };

    const updateCoins = (amount) => {
        setUser(u => {
            if (!u) return u;
            const updated = { ...u, coins: (u.coins || 0) + amount };
            localStorage.setItem('math_ai_user', JSON.stringify(updated));
            return updated;
        });
    };

    return { user, login, logout, loading, updateCoins };
}

// ── Toast hook ──────────────────────────────────────────────
export function useToast() {
    const [toast, setToast] = useState(null);
    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    }, []);
    return { toast, showToast };
}

// ── AuthModal ───────────────────────────────────────────────
export function AuthModal({ mode: initialMode, onAuth, onClose }) {
    const [mode, setMode] = useState(initialMode || 'login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async () => {
        setError(''); setLoading(true);
        try {
            const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
            const body = mode === 'signup' ? { name, email, password } : { email, password };
            const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong'); }
            else { onAuth(data.user); }
        } catch { setError('Network error. Please try again.'); }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div className="card animate-slide-in" style={{ padding: 36, width: 420, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{mode === 'login' ? 'Welcome Back' : 'Join Math AI'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>{mode === 'login' ? 'Continue your learning journey' : 'Master mathematics with AI guidance'}</p>

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}

                {mode === 'signup' && (
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Full Name</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Carter" />
                    </div>
                )}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Email</label>
                    <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Password</label>
                    <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()} />
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: 14, marginBottom: 14, fontSize: 15 }} onClick={submit} disabled={loading}>
                    {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
                        {mode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
}

// ── Mini SVG Graph ──────────────────────────────────────────
export function MiniGraph({ problem, equation }) {
    const w = 320, h = 220, cx = w / 2, cy = h / 2, scale = 22;

    const fn = (x) => {
        if (equation) {
            try {
                // Safely evaluate the equation string provided by AI
                // We use Function constructor but wrap it in a scope that only sees x and Math
                const safeEval = new Function('x', 'Math', `return ${equation}`);
                const val = safeEval(x, Math);
                return isNaN(val) ? 0 : val;
            } catch (e) {
                return 0;
            }
        }
        // Fallback for demo questions
        const p = problem?.toLowerCase() || '';
        if (p.includes('2x³') || p.includes('2x^3')) return 2 * x ** 3 + 5 * x ** 2 - x + 10;
        if (p.includes('sin')) return Math.sin(x) * 4;
        if (p.includes('cos')) return Math.cos(x) * 4;
        if (p.includes('x²') || p.includes('x^2')) return x ** 2;
        return x * 2;
    };

    const toSVG = (x, y) => ({ x: cx + x * scale, y: cy - y * scale });

    const buildPath = (evalFn) => {
        const pts = [];
        for (let x = -7; x <= 7; x += 0.1) {
            const y = evalFn(x);
            if (Math.abs(y) > 15) {
                if (pts.length > 0 && pts[pts.length - 1] !== 'M') pts.push('M');
                continue;
            }
            const p = toSVG(x, y);
            pts.push(pts.length === 0 || pts[pts.length - 1] === 'M' ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
        }
        return pts.filter(d => d !== 'M').join(' ');
    };

    return (
        <svg width={w} height={h} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16 }}>
            {/* Grid */}
            {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map(i => (
                <g key={i}>
                    <line x1={0} y1={cy + i * scale} x2={w} y2={cy + i * scale} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    <line x1={cx + i * scale} y1={0} x2={cx + i * scale} y2={h} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                </g>
            ))}

            {/* Axes */}
            <line x1={0} y1={cy} x2={w} y2={cy} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
            <line x1={cx} y1={0} x2={cx} y2={h} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />

            {/* Plot */}
            <path d={buildPath(fn)} fill="none" stroke="var(--purple-light)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

            {/* Info */}
            <rect x={12} y={12} width={70} height={28} rx={6} fill="rgba(0,0,0,0.6)" />
            <line x1={20} y1={26} x2={35} y2={26} stroke="var(--purple-light)" strokeWidth={3} />
            <text x={42} y={30} fill="white" fontSize={11} fontWeight="700">f(x)</text>
        </svg>
    );
}

// ── Radar Chart ─────────────────────────────────────────────
export function RadarChart({ proficiency }) {
    const labels = ['Algebra', 'Calculus', 'Geometry', 'Probability', 'Trig', 'Logic'];
    const topicMap = { algebra: 0, calculus: 1, geometry: 2, probability: 3, trigonometry: 4, logic: 5 };
    const values = [50, 50, 50, 50, 50, 50];
    if (proficiency) {
        for (const p of proficiency) {
            const idx = topicMap[p.topic];
            if (idx !== undefined) values[idx] = p.score;
        }
    }
    const cx = 130, cy = 120, r = 90, n = labels.length;

    const pt = (i, val) => {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        const rv = (val / 100) * r;
        return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) };
    };
    const gridPt = (i, pct) => {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        return { x: cx + pct * r * Math.cos(angle), y: cy + pct * r * Math.sin(angle) };
    };
    const polygon = values.map((v, i) => pt(i, v));
    const polygonStr = polygon.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return (
        <svg width={260} height={240}>
            {[0.25, 0.5, 0.75, 1].map(pct => (
                <polygon key={pct} points={labels.map((_, i) => { const p = gridPt(i, pct); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')} fill="none" stroke="var(--border)" strokeWidth={1} />
            ))}
            {labels.map((_, i) => { const p = gridPt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={1} />; })}
            <polygon points={polygonStr} fill="rgba(6,182,212,0.12)" stroke="var(--cyan)" strokeWidth={2} />
            {polygon.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--cyan)" />)}
            {labels.map((l, i) => { const p = gridPt(i, 1.22); return <text key={i} x={p.x} y={p.y} textAnchor="middle" fill="var(--purple-light)" fontSize={10} fontWeight="600">{l}</text>; })}
        </svg>
    );
}

// ── Activity Chart (Simple Bar) ─────────────────────────────
export function ActivityChart({ data }) {
    const w = 400, h = 120, r = 10;
    const max = Math.max(...(data?.map(d => d.count) || [1]), 5);

    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            {data?.map((d, i) => {
                const barH = (d.count / max) * (h - 20);
                const x = (i * (w / 7)) + 10;
                return (
                    <g key={i}>
                        <rect x={x} y={h - barH - 20} width={w / 10} height={barH} rx={4} fill="var(--purple)" opacity={0.6 + (d.count / max) * 0.4} />
                        <text x={x + w / 20} y={h - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>{d.date.slice(5)}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ── Progress Bar ────────────────────────────────────────────
export function ProgressBar({ pct, color = 'var(--purple)' }) {
    return (
        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 1s ease' }} />
        </div>
    );
}
