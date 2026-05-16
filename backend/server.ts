import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// OpenRouter client
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Aura Resume Analyzer',
  },
});

// Use a model that is reliable with structured JSON output
const FREE_MODEL = 'deepseek/deepseek-v4-flash:free';

/**
 * Attempts to repair truncated or malformed JSON by closing all open
 * brackets/braces and quotes, then parsing again.
 */
function repairJSON(raw: string): string {
  let text = raw.trim();

  // Remove trailing commas before closing brackets (common AI mistake)
  text = text.replace(/,\s*([\]}])/g, '$1');

  // Track open structures
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
  }

  // Close any open string
  if (inString) text += '"';

  // Remove trailing comma before we close brackets
  text = text.replace(/,\s*$/, '');

  // Close all open structures in reverse order
  while (stack.length > 0) {
    text += stack.pop();
  }

  return text;
}

/**
 * Robustly extracts a JSON object from a raw AI string.
 * Handles: <think> blocks, markdown fences, leading/trailing text, truncated JSON.
 */
function extractJSON(raw: string): object {
  // 1. Strip <think>...</think> reasoning blocks (DeepSeek models)
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip markdown code fences ```json ... ```
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // 3. Find the first { to start of JSON object
  const startIdx = text.indexOf('{');
  if (startIdx > 0) {
    text = text.slice(startIdx);
  }

  // 4. Try to parse directly first
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Direct JSON parse failed, attempting repair...');
  }

  // 5. Try extracting the largest { ... } block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      console.warn('Block extraction parse failed, attempting JSON repair...');
      // 6. Attempt to repair and re-parse
      try {
        const repaired = repairJSON(match[0]);
        console.log('Repaired JSON (first 200):', repaired.slice(0, 200));
        return JSON.parse(repaired);
      } catch {
        console.warn('Repair failed on block, trying full text repair...');
      }
    }
  }

  // 7. Last resort: repair the full text
  try {
    const repaired = repairJSON(text);
    return JSON.parse(repaired);
  } catch {
    throw new Error(
      'Could not extract valid JSON from AI response. Raw (first 300 chars): ' + raw.slice(0, 300)
    );
  }
}

/**
 * Ensures the parsed AI data has all required fields with safe defaults.
 */
function sanitizeAnalysisData(data: Record<string, unknown>): Record<string, unknown> {
  return {
    atsScore: typeof data.atsScore === 'number' ? Math.max(0, Math.min(100, data.atsScore)) : 0,
    weakPoints: Array.isArray(data.weakPoints) ? data.weakPoints.slice(0, 5) : [],
    rewrittenBullets: Array.isArray(data.rewrittenBullets)
      ? (data.rewrittenBullets as Record<string, unknown>[])
          .filter((b) => b && typeof b === 'object' && 'original' in b && 'optimized' in b)
          .slice(0, 5)
      : [{ original: 'Could not parse bullets.', optimized: 'Please try re-uploading.' }],
    missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills.slice(0, 6) : [],
    skillGaps: Array.isArray(data.skillGaps)
      ? (data.skillGaps as Record<string, unknown>[])
          .filter(
            (g) =>
              g &&
              typeof g === 'object' &&
              'skillName' in g &&
              'userScore' in g &&
              'marketRequirement' in g
          )
          .slice(0, 6)
      : [{ skillName: 'General', userScore: 50, marketRequirement: 80 }],
    interviewQuestions: Array.isArray(data.interviewQuestions)
      ? data.interviewQuestions.slice(0, 6)
      : ['Could not generate questions. Please try again.'],
  };
}

// =====================
// POST /api/analyze
// =====================
app.post('/api/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded.' });
      return;
    }

    if (!process.env.OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY is missing in backend .env file.' });
      return;
    }

    const { targetRole, salary, workType } = req.body;

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    // Limit resume text to prevent token overflow (roughly 3000 chars ~ 750 tokens)
    const resumeText = (pdfData.text as string).slice(0, 3500);

    console.log(`\n📄 Analyzing resume for: "${targetRole}" | ${workType} | ${salary}`);
    console.log(`📝 Resume text length: ${resumeText.length} chars`);

    const completion = await client.chat.completions.create({
      model: FREE_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS resume analyzer. Respond ONLY with a single valid JSON object. No markdown, no code fences, no explanation text.

Required JSON schema (keep arrays SHORT - max 4 items each to ensure valid JSON output):
{
  "atsScore": <integer 0-100>,
  "weakPoints": ["string1", "string2", "string3"],
  "rewrittenBullets": [
    {"original": "string", "optimized": "string"},
    {"original": "string", "optimized": "string"},
    {"original": "string", "optimized": "string"}
  ],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "skillGaps": [
    {"skillName": "string", "userScore": <0-100>, "marketRequirement": <0-100>},
    {"skillName": "string", "userScore": <0-100>, "marketRequirement": <0-100>},
    {"skillName": "string", "userScore": <0-100>, "marketRequirement": <0-100>}
  ],
  "interviewQuestions": ["question1", "question2", "question3", "question4"]
}`,
        },
        {
          role: 'user',
          content: `Analyze this resume for the role: ${targetRole || 'Software Engineer'}
Work Type: ${workType || 'remote'}
Expected Salary: ${salary || 'Not specified'}

Resume text:
${resumeText}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    console.log('\n🤖 Raw AI response (first 500 chars):');
    console.log(raw.slice(0, 500));
    console.log('...\n');

    let parsedData: Record<string, unknown>;
    try {
      parsedData = extractJSON(raw) as Record<string, unknown>;
    } catch (parseError) {
      console.error('❌ JSON extraction completely failed:', (parseError as Error).message);
      // Return a graceful fallback instead of crashing
      parsedData = {
        atsScore: 0,
        weakPoints: ['AI response could not be parsed. Please try again.'],
        rewrittenBullets: [{ original: 'Parse error', optimized: 'Please re-upload your resume.' }],
        missingSkills: [],
        skillGaps: [{ skillName: 'General Skills', userScore: 40, marketRequirement: 80 }],
        interviewQuestions: ['Please try re-uploading your resume for a full analysis.'],
      };
    }

    const safeData = sanitizeAnalysisData(parsedData);
    console.log('✅ Analysis complete. ATS Score:', safeData.atsScore);
    res.json(safeData);

  } catch (error) {
    console.error('❌ Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume. ' + (error as Error).message });
  }
});

// =====================
// POST /api/cover-letter
// =====================
app.post('/api/cover-letter', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY is missing in backend .env file.' });
      return;
    }

    const { targetRole, company, resumeText } = req.body;

    const completion = await client.chat.completions.create({
      model: FREE_MODEL,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: 'You are an elite career coach. Write a highly tailored, impactful cover letter. Return only the cover letter text, no extra commentary.',
        },
        {
          role: 'user',
          content: `Job Title: ${targetRole}\nCompany: ${company}\n\nResume:\n${(resumeText as string || '').slice(0, 2000)}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || '';
    // Strip any <think> blocks from cover letter too
    const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    res.json({ coverLetter: cleaned });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter. ' + (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port} | Model: ${FREE_MODEL}`);
});
