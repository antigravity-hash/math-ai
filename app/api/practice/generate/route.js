import { NextResponse } from 'next/server';
import { generatePracticeQuestion } from '@/lib/gemini';

export async function POST(request) {
    try {
        const { topic, difficulty } = await request.json();

        if (!topic || !difficulty) {
            return NextResponse.json({ error: 'Topic and difficulty are required' }, { status: 400 });
        }

        const question = await generatePracticeQuestion(topic, difficulty);

        return NextResponse.json({ success: true, question });
    } catch (err) {
        console.error('Practice generation error:', err);
        return NextResponse.json({ error: 'Failed to generate question. Please check your AI API quota.' }, { status: 500 });
    }
}
