import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const leaders = db.prepare(
            'SELECT name, coins, streak, rank FROM users ORDER BY coins DESC LIMIT 10'
        ).all();
        return NextResponse.json({ leaders });
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
