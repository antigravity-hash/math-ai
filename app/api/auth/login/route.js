import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Update streak logic
        const today = new Date().toDateString();
        const lastActive = user.last_active ? new Date(user.last_active).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let newStreak = user.streak;
        if (lastActive === yesterday) {
            newStreak = user.streak + 1;
        } else if (lastActive !== today) {
            newStreak = 1;
        }

        // Update rank based on coins
        let rank = 'Beginner';
        if (user.coins >= 5000) rank = 'Math Legend';
        else if (user.coins >= 2000) rank = 'Calculus Master';
        else if (user.coins >= 1000) rank = 'Advanced Solver';
        else if (user.coins >= 500) rank = 'Intermediate';
        else if (user.coins >= 100) rank = 'Learner';

        db.prepare('UPDATE users SET last_active = ?, streak = ?, rank = ? WHERE id = ?')
            .run(new Date().toISOString(), newStreak, rank, user.id);

        const token = await signToken({ id: user.id, email: user.email, name: user.name });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, coins: user.coins, streak: newStreak, rank }
        });
        response.cookies.set('math_ai_token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
        });
        return response;
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set('math_ai_token', '', { maxAge: 0, path: '/' });
    return response;
}
