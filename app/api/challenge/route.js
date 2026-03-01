import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        // Rotate through challenges by day of year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const challenges = db.prepare('SELECT * FROM daily_challenges ORDER BY id').all();
        if (!challenges.length) {
            return NextResponse.json({ error: 'No challenges found' }, { status: 404 });
        }
        const challenge = challenges[dayOfYear % challenges.length];
        return NextResponse.json({ challenge });
    } catch (err) {
        console.error('Challenge error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
