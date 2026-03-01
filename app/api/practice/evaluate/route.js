import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { evaluateAnswer } from '@/lib/gemini';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const { problem, userAnswer, correctAnswer, topic } = await request.json();
        if (!problem || !userAnswer) {
            return NextResponse.json({ error: 'Problem and answer are required' }, { status: 400 });
        }

        const feedback = await evaluateAnswer(problem, userAnswer, correctAnswer);

        const user = await getUserFromRequest(request);
        if (user?.id && feedback.correct) {
            const db = getDb();
            db.prepare('UPDATE users SET coins = coins + 25 WHERE id = ?').run(user.id);
            db.prepare(`
        INSERT INTO proficiency (user_id, topic, score) VALUES (?, ?, 55)
        ON CONFLICT(user_id, topic) DO UPDATE SET score = MIN(100, score + 3), updated_at = datetime('now')
      `).run(user.id, topic || 'algebra');
        }

        return NextResponse.json({ success: true, feedback });
    } catch (err) {
        console.error('Evaluate error:', err);
        return NextResponse.json({ error: 'Failed to evaluate answer. Please check your AI API key/quota.' }, { status: 500 });
    }
}
