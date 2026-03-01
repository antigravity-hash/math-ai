import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = await getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const db = getDb();
        const user = db.prepare('SELECT id, name, email, coins, streak, rank FROM users WHERE id = ?').get(payload.id);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error('Auth verification error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
