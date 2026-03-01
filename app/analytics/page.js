'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal, RadarChart, ActivityChart, ProgressBar } from '@/components/shared';

export default function AnalyticsPage() {
    const { user, login, logout } = useAuth();
    const { toast, showToast } = useToast();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (user) {
            fetch('/api/user/analytics')
                .then(res => res.json())
                .then(d => {
                    if (d.success) setData(d.analytics);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
    const handleAuth = (u) => { login(u); setShowAuth(false); showToast(`Welcome, ${u.name}!`); };

    if (!user && !loading) {
        return (
            <div style={{ minHeight: '100vh' }}>
                <Nav user={user} onLogin={openAuth} onLogout={logout} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Unlock Your Analytics</h1>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 450, marginBottom: 32 }}>Sign in to track your math proficiency, solve history, and quiz performance.</p>
                    <button className="btn-primary" onClick={() => openAuth('login')} style={{ padding: '14px 40px' }}>Sign In Now</button>
                </div>
                {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Nav user={user} onLogin={openAuth} onLogout={logout} />

            <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Math Insights</h1>
                    <p style={{ color: 'var(--text-muted)' }}>A deep dive into your learning patterns and performance.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>Thinking...</div>
                ) : data && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

                        {/* ── Key Metrics ── */}
                        <div className="card" style={{ padding: 24, gridColumn: 'span 3', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Solved Problems</div>
                                <div style={{ fontSize: 32, fontWeight: 800 }}>{data.stats.totalSolved}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Avg Quiz Score</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--cyan)' }}>{data.stats.avgQuizScore ? Math.round(data.stats.avgQuizScore) : 0}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Current Streak</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>{data.stats.streak} Days</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Rank</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--purple-light)' }}>{data.stats.rank}</div>
                            </div>
                        </div>

                        {/* ── Topic Mastery ── */}
                        <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Topic Proficiency</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                                <RadarChart proficiency={data.proficiency} />
                                <div style={{ flex: 1 }}>
                                    {data.proficiency.map(p => (
                                        <div key={p.topic} style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p.topic}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{p.score}%</span>
                                            </div>
                                            <ProgressBar pct={p.score} color={p.score > 80 ? 'var(--green)' : p.score > 50 ? 'var(--cyan)' : 'var(--purple)'} />
                                        </div>
                                    ))}
                                    {data.proficiency.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet. Start solving problems!</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── Daily Activity ── */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Recent Activity</h3>
                            <ActivityChart data={data.activity} />
                            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>
                                This chart shows your problem-solving frequency over the last 7 days. Consistency is key to mastering math!
                            </p>
                        </div>

                        {/* ── Quiz History ── */}
                        <div className="card" style={{ padding: 24, gridColumn: 'span 3' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Quizzes</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>TOPIC</th>
                                        <th style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>SCORE</th>
                                        <th style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>ACCURACY</th>
                                        <th style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.quizHistory.map((q, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '16px 12px', fontWeight: 600, textTransform: 'capitalize' }}>{q.topic}</td>
                                            <td style={{ padding: '16px 12px' }}>{q.score} / {q.total}</td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: 13 }}>{Math.round((q.score / q.total) * 100)}%</span>
                                                    <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                                        <div style={{ width: `${(q.score / q.total) * 100}%`, height: '100%', background: (q.score / q.total) > 0.7 ? 'var(--green)' : 'var(--purple)', borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 13 }}>{new Date(q.completed_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {data.quizHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No quizzes completed yet. Go to Practice!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}
            </div>

            {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </div>
    );
}
