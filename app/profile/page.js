'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal, RadarChart } from '@/components/shared';

const BADGES = [
    { name: 'Calculus Master', icon: '∫', desc: 'Solved 10 calculus problems', color: '#ec4899' },
    { name: '7-Day Streak', icon: '🔥', desc: 'Practiced 7 days in a row', color: '#f59e0b' },
    { name: 'Fast Solver', icon: '⚡', desc: 'Solved 5 problems quickly', color: '#06b6d4' },
    { name: 'Math Wizard', icon: '🧙', desc: 'Complete all topic modules', color: '#7c3aed', locked: true },
    { name: 'Perfect Score', icon: '💯', desc: 'Score 100% on a quiz', color: '#10b981', locked: true },
];

export default function ProfilePage() {
    const { user, login, logout } = useAuth();
    const { toast, showToast } = useToast();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [profile, setProfile] = useState(null);
    const [leaders, setLeaders] = useState([]);

    const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
    const handleAuth = (u) => { login(u); setShowAuth(false); showToast(`Welcome, ${u.name}!`); };

    useEffect(() => {
        if (user) {
            fetch('/api/user/profile').then(r => r.json()).then(d => { if (d.user) setProfile(d); });
        }
        fetch('/api/leaderboard').then(r => r.json()).then(d => { if (d.leaders) setLeaders(d.leaders); });
    }, [user]);

    if (!user) {
        return (
            <div style={{ minHeight: '100vh' }}>
                <Nav user={null} onLogin={openAuth} onLogout={logout} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 20, textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 60 }}>🔒</div>
                    <h2 style={{ fontSize: 26, fontWeight: 700 }}>Sign in to view your profile</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 380 }}>Track learning streaks, badges, proficiency, and your progress across all topics.</p>
                    <button className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }} onClick={() => openAuth('signup')}>Get Started Free</button>
                </div>
                {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
                {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
            </div>
        );
    }

    const displayUser = profile?.user || user;
    const proficiency = profile?.proficiency || [];
    const recentSolutions = profile?.recentSolutions || [];
    const totalSolved = profile?.totalSolved || 0;

    return (
        <div style={{ minHeight: '100vh' }}>
            <Nav user={user} onLogin={openAuth} onLogout={logout} />
            <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>

                {/* Profile + Streak Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Profile Card */}
                    <div className="card" style={{ padding: 26 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, border: '3px solid var(--purple-light)' }}>
                                    {displayUser.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--bg-card)' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{displayUser.name}</h2>
                                <div style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🏅 {displayUser.rank || 'Learner'}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '3px 11px', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>⚡ {(displayUser.coins || 0).toLocaleString()}</div>
                                    <div style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid var(--purple-dim)', borderRadius: 8, padding: '3px 11px', fontSize: 12, color: 'var(--purple-light)', fontWeight: 600 }}>✅ {totalSolved} solved</div>
                                </div>
                            </div>
                        </div>
                        {/* Proficiency mini bars */}
                        {proficiency.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                {proficiency.map(p => (
                                    <div key={p.topic} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '9px 10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--purple-light)' }}>{p.score}%</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.topic}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Streak Card */}
                    <div className="card" style={{ padding: 26 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Learning Streak</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                            <span style={{ fontSize: 52, fontWeight: 800 }}>{displayUser.streak || 0}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>Days</span>
                            <span style={{ fontSize: 30, marginLeft: 'auto' }}>🔥</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                            {Array.from({ length: 7 }, (_, i) => (
                                <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: i < (displayUser.streak % 7 || 0) ? 'linear-gradient(90deg,var(--purple),var(--cyan))' : 'rgba(255,255,255,0.08)' }} />
                            ))}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>Keep solving to extend your streak and unlock exclusive badges!</p>
                    </div>
                </div>

                {/* Radar + Achievements Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div className="card" style={{ padding: 26 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Proficiency Radar</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RadarChart proficiency={proficiency} />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 26 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Achievements</h3>
                        {BADGES.map((badge, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < BADGES.length - 1 ? '1px solid var(--border)' : 'none', opacity: badge.locked ? 0.4 : 1 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${badge.color}22`, border: `1px solid ${badge.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{badge.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{badge.name}{badge.locked && <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4, marginLeft: 7 }}>Locked</span>}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{badge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity + Leaderboard */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 26 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Recent Problems</h3>
                        {recentSolutions.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No problems solved yet. Head to the Solver!</p>
                        ) : recentSolutions.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < recentSolutions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>∑</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.problem}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{s.topic}</div>
                                </div>
                                <div style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>✓ Solved</div>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: 26 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>🏆 Leaderboard</h3>
                        {leaders.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No users yet. Be the first!</p>
                        ) : leaders.map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < leaders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'rgba(245,158,11,0.3)' : i === 1 ? 'rgba(180,180,180,0.2)' : i === 2 ? 'rgba(180,100,40,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.rank}</div>
                                </div>
                                <div style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 700 }}>⚡ {l.coins?.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </div>
    );
}
