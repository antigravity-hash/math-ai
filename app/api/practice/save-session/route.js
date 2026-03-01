import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const { topic, score, total } = await request.json();
        const user = await getUserFromRequest(request);

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();
        db.prepare('INSERT INTO quiz_sessions (user_id, topic, score, total) VALUES (?, ?, ?, ?)').run(
            user.id, topic, score, total
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Save Session Error:', err);
        return NextResponse.json({ error: 'Failed to save quiz results' }, { status: 500 });
    }
}
