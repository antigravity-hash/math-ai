'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal } from '@/components/shared';
import Link from 'next/link';

const TOPICS = [
    { id: 'algebra', name: 'Algebra', icon: '∑', color: '#7c3aed', bg: '#1a0f3e' },
    { id: 'calculus', name: 'Calculus', icon: '∫', color: '#ec4899', bg: '#250b1a' },
    { id: 'geometry', name: 'Geometry', icon: '△', color: '#06b6d4', bg: '#081c22' },
    { id: 'probability', name: 'Probability', icon: '🎲', color: '#f59e0b', bg: '#241a0b' },
    { id: 'trigonometry', name: 'Trigonometry', icon: 'θ', color: '#10b981', bg: '#0b2418' },
    { id: 'linear-algebra', name: 'Linear Algebra', icon: '⊕', color: '#8b5cf6', bg: '#1c1033' },
];

const DIFFICULTIES = [
    { id: 'Easy', label: 'Easy', desc: 'Basics & Foundations', color: 'var(--green)', coins: 15 },
    { id: 'Medium', label: 'Medium', desc: 'Standard Problems', color: 'var(--gold)', coins: 30 },
    { id: 'Hard', label: 'Hard', desc: 'Advanced Challenges', color: 'var(--red)', coins: 60 },
];

