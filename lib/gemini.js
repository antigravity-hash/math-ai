import OpenAI from 'openai';

// We use the OpenAI SDK because Groq's API is fully OpenAI-compatible.
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
});

// We'll use Llama 3.3 70B for high-quality math reasoning
const MODEL = "llama-3.3-70b-versatile";

export async function solveMathProblem(problem) {
    const systemPrompt = `You are an expert mathematics tutor. Solve the given math problem with clear, numbered step-by-step explanations.

CRITICAL: You must respond ONLY with a valid JSON object, no markdown, no code blocks, just raw JSON.
Format:
{
  "problem": "the problem",
  "topic": "algebra|calculus|geometry|probability|trigonometry|linear-algebra",
  "conceptUsed": "Name of the core primary mathematical concept used",
  "conceptNotes": "A detailed 3-4 sentence explanation/mini-lesson about this concept so the student can learn it",
  "steps": [{"number": 1, "title": "Step title", "content": "Detailed explanation", "formula": "optional formula"}],
  "finalAnswer": "The final answer",
  "explanation": "Brief summary of the solution",
  "equation": "JavaScript-compatible equation for graphing if applicable (e.g., 'Math.pow(x, 2) + 5' or 'Math.sin(x)'). Use 'x' as variable. Return empty string if not plottable."
}`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Problem: ${problem}` }
        ],
        model: MODEL,
        response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content.trim();
    return JSON.parse(text);
}

export async function evaluateAnswer(problem, userAnswer, correctAnswer) {
    const prompt = `You are a math teacher evaluating a student's answer.
  
Problem: ${problem}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}

CRITICAL: Respond ONLY with valid JSON, no markdown, no code blocks:
{"correct":true/false,"feedback":"encouraging feedback 1-2 sentences","hint":"helpful hint if wrong, empty string if correct","explanation":"brief explanation of the approach"}

Accept mathematically equivalent answers as correct. Be encouraging.`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant that only outputs JSON." },
            { role: "user", content: prompt }
        ],
        model: MODEL,
        response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content.trim();
    return JSON.parse(text);
}

export async function getAIConceptExplanation(topic, concept) {
    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: `Explain "${concept}" in ${topic} mathematics in 3-4 clear sentences suitable for a high school or university student. Be concise and use simple language.` }],
        model: MODEL,
    });
    return completion.choices[0].message.content.trim();
}

export async function generatePracticeQuestion(topic, difficulty) {
    const prompt = `Generate a math practice question for the topic "${topic}" with difficulty "${difficulty}".
Difficulty Levels:
- Easy: Foundational concepts, basic calculations.
- Medium: Multi-step problems, requires application of formulas.
- Hard: Complex problems, may require synthesis of multiple concepts or advanced logic.

CRITICAL: Respond ONLY with valid JSON, no markdown:
{
  "question": "the math problem text",
  "correctAnswer": "the exact final answer (concise)",
  "steps": ["Step 1...", "Step 2..."],
  "hint": "helpful hint",
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "You are a professional math teacher generating unique practice problems." },
            { role: "user", content: prompt }
        ],
        model: MODEL,
        response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content.trim());
}

