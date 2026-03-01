'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import { useAuth, useToast, AuthModal } from '@/components/shared';
import Link from 'next/link';

const TOPICS = [
    {
        id: 'algebra', name: 'Algebra', icon: '∑', color: '#7c3aed',
        desc: 'Equations, polynomials, inequalities, and functions',
        concepts: [
            {
                name: 'Real Number System',
                sub: 'Natural, integers, rationals, irrationals, properties',
                notes: 'The real number system includes all numbers that can be found on a number line. It starts from the simplest counting numbers and extends to complex irrational numbers like π.',
                formula: 'N ⊂ Z ⊂ Q ⊂ R'
            },
            {
                name: 'Algebraic Expressions',
                sub: 'Terms, coefficients, like terms, simplification',
                notes: 'An expression is a combination of variables, numbers, and operators. Simplification involves combining like terms (terms with the same variable and power).',
                formula: '3x + 2x = 5x'
            },
            {
                name: 'Linear Equations (1 var)',
                sub: 'Solving, graphing on number line, applications',
                notes: 'A linear equation in one variable is an equation of the form ax + b = 0. Solving it means finding the specific value of x that makes the equation true.',
                formula: 'x = -b/a'
            },
            {
                name: 'Linear Equations (2 var)',
                sub: 'Slope, intercept, y = mx + b, graphing',
                notes: 'These equations represent straight lines on a coordinate plane. The slope-intercept form is the most common way to write them.',
                formula: 'y = mx + b'
            },
            {
                name: 'Quadratic Equations',
                sub: 'Factoring, completing the square, quadratic formula, discriminant',
                notes: 'Equations where the highest power of x is 2. They form parabolas when graphed. The quadratic formula provides the roots for any quadratic equation.',
                formula: 'x = [-b ± √(b² - 4ac)] / 2a'
            },
            { name: 'Systems of Equations', sub: 'Substitution, elimination, graphical method, 3-var' },
            { name: 'Inequalities', sub: 'Linear, compound, absolute value inequalities' },
            { name: 'Exponents & Powers', sub: 'Laws of exponents, zero/negative exponents, scientific notation' },
            { name: 'Polynomials', sub: 'Addition, subtraction, multiplication, long division' },
            { name: 'Factoring', sub: 'GCF, difference of squares, trinomials, sum/diff of cubes' },
            { name: 'Quadratic Functions', sub: 'Vertex, axis of symmetry, parabola, transformations' },
            { name: 'Radicals & Rational Exponents', sub: 'Simplifying, adding, multiplying, rationalizing' },
            { name: 'Rational Expressions', sub: 'Simplify, multiply, divide, add, subtract fractions' },
            { name: 'Functions', sub: 'Domain, range, notation, composition, inverse' },
            { name: 'Graphing Functions', sub: 'Transformations, reflections, stretching, shifting' },
            { name: 'Polynomial Functions', sub: 'Degree, end behavior, zeroes, graphing, Remainder Theorem' },
            { name: 'Complex Numbers', sub: 'Imaginary unit i, operations, complex conjugates, modulus' },
            { name: 'Sequences & Series', sub: 'Arithmetic, geometric, sigma notation, sums' },
            { name: 'Logarithms & Exponential Functions', sub: 'Log laws, change of base, exponential growth/decay' },
            { name: 'Matrices', sub: 'Operations, determinants, inverse, solving systems' },
        ],
    },
    {
        id: 'calculus', name: 'Calculus', icon: '∫', color: '#ec4899',
        desc: 'Limits, derivatives, integrals, and series',
        concepts: [
            {
                name: 'Limits',
                sub: 'One-sided, two-sided, limit laws, ε-δ definition',
                notes: 'A limit is the value that a function approaches as the input approaches some value. It is the core concept that defines continuity, derivatives, and integrals.',
                formula: 'lim_{x→a} f(x) = L'
            },
            {
                name: 'Power Rule',
                sub: 'd/dx [xⁿ] = nxⁿ⁻¹, constant multiples',
                notes: 'The quickest way to find the derivative of a polynomial term. Just bring the power down as a multiplier and subtract one from the exponent.',
                formula: 'd/dx[xⁿ] = nxⁿ⁻¹'
            },
            {
                name: 'Definite Integrals',
                sub: 'Fundamental Theorem of Calculus parts 1 & 2',
                notes: 'The integral represents the area under a curve. The definite integral calculates the accumulation between two specific points (a and b).',
                formula: '∫ₐᵇ f(x) dx = F(b) - F(a)'
            },
            { name: 'Antiderivatives', sub: 'Basic integration rules, constant of integration' },
            { name: 'Substitution (u-sub)', sub: 'Technique for integrating composite functions' },
            { name: 'Integration by Parts', sub: '∫ u dv = uv − ∫ v du, LIATE rule' },
            { name: 'Trigonometric Integrals', sub: 'Powers of sin/cos, half-angle identities' },
            { name: 'Partial Fractions', sub: 'Decomposing rational functions for integration' },
            { name: 'Area Between Curves', sub: 'Top minus bottom, horizontal slices' },
            { name: 'Volumes of Solids', sub: 'Disk, washer, shell methods' },
            { name: 'Infinite Series', sub: 'Convergence tests: ratio, comparison, integral' },
            { name: 'Taylor & Maclaurin Series', sub: 'Power series representation of functions' },
            { name: 'Multivariable Calculus', sub: 'Partial derivatives, gradients, double integrals' },
            { name: 'Differential Equations (Intro)', sub: 'Separable equations, initial value problems' },
        ],
    },
    {
        id: 'geometry', name: 'Geometry', icon: '△', color: '#06b6d4',
        desc: 'Shapes, angles, areas, volumes, and spatial reasoning',
        concepts: [
            { name: 'Basic Geometry Terms', sub: 'Points, lines, planes, rays, segments, angles' },
            { name: 'Angles', sub: 'Complementary, supplementary, vertical, linear pair' },
            { name: 'Parallel Lines & Transversals', sub: 'Alternate interior, corresponding, co-interior angles' },
            { name: 'Triangles: Classification', sub: 'By sides (scalene, isosceles, equilateral) & angles' },
            {
                name: 'Pythagorean Theorem',
                sub: 'a² + b² = c², converse, Pythagorean triples',
                notes: 'Fundamental in geometry, it states that in a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.',
                formula: 'a² + b² = c²'
            },
            {
                name: 'Area of Plane Figures',
                sub: 'Triangle, quad, circle, sector, composite shapes',
                notes: 'Measuring the 2D space inside a shape. Each polygon or curve has its own specific calculation method based on base, height, or radius.',
                formula: 'Area(Circle) = πr²'
            },
            {
                name: 'Coordinate Geometry',
                sub: 'Distance, midpoint, slope, collinearity',
                notes: 'Using numbers and algebraic systems to solve geometric problems. The distance formula is essential for finding lengths between two coordinates.',
                formula: 'd = √[(x₂-x₁)² + (y₂-y₁)²]'
            },
            { name: 'Transformations', sub: 'Translations, reflections, rotations, dilations' },
            { name: 'Geometric Constructions', sub: 'Compass & straightedge: bisectors, perpendiculars' },
            { name: 'Proofs', sub: 'Two-column, paragraph proofs, indirect proof' },
        ],
    },
    {
        id: 'probability', name: 'Probability & Stats', icon: '🎲', color: '#f59e0b',
        desc: 'Statistics, distributions, and data analysis',
        concepts: [
            { name: 'Basic Probability', sub: 'Sample space, events, P(E), equally likely outcomes' },
            { name: 'Counting Principles', sub: 'Fundamental counting, permutations nPr, combinations nCr' },
            { name: 'Addition Rule', sub: 'P(A∪B) = P(A)+P(B)−P(A∩B), mutually exclusive' },
            { name: 'Multiplication Rule', sub: 'Independent vs dependent events, P(A∩B)' },
            { name: 'Conditional Probability', sub: 'P(A|B) = P(A∩B)/P(B)' },
            { name: 'Bayes\' Theorem', sub: 'P(A|B) with prior and likelihood, law of total probability' },
            { name: 'Discrete Random Variables', sub: 'PMF, expected value E(X), variance Var(X)' },
            { name: 'Binomial Distribution', sub: 'B(n,p), formula, mean, variance, applications' },
            { name: 'Poisson Distribution', sub: 'Rare events, λ parameter, formula, approximation' },
            { name: 'Geometric Distribution', sub: 'Number of trials until first success' },
            { name: 'Continuous Distributions', sub: 'PDF, CDF, uniform distribution' },
            { name: 'Normal Distribution', sub: 'Bell curve, z-score, standard normal, empirical rule' },
            { name: 'Central Limit Theorem', sub: 'Sampling distribution of the mean, CLT conditions' },
            { name: 'Measures of Center', sub: 'Mean, median, mode, weighted average' },
            { name: 'Measures of Spread', sub: 'Range, variance, standard deviation, IQR' },
            { name: 'Data Visualization', sub: 'Histograms, box plots, stem-and-leaf, scatter plots' },
            { name: 'Correlation & Regression', sub: 'Pearson r, least-squares regression line, R²' },
            { name: 'Hypothesis Testing', sub: 'Null/alternative hypothesis, p-value, Type I & II error' },
            { name: 'Confidence Intervals', sub: 'Construction, margin of error, interpretation' },
            { name: 'Chi-Square Tests', sub: 'Goodness of fit, independence test' },
        ],
    },
    {
        id: 'trigonometry', name: 'Trigonometry', icon: 'θ', color: '#10b981',
        desc: 'Angles, sine, cosine, tangent, and identities',
        concepts: [
            { name: 'Angle Basics', sub: 'Degrees, radians, converting between them, coterminal angles' },
            { name: 'Unit Circle', sub: 'Coordinates for all standard angles, exact values' },
            { name: 'Six Trig Functions', sub: 'sin, cos, tan, csc, sec, cot — definitions & reciprocals' },
            { name: 'Right Triangle Trig', sub: 'SOH-CAH-TOA, solving right triangles, angles of elevation' },
            { name: 'Reference Angles', sub: 'Finding reference angle in all 4 quadrants, ASTC/CAST rule' },
            { name: 'Graphs of Sine & Cosine', sub: 'Amplitude, period, phase shift, vertical shift' },
            { name: 'Graphs of Tan, Cot, Sec, Csc', sub: 'Asymptotes, period, transformations' },
            { name: 'Pythagorean Identities', sub: 'sin²+cos²=1, 1+tan²=sec², 1+cot²=csc²' },
            { name: 'Sum & Difference Formulas', sub: 'sin(A±B), cos(A±B), tan(A±B)' },
            { name: 'Double-Angle Formulas', sub: 'sin(2θ), cos(2θ), tan(2θ)' },
            { name: 'Half-Angle Formulas', sub: 'sin(θ/2), cos(θ/2), tan(θ/2)' },
            { name: 'Product-to-Sum Formulas', sub: 'Converting products to sums and vice versa' },
            { name: 'Inverse Trig Functions', sub: 'arcsin, arccos, arctan — domain, range, graphs' },
            { name: 'Solving Trig Equations', sub: 'General and specific solutions, factoring trig expressions' },
            { name: 'Verifying Trig Identities', sub: 'Strategies for proving identities algebraically' },
            { name: 'Law of Sines', sub: 'a/sinA = b/sinB = c/sinC, ambiguous case (SSA)' },
            { name: 'Law of Cosines', sub: 'c² = a² + b² − 2ab cosC, applications' },
            { name: 'Area of a Triangle', sub: 'K = ½ab sinC, Heron\'s formula' },
            { name: 'Polar Coordinates', sub: 'Converting (r,θ) ↔ (x,y), polar graphs' },
            { name: 'Complex Numbers & Trig', sub: 'De Moivre\'s theorem, nth roots of complex numbers' },
        ],
    },
    {
        id: 'linear-algebra', name: 'Linear Algebra', icon: '⊕', color: '#8b5cf6',
        desc: 'Vectors, matrices, eigenvalues, and transformations',
        concepts: [
            { name: 'Vectors in Rⁿ', sub: 'Notation, addition, scalar multiplication, magnitude' },
            { name: 'Dot Product', sub: 'Formula, geometric meaning, angle between vectors' },
            { name: 'Cross Product', sub: '3D vectors, right-hand rule, area of parallelogram' },
            { name: 'Matrix Operations', sub: 'Addition, subtraction, scalar mult, matrix multiplication' },
            { name: 'Special Matrices', sub: 'Identity, zero, diagonal, symmetric, triangular' },
            { name: 'Row Reduction (RREF)', sub: 'Elementary row ops, echelon form, reduced echelon form' },
            { name: 'Solving Linear Systems', sub: 'Gaussian elimination, consistency, free variables' },
            { name: 'Matrix Inverse', sub: 'Conditions, computing A⁻¹ via augmentation' },
            { name: 'Determinants', sub: '2×2 and 3×3, cofactor expansion, properties' },
            { name: 'Cramer\'s Rule', sub: 'Solving systems using determinants' },
            { name: 'Vector Spaces', sub: 'Subspaces, span, linear independence, basis, dimension' },
            { name: 'Null Space & Column Space', sub: 'Definition, rank-nullity theorem' },
            { name: 'Linear Transformations', sub: 'Definition, standard matrix, kernel, image' },
            { name: 'Eigenvalues & Eigenvectors', sub: 'Characteristic equation, eigenspaces' },
            { name: 'Diagonalization', sub: 'Diagonalizable matrices, P and D, powers of matrices' },
            { name: 'Orthogonality', sub: 'Orthogonal sets, projection, Gram-Schmidt process' },
            { name: 'Orthogonal Matrices', sub: 'QR decomposition, properties' },
            { name: 'Least Squares', sub: 'Least-squares solutions, normal equations' },
            { name: 'Singular Value Decomposition', sub: 'SVD, singular values, applications in data' },
            { name: 'Inner Product Spaces', sub: 'General inner products, orthonormal bases' },
        ],
    },
];

