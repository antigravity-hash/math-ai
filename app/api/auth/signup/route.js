import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const result = db.prepare(
            'INSERT INTO users (name, email, password_hash, last_active) VALUES (?, ?, ?, ?)'
        ).run(name, email, password_hash, new Date().toISOString());

        // Seed proficiency topics
        const topics = ['algebra', 'calculus', 'geometry', 'probability', 'trigonometry', 'logic'];
        const insertProf = db.prepare('INSERT OR IGNORE INTO proficiency (user_id, topic, score) VALUES (?, ?, ?)');
        for (const topic of topics) insertProf.run(result.lastInsertRowid, topic, 50);

        const token = await signToken({ id: result.lastInsertRowid, email, name });

        const response = NextResponse.json({ success: true, user: { id: result.lastInsertRowid, name, email } });
        response.cookies.set('math_ai_token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });
        return response;
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
