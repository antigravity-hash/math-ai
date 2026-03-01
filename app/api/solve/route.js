import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { solveMathProblem } from '@/lib/gemini';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const { problem } = await request.json();
        if (!problem?.trim()) {
            return NextResponse.json({ error: 'Problem is required' }, { status: 400 });
        }

        const solution = await solveMathProblem(problem);

        // Save to DB if user is logged in
        const user = await getUserFromRequest(request);
        if (user?.id) {
            const db = getDb();
            db.prepare(
                'INSERT INTO solutions (user_id, problem, final_answer, topic, steps_json) VALUES (?, ?, ?, ?, ?)'
            ).run(user.id, problem, solution.finalAnswer, solution.topic, JSON.stringify(solution.steps));

            // Award coins
            db.prepare('UPDATE users SET coins = coins + 15 WHERE id = ?').run(user.id);

            // Update proficiency for the topic
            db.prepare(`
        INSERT INTO proficiency (user_id, topic, score) VALUES (?, ?, 55)
        ON CONFLICT(user_id, topic) DO UPDATE SET score = MIN(100, score + 2), updated_at = datetime('now')
      `).run(user.id, solution.topic || 'algebra');
        }

        return NextResponse.json({ success: true, solution });
    } catch (err) {
        console.error('Solve error:', err);
        if (err.message?.includes('JSON')) {
            return NextResponse.json({ error: 'AI returned an unexpected response. Please rephrase your problem.' }, { status: 422 });
        }
        return NextResponse.json({ error: 'Failed to solve problem. Please check your AI API key/quota.' }, { status: 500 });
    }
}