export default function TopicsPage() {
    const { user, login, logout } = useAuth();
    const { toast, showToast } = useToast();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [activeConcept, setActiveConcept] = useState(null);
    const [aiLesson, setAiLesson] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);

    const openAuth = (mode) => { setAuthMode(mode); setShowAuth(true); };
    const handleAuth = (u) => { login(u); setShowAuth(false); showToast(`Welcome, ${u.name}!`); };

    const fetchAiLesson = async (conceptName) => {
        setLoadingAi(true);
        setAiLesson('');
        try {
            const res = await fetch('/api/topics/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: selected.name, concept: conceptName })
            });
            const data = await res.json();
            if (data.explanation) setAiLesson(data.explanation);
            else throw new Error(data.error);
        } catch (err) {
            showToast('Failed to generate AI lesson', 'error');
        } finally {
            setLoadingAi(false);
        }
    };

    const filteredConcepts = selected
        ? (selected.concepts || []).filter(c =>
            !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.sub.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <div style={{ minHeight: '100vh' }}>
            <Nav user={user} onLogin={openAuth} onLogout={logout} />

            <div style={{ padding: '52px 40px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ marginBottom: 44 }}>
                    <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 10 }}>Explore Math Topics</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
                        Select a subject to see every concept you need to master, then jump into the AI solver.
                    </p>
                </div>

                {/* Topic Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 36 }}>
                    {TOPICS.map((topic) => (
                        <div key={topic.id}
                            onClick={() => { setSelected(selected?.id === topic.id ? null : topic); setSearch(''); setActiveConcept(null); }}
                            className="card"
                            style={{ padding: 26, cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden', borderColor: selected?.id === topic.id ? topic.color : 'var(--border)', boxShadow: selected?.id === topic.id ? `0 0 24px ${topic.color}33` : 'none' }}
                            onMouseEnter={e => { if (selected?.id !== topic.id) { e.currentTarget.style.borderColor = topic.color; e.currentTarget.style.transform = 'translateY(-5px)'; } }}
                            onMouseLeave={e => { if (selected?.id !== topic.id) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${topic.color}22`, border: `1px solid ${topic.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: topic.color, fontWeight: 700, marginBottom: 14 }}>{topic.icon}</div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{topic.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{topic.desc}</p>
                            <div style={{ fontSize: 12, color: topic.color, fontWeight: 600 }}>{(topic.concepts || []).length} concepts →</div>
                        </div>
                    ))}
                </div>

                {/* Concept Explorer & Detail Drawer Layout */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    {selected && (
                        <div className="card animate-slide-in" style={{ flex: activeConcept ? '1' : 'none', width: activeConcept ? 'auto' : '100%', padding: 30, borderColor: selected.color, boxShadow: `0 0 30px ${selected.color}22` }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                                        <span style={{ color: selected.color, marginRight: 10 }}>{selected.icon}</span>
                                        {selected.name}
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.concepts.length} concepts · Click to see notes</p>
                                </div>
                                <button onClick={() => { setSelected(null); setActiveConcept(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 22, fontFamily: 'inherit', lineHeight: 1 }}>✕</button>
                            </div>

                            {/* Search */}
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${selected.name} concepts…`} className="input" style={{ marginBottom: 20, maxWidth: 360 }} />

                            {/* Concept Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: activeConcept ? 'repeat(auto-fill,minmax(200px,1fr))' : 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
                                {filteredConcepts.map((concept, i) => (
                                    <div key={i} onClick={() => { setActiveConcept(concept); setAiLesson(''); }} style={{ background: activeConcept?.name === concept.name ? `${selected.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${activeConcept?.name === concept.name ? selected.color : selected.color + '33'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s', height: '100%' }}
                                        onMouseEnter={e => { if (activeConcept?.name !== concept.name) { e.currentTarget.style.background = `${selected.color}12`; e.currentTarget.style.borderColor = selected.color; } }}
                                        onMouseLeave={e => { if (activeConcept?.name !== concept.name) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${selected.color}33`; } }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5, color: 'white' }}>{concept.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{concept.sub}</div>
                                            </div>
                                            <div style={{ color: selected.color, fontSize: 16, flexShrink: 0, marginTop: 2 }}>{activeConcept?.name === concept.name ? '●' : '→'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredConcepts.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '28px 0' }}>No concepts match your search.</p>
                            )}
                        </div>
                    )}

                    {/* Detail Drawer (Conditional side panel) */}
                    {activeConcept && (
                        <div className="card animate-slide-in" style={{ width: 450, padding: 30, borderLeft: `4px solid ${selected.color}`, position: 'sticky', top: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Concept Details</div>
                                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>{activeConcept.name}</h2>
                                </div>
                                <button onClick={() => setActiveConcept(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                            </div>

                            {/* Built-in formula */}
                            {activeConcept.formula && (
                                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, letterSpacing: '0.05em' }}>MAIN FORMULA</div>
                                    <div style={{ fontSize: 20, color: 'var(--cyan)', fontWeight: 700, fontFamily: 'serif', textAlign: 'center' }}>{activeConcept.formula}</div>
                                </div>
                            )}

                            {/* Built-in notes */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' }}>QUICK NOTES</div>
                                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                                    {activeConcept.notes || `Learn the fundamentals of ${activeConcept.name}. This involves understanding ${activeConcept.sub.toLowerCase()}.`}
                                </p>
                            </div>

                            {/* AI Lesson Section */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>AI DEEP-DIVE LESSON</div>
                                    {!aiLesson && !loadingAi && (
                                        <button onClick={() => fetchAiLesson(activeConcept.name)} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>✨ Generate</button>
                                    )}
                                </div>

                                {loadingAi ? (
                                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div className="animate-pulse" style={{ fontSize: 13 }}>Tutor is writing your lesson...</div>
                                    </div>
                                ) : aiLesson ? (
                                    <p style={{ fontSize: 14, color: 'white', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {aiLesson}
                                    </p>
                                ) : (
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Click generate to get a detailed explanation from our AI tutor.</div>
                                )}
                            </div>

                            {/* Practice CTA */}
                            <Link href={`/solver?problem=${encodeURIComponent(`Explain and give an example of: ${activeConcept.name} in ${selected.name}`)}`} style={{ textDecoration: 'none' }}>
                                <button className="btn-primary" style={{ width: '100%', padding: '14px' }}>Practice in AI Solver</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {showAuth && <AuthModal mode={authMode} onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
            {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
        </div>
    );
}
