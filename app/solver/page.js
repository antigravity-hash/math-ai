'use client';
import { useState, useRef } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal, MiniGraph } from '@/components/shared';

const EXAMPLES = [
    'Find the derivative of f(x) = 2x³ + 5x² - x + 10',
    'Solve for x: 2x² - 7x + 3 = 0',
    'Find the integral of sin(x)cos(x) dx',
    'Simplify: (3x² - 12) / (x - 2)',
    'Find the limit as x→0 of sin(x)/x',
];

const TOPICS = ['Algebra', 'Calculus', 'Geometry', 'Probability', 'Trigonometry', 'All'];

export default function SolverPage() {
    const { user, login, logout, updateCoins } = useAuth();
    const { toast, showToast } = useToast();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showGraph, setShowGraph] = useState(false);
    const [history, setHistory] = useState([]);
    const [saved, setSaved] = useState([]);
    const [sidebar, setSidebar] = useState('dashboard');
    const [followUp, setFollowUp] = useState('');
    const [chat, setChat] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const followRef = useRef(null);

    const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
    const handleAuth = (u) => { login(u); setShowAuth(false); showToast(`Welcome, ${u.name}!`); };

    const solve = async () => {
        if (!problem.trim()) return;
        setLoading(true); setSolution(null); setShowGraph(false); setChat([]);
        try {
            const res = await fetch('/api/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem }) });
            const data = await res.json();
            if (!res.ok) { showToast(data.error || 'Failed to solve', 'error'); }
            else {
                setSolution(data.solution);
                setHistory(h => [{ problem, solution: data.solution, id: Date.now() }, ...h.slice(0, 49)]);
                const hasGraph = /deriv|f\(x\)|graph|integr/i.test(problem);
                setShowGraph(hasGraph);
                if (user) { updateCoins(15); showToast('✓ Solved! +15 coins earned'); }
                else showToast('✓ Solution found!');
            }
        } catch { showToast('Network error. Please try again.', 'error'); }
        setLoading(false);
    };

    const saveProblem = () => {
        if (!solution) return;
        if (saved.find(s => s.problem === problem)) { showToast('Already saved!', 'error'); return; }
        setSaved(s => [{ problem, solution, id: Date.now() }, ...s.slice(0, 49)]);
        showToast('📌 Saved!');
    };

    const loadEntry = (entry) => {
        setProblem(entry.problem);
        setSolution(entry.solution);
        setShowGraph(/deriv|f\(x\)|graph/i.test(entry.problem));
        setChat([]);
        setSidebar('dashboard');
    };

    const sendFollowUp = async () => {
        if (!followUp.trim() || !solution) return;
        setChatLoading(true);
        const userMsg = followUp;
        setChat(c => [...c, { role: 'user', content: userMsg }]);
        setFollowUp('');
        try {
            const res = await fetch('/api/solve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem: `Related to the math problem "${problem}" (answer: ${solution.finalAnswer}). Follow-up question: ${userMsg}` }) });
            const data = await res.json();
            if (res.ok && data.solution) {
                setChat(c => [...c, { role: 'assistant', content: data.solution.explanation || data.solution.finalAnswer }]);
            }
        } catch { }
        setChatLoading(false);
    };

    const NAV_ITEMS = [
        { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { key: 'history', icon: '📜', label: 'History', count: history.length },
        { key: 'saved', icon: '🔖', label: 'Saved', count: saved.length },
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <Nav user={user} onLogin={openAuth} onLogout={logout} />
            <div style={{ display: 'flex', height: 'calc(100vh - 65px)' }}>

                {/* ── Sidebar ── */}
                <div style={{ width: 220, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '18px 14px', flex: 1, overflowY: 'auto' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }}>Menu</div>
                        {NAV_ITEMS.map(item => (
                            <button key={item.key} onClick={() => setSidebar(item.key)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 3, width: '100%', background: sidebar === item.key ? 'rgba(124,58,237,0.22)' : 'none', color: sidebar === item.key ? 'var(--purple-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, border: 'none', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                {item.icon}
                                <span style={{ fontWeight: sidebar === item.key ? 600 : 400 }}>{item.label}</span>
                                {item.count > 0 && <span style={{ marginLeft: 'auto', background: item.key === 'saved' ? 'var(--cyan)' : 'var(--purple)', color: item.key === 'saved' ? 'black' : 'white', fontSize: 10, fontWeight: 700, borderRadius: 8, padding: '1px 6px' }}>{item.count}</span>}
                            </button>
                        ))}

                        <div style={{ marginTop: 16 }}>
                            {/* Dashboard: examples */}
                            {sidebar === 'dashboard' && (
                                <>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Try Examples</div>
                                    {EXAMPLES.map((ex, i) => (
                                        <div key={i} onClick={() => { setProblem(ex); }} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '7px 8px', borderRadius: 7, cursor: 'pointer', marginBottom: 3, lineHeight: 1.4, transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                            {ex.slice(0, 40)}…
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* History */}
                            {sidebar === 'history' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>History</span>
                                        {history.length > 0 && <button onClick={() => setHistory([])} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
                                    </div>
                                    {history.length === 0 ? <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>No history yet</p> :
                                        history.map(h => (
                                            <div key={h.id} onClick={() => loadEntry(h)} style={{ padding: '9px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: 6, cursor: 'pointer', transition: 'border-color 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                                <div style={{ fontSize: 11, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.problem}</div>
                                                <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 3 }}>✓ {h.solution?.finalAnswer?.slice(0, 22)}</div>
                                            </div>
                                        ))
                                    }
                                </>
                            )}

                            {/* Saved */}
                            {sidebar === 'saved' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>Saved</span>
                                        {saved.length > 0 && <button onClick={() => setSaved([])} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
                                    </div>
                                    {saved.length === 0 ? <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>Nothing saved yet</p> :
                                        saved.map(s => (
                                            <div key={s.id} onClick={() => loadEntry(s)} style={{ padding: '9px 10px', background: 'rgba(124,58,237,0.06)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: 6, cursor: 'pointer' }}>
                                                <div style={{ fontSize: 11, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.problem}</div>
                                                <div style={{ fontSize: 10, color: 'var(--purple-light)', marginTop: 3 }}>{s.solution?.finalAnswer?.slice(0, 22)}</div>
                                            </div>
                                        ))
                                    }
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', paddingBottom: 80 }}>
                    {/* Topic tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        {TOPICS.map(t => (
                            <button key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                onClick={() => {
                                    const map = { Algebra: 'Solve for x: 2x + 5 = 13', Calculus: 'Find the derivative of f(x) = 2x³ + 5x² - x + 10', Geometry: 'Find the area of a circle with radius 7', Probability: 'P(A∪B) if P(A)=0.4, P(B)=0.3, P(A∩B)=0.1', Trigonometry: 'Simplify: sin²θ + cos²θ' };
                                    if (map[t]) setProblem(map[t]);
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Problem input */}
                    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div className="tag" style={{ fontSize: 10 }}>PROBLEM</div>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Type your math problem and press Enter or Solve</span>
                        </div>
                        <textarea value={problem} onChange={e => setProblem(e.target.value)}
                            style={{ width: '100%', background: 'none', border: 'none', color: 'white', fontSize: 17, fontWeight: 500, resize: 'none', outline: 'none', lineHeight: 1.5, minHeight: 56, fontFamily: 'inherit' }}
                            placeholder="e.g. Find the derivative of f(x) = x³ + 2x…"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); solve(); } }}
                        />
                    </div>

                    {/* Solution + Graph grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: showGraph && solution ? '1fr 1fr' : '1fr', gap: 20 }}>

                        {/* Solution */}
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>Step-by-Step Solution</span>
                                {solution && <button className="btn-ghost" style={{ padding: '5px 14px', fontSize: 12 }} onClick={saveProblem}>📌 Save</button>}
                            </div>

                            {!solution && !loading && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: 52, marginBottom: 14 }}>∑</div>
                                    <p style={{ fontSize: 15, marginBottom: 6 }}>Enter a math problem above</p>
                                    <p style={{ fontSize: 13 }}>Supports algebra, calculus, geometry, trigonometry and more</p>
                                </div>
                            )}

                            {loading && (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--purple)', borderRadius: '50%' }} className="animate-spin" style2={{ margin: '0 auto 14px' }} />
                                    <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>AI is solving…</p>
                                </div>
                            )}

                            {solution && !loading && (
                                <div className="animate-slide-in">
                                    {solution.steps?.map((step, i) => (
                                        <div key={i} className="step-card">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--purple-light)', flexShrink: 0 }}>{step.number}</div>
                                                <span style={{ fontWeight: 600, fontSize: 14 }}>{step.title}</span>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{step.content}</p>
                                            {step.formula && (
                                                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: '8px 12px', marginTop: 10, fontFamily: 'monospace', fontSize: 13, color: 'var(--cyan)' }}>{step.formula}</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Final answer */}
                                    <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))', border: '1px solid var(--green)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <span style={{ color: 'var(--green)', fontSize: 20 }}>✓</span>
                                        <div>
                                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Answer: </span>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{solution.finalAnswer}</span>
                                        </div>
                                    </div>

                                    {/* Concept explanation */}
                                    <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                            <div style={{ fontSize: 18 }}>💡</div>
                                            <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concept Used: {solution.conceptUsed || solution.topic}</div>
                                        </div>
                                        {solution.conceptNotes && (
                                            <div style={{ background: 'rgba(0,0,0,0.25)', borderLeft: '3px solid var(--cyan)', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: 12 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>✏️ CONCEPT NOTES</div>
                                                <p style={{ fontSize: 13, color: 'white', lineHeight: 1.6 }}>{solution.conceptNotes}</p>
                                            </div>
                                        )}
                                        {solution.explanation && (
                                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{solution.explanation}</p>
                                        )}
                                    </div>

                                    {/* Follow-up chat */}
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Ask a follow-up question</div>
                                        {chat.map((m, i) => (
                                            <div key={i} style={{ marginBottom: 10, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                                <div style={{ display: 'inline-block', background: m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '9px 13px', maxWidth: '80%', fontSize: 13, lineHeight: 1.6 }}>{m.content}</div>
                                            </div>
                                        ))}
                                        {chatLoading && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>AI thinking…</p>}
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <input ref={followRef} value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="e.g. How does the power rule work?" onKeyDown={e => e.key === 'Enter' && sendFollowUp()} className="input" style={{ flex: 1, fontSize: 13, padding: '9px 13px' }} />
                                            <button className="btn-primary" style={{ padding: '9px 16px' }} onClick={sendFollowUp}>Send</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Graph */}
                        {showGraph && solution && (
                            <div className="card" style={{ padding: 24 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Graph</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <MiniGraph problem={problem} equation={solution.equation} />
                                </div>
                                <div style={{ marginTop: 14, display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 20, height: 3, background: '#7c3aed', borderRadius: 2 }} />f(x)</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 20, height: 3, background: '#ec4899', borderRadius: 2, borderTop: '2px dashed #ec4899' }} />f'(x)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div style={{ position: 'fixed', bottom: 0, left: 220, right: 0, background: 'rgba(10,8,18,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1a0f3e,#7c3aed)', border: '2px solid var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
                    {[
                        { label: 'Regenerate', icon: '↻', action: solve },
                        { label: 'Ask Follow-up', icon: '💬', action: () => followRef.current?.focus() },
                        { label: 'Toggle Graph', icon: '📈', action: () => { if (solution) setShowGraph(g => !g); }, highlight: true },
                        { label: 'Save', icon: '📌', action: saveProblem },
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: btn.highlight ? 'linear-gradient(135deg,var(--purple),var(--purple-light))' : 'rgba(255,255,255,0.05)', border: btn.highlight ? 'none' : '1px solid var(--border)', color: 'white', padding: '8px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: btn.highlight ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                            {btn.icon} {btn.label}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn-primary" style={{ padding: '10px 28px' }} onClick={solve} disabled={loading}>
                            {loading ? 'Solving…' : 'Solve ↵'}
                        </button>
                    </div>
                </div>
            </div>

            {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </div>
    );
}
