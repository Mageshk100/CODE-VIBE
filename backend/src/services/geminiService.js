/**
 * Gemini AI Service
 * Wraps @google/generative-ai to generate structured code explanations
 * and contextual follow-up responses using real Gemini API.
 *
 * API key is loaded from GEMINI_API_KEY environment variable.
 * Never exposed to the frontend.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_MODEL = 'gemini-3.6-flash';

let genAI = null;
let model = null;

function getModel() {
  if (model) return model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  return model;
}

/**
 * Generate a structured 5-part explanation for a code snippet.
 * Returns a JSON object matching the existing explanation schema:
 * { overview, lineByLine, logicBreakdown, executionFlow, exampleWalkthrough }
 */
export async function generateExplanation(language, code) {
  const m = getModel();

  const prompt = `You are a world-class programming tutor specializing in explaining code clearly to students.

Analyze the following ${language} code and return ONLY valid JSON (no markdown, no backticks, no explanation outside JSON).

The JSON must match this exact structure:
{
  "overview": "2-3 sentence high-level summary of what the code does",
  "lineByLine": [
    {
      "lines": "Line X" or "Lines X-Y",
      "code": "the actual code snippet for this step",
      "explanation": "clear explanation of what this line/block does"
    }
  ],
  "logicBreakdown": [
    "**Concept Name**: explanation of an important logic concept used"
  ],
  "executionFlow": [
    "1. First step that happens at runtime",
    "2. Second step..."
  ],
  "exampleWalkthrough": {
    "input": "a concrete example input",
    "steps": [
      "Step 1: what happens with this input",
      "Step 2: ..."
    ],
    "output": "the final output"
  }
}

Rules:
- lineByLine must have 3-6 entries covering all important parts of the code
- logicBreakdown must have 3-5 bullet points
- executionFlow must have 4-7 numbered steps
- exampleWalkthrough.steps must have 2-5 steps
- Use markdown bold (**text**) only inside string values
- Do not truncate. Return complete valid JSON only.

Code to analyze (${language}):
\`\`\`${language}
${code}
\`\`\``;

  const result = await m.generateContent(prompt);
  const rawText = result.response.text().trim();

  // Strip any accidental markdown code fences
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned invalid JSON. Raw response: ' + cleaned.slice(0, 200));
  }

  // Validate required fields exist
  const required = ['overview', 'lineByLine', 'logicBreakdown', 'executionFlow', 'exampleWalkthrough'];
  for (const field of required) {
    if (!parsed[field]) {
      throw new Error(`Gemini response missing required field: ${field}`);
    }
  }

  return parsed;
}

/**
 * Generate a smart session title from code and language.
 */
export async function generateTitle(language, code) {
  const m = getModel();

  const prompt = `Generate a short, descriptive title (5 words max) for this ${language} code snippet.
Format: "${language.charAt(0).toUpperCase() + language.slice(1)} – <topic>"
Examples: "Python – Binary Search", "Java – Merge Sort", "JavaScript – Debounce Function"

Return ONLY the title string, nothing else.

Code:
\`\`\`${language}
${code.slice(0, 500)}
\`\`\``;

  const result = await m.generateContent(prompt);
  return result.response.text().trim().replace(/^["']|["']$/g, '');
}

/**
 * Generate a contextual follow-up response for a chat question about code.
 */
export async function generateChatResponse(question, code, language, conversationHistory = []) {
  const m = getModel();

  const historyContext = conversationHistory.length > 0
    ? '\n\nPrevious conversation:\n' + conversationHistory
        .slice(-6) // last 6 messages for context
        .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.message || m.text}`)
        .join('\n')
    : '';

  const prompt = `You are a programming tutor helping a student understand their code.

The student is studying this ${language} code:
\`\`\`${language}
${code}
\`\`\`
${historyContext}

Student's question: "${question}"

Provide a clear, helpful, educational answer. Use markdown formatting:
- Use **bold** for important terms
- Use \`backticks\` for code identifiers
- Use ### for section headers if needed
- Keep the response focused and concise (3-8 sentences or a short list)
- Do not repeat the full code back unless necessary`;

  const result = await m.generateContent(prompt);
  return result.response.text().trim();
}