export default function PracticePage() {
    const { user, login, logout, updateCoins } = useAuth();
    const { toast, showToast } = useToast();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    // Quiz State
    const [step, setStep] = useState('select-topic'); // select-topic, select-difficulty, quiz, results
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedDiff, setSelectedDiff] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [qIndex, setQIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ score: 0, coins: 0 });

    const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
    const handleAuth = (u) => { login(u); setShowAuth(false); showToast(`Welcome, ${u.name}!`); };

    const startQuiz = async (diff) => {
        setSelectedDiff(diff);
        setLoading(true);
        setStep('quiz');
        setQuestions([]);
        setQIndex(0);
        setResults({ score: 0, coins: 0 });

        try {
            // We fetch 3 questions for a quick focused session
            const newQuestions = [];
            for (let i = 0; i < 3; i++) {
                const res = await fetch('/api/practice/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: selectedTopic.name, difficulty: diff.id })
                });
                const data = await res.json();
                if (data.question) newQuestions.push(data.question);
            }
            setQuestions(newQuestions);
        } catch (err) {
            showToast('Failed to load questions', 'error');
            setStep('select-difficulty');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!userAnswer.trim() || loading) return;
        setLoading(true);
        const currentQ = questions[qIndex];

        try {
            const res = await fetch('/api/practice/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem: currentQ.question,
                    userAnswer,
                    correctAnswer: currentQ.correctAnswer,
                    topic: selectedTopic.name
                })
            });
            const data = await res.json();
            if (res.ok) {
                setFeedback(data.feedback);
                if (data.feedback.correct) {
                    setResults(prev => ({
                        score: prev.score + 1,
                        coins: prev.coins + selectedDiff.coins
                    }));
                }
            }
        } catch (err) {
            showToast('Evaluation error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        if (qIndex < questions.length - 1) {
            setQIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback(null);
        } else {
            // Quiz finished
            if (results.coins > 0 && user) {
                updateCoins(results.coins);
                showToast(`🏆 You earned ${results.coins} coins!`);
                // Save session for analytics
                fetch('/api/practice/save-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: selectedTopic.name, score: results.score, total: questions.length })
                });
            }
            setStep('results');
        }
    };

    const resetQuiz = () => {
        setStep('select-topic');
        setSelectedTopic(null);
        setSelectedDiff(null);
        setQuestions([]);
        setQIndex(0);
        setUserAnswer('');
        setFeedback(null);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Nav user={user} onLogin={openAuth} onLogout={logout} />

            <div style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto' }}>

                {/* ── STEP 1: Select Topic ── */}
                {step === 'select-topic' && (
                    <div className="animate-slide-in">
                        <div style={{ marginBottom: 32, textAlign: 'center' }}>
                            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Math Practice Arena</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Choose a chapter to begin your training session.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
                            {TOPICS.map(topic => (
                                <div key={topic.id} onClick={() => { setSelectedTopic(topic); setStep('select-difficulty'); }}
                                    className="card"
                                    style={{ padding: 24, cursor: 'pointer', transition: 'all 0.2s', borderBottom: `4px solid ${topic.color}` }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'white'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = topic.color; }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>{topic.icon}</div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{topic.name}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Master your skills in {topic.name.toLowerCase()} through adaptive challenges.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Select Difficulty ── */}
                {step === 'select-difficulty' && selectedTopic && (
                    <div className="animate-slide-in" style={{ textAlign: 'center' }}>
                        <button onClick={() => setStep('select-topic')} style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>← Back to Topics</button>
                        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Select Difficulty</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>How challenging should the {selectedTopic.name} problems be?</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
                            {DIFFICULTIES.map(diff => (
                                <button key={diff.id} onClick={() => startQuiz(diff)}
                                    className="card"
                                    style={{ width: 220, padding: 30, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = diff.color}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, color: diff.color, marginBottom: 10 }}>{diff.label}</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{diff.desc}</p>
                                    <div style={{ fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20 }}>
                                        Reward: {diff.coins} coins
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Quiz ── */}
                {step === 'quiz' && (
                    <div className="animate-slide-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ fontSize: 24 }}>{selectedTopic.icon}</div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedTopic.name} Quiz</h2>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: selectedDiff.color, textTransform: 'uppercase' }}>{selectedDiff.label} Difficulty</span>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                                Question {loading && questions.length === 0 ? '...' : qIndex + 1} / {questions.length}
                            </div>
                        </div>

                        {loading && questions.length === 0 ? (
                            <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                <div className="animate-pulse" style={{ fontSize: 18, color: 'var(--text-muted)' }}>🤖 AI is preparing your questions...</div>
                            </div>
                        ) : questions[qIndex] && (
                            <div className="card" style={{ padding: 40, position: 'relative' }}>
                                <div style={{ marginBottom: 32 }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--purple-light)', marginBottom: 12, letterSpacing: '0.1em' }}>QUESTION {qIndex + 1}</div>
                                    <p style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, color: 'white' }}>{questions[qIndex].question}</p>
                                </div>

                                {!feedback ? (
                                    <div style={{ marginTop: 24 }}>
                                        <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="input"
                                            style={{ width: '100%', minHeight: 100, fontSize: 18, padding: 20, marginBottom: 20 }}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitAnswer()}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tip: Be as specific as possible. AI will evaluate equivalence.</p>
                                            <button className="btn-primary" onClick={submitAnswer} disabled={loading || !userAnswer.trim()} style={{ padding: '12px 36px' }}>
                                                {loading ? 'Evaluating...' : 'Submit Answer'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-slide-in" style={{ marginTop: 20 }}>
                                        <div style={{ background: feedback.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${feedback.correct ? 'var(--green)' : 'var(--red)'}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: feedback.correct ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>
                                                {feedback.correct ? '🎉 Correct!' : '❌ Not quite'}
                                            </div>
                                            <p style={{ color: 'white', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{feedback.feedback}</p>
                                            {!feedback.correct && feedback.hint && (
                                                <div style={{ background: 'rgba(245,158,11,0.1)', borderLeft: '3px solid var(--gold)', padding: '10px 14px', borderRadius: 4, fontSize: 13, color: 'var(--gold)' }}>
                                                    <strong>Hint:</strong> {feedback.hint}
                                                </div>
                                            )}
                                        </div>
                                        <button className="btn-primary" onClick={nextQuestion} style={{ width: '100%', padding: 14 }}>
                                            {qIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP 4: Results ── */}
                {step === 'results' && (
                    <div className="card animate-slide-in" style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>{results.score === questions.length ? '🏆' : results.score > 0 ? '⭐' : '📖'}</div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Session Complete!</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Great job practicing {selectedTopic.name} at {selectedDiff.label} difficulty.</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 48 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Final Score</div>
                                <div style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>{results.score} / {questions.length}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Coins Earned</div>
                                <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--gold)' }}>+{results.coins}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={resetQuiz} style={{ padding: '14px 40px' }}>Try Another Session</button>
                            <Link href="/profile">
                                <button className="btn-ghost" style={{ padding: '14px 40px' }}>View My Stats</button>
                            </Link>
                        </div>
                    </div>
                )}

            </div>

            {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </div>
    );
}
