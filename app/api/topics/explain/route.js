import { NextResponse } from 'next/server';
import { getAIConceptExplanation } from '@/lib/gemini';

export async function POST(request) {
    try {
        const { topic, concept } = await request.json();

        if (!topic || !concept) {
            return NextResponse.json({ error: 'Topic and concept are required' }, { status: 400 });
        }

        const explanation = await getAIConceptExplanation(topic, concept);

        return NextResponse.json({ success: true, explanation });
    } catch (err) {
        console.error('Topic explanation error:', err);
        return NextResponse.json({ error: 'Failed to generate concept explanation. Please check your AI API quota.' }, { status: 500 });
    }
}
