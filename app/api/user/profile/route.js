import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();
        const userData = db.prepare('SELECT id, name, email, coins, streak, rank, created_at FROM users WHERE id = ?').get(user.id);
        if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const proficiency = db.prepare('SELECT topic, score FROM proficiency WHERE user_id = ?').all(user.id);
        const recentSolutions = db.prepare(
            'SELECT problem, final_answer, topic, solved_at FROM solutions WHERE user_id = ? ORDER BY solved_at DESC LIMIT 10'
        ).all(user.id);
        const savedCount = db.prepare('SELECT COUNT(*) as c FROM saved_problems WHERE user_id = ?').get(user.id);
        const totalSolved = db.prepare('SELECT COUNT(*) as c FROM solutions WHERE user_id = ?').get(user.id);
        const quizSessions = db.prepare('SELECT * FROM quiz_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5').all(user.id);

        return NextResponse.json({
            user: userData,
            proficiency,
            recentSolutions,
            savedCount: savedCount.c,
            totalSolved: totalSolved.c,
            quizSessions,
        });
    } catch (err) {
        console.error('Profile error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
