import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();

        // 1. Proficiency Data
        const proficiency = db.prepare('SELECT topic, score FROM proficiency WHERE user_id = ?').all(user.id);

        // 2. Quiz History (Last 10)
        const quizHistory = db.prepare(`
            SELECT topic, score, total, completed_at 
            FROM quiz_sessions 
            WHERE user_id = ? 
            ORDER BY completed_at DESC 
            LIMIT 10
        `).all(user.id);

        // 3. Activity (Last 7 Days)
        const activity = db.prepare(`
            SELECT date(solved_at) as date, COUNT(*) as count 
            FROM solutions 
            WHERE user_id = ? AND solved_at >= date('now', '-7 days')
            GROUP BY date(solved_at)
            ORDER BY date ASC
        `).all(user.id);

        // 4. Global Stats
        const stats = db.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM solutions WHERE user_id = ?) as totalSolved,
                (SELECT AVG(CAST(score AS FLOAT)/total) * 100 FROM quiz_sessions WHERE user_id = ?) as avgQuizScore,
                last_active, streak, rank, coins
            FROM users WHERE id = ?
        `).get(user.id, user.id, user.id);

        return NextResponse.json({
            success: true,
            analytics: {
                proficiency,
                quizHistory,
                activity,
                stats
            }
        });
    } catch (err) {
        console.error('Analytics Fetch Error:', err);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
