import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing with API key present:', Boolean(apiKey));
  const ai = new GoogleGenAI({ apiKey });

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];
  for (const m of candidateModels) {
    try {
      console.log(`Trying model: ${m}...`);
      const response = await ai.models.generateContent({
        model: m,
        contents: 'Respond with exactly: {"status": "ok"}',
      });
      console.log(`Success with ${m}:`, response.text?.trim?.() || response.text);
      return m;
    } catch (e) {
      console.log(`Failed with ${m}:`, e.message);
    }
  }
}

main().catch(console.error);
