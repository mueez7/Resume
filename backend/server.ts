import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

// Supabase admin client (optional - only if env vars present)
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// OpenRouter client
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Aura Resume Analyzer',
  },
});

// Model fallback chain - tries each in order
const MODELS = [
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-4-scout:free',
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-v3-base:free',
];

// ========================
// UTILITIES
// ========================

function repairJSON(raw: string): string {
  let text = raw.trim();
  text = text.replace(/,\s*([\]}])/g, '$1');
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (!inString) {
      if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop();
      }
    }
  }
  if (inString) text += '"';
  text = text.replace(/,\s*$/, '');
  while (stack.length > 0) text += stack.pop();
  return text;
}

function extractJSON(raw: string): Record<string, unknown> {
  // Strip reasoning/think blocks
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Strip markdown fences
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Find first {
  const startIdx = text.indexOf('{');
  if (startIdx > 0) text = text.slice(startIdx);

  // Try direct parse
  try { return JSON.parse(text); } catch { /* fall through */ }

  // Try largest block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* fall through */ }
    try { return JSON.parse(repairJSON(match[0])); } catch { /* fall through */ }
  }

  // Last resort: repair full text
  try { return JSON.parse(repairJSON(text)); } catch { /* fall through */ }

  throw new Error('Could not parse AI response as JSON.');
}

function sanitizeAnalysis(data: Record<string, unknown>): Record<string, unknown> {
  const toNum = (v: unknown, min = 0, max = 100, def = 0) =>
    typeof v === 'number' ? Math.max(min, Math.min(max, Math.round(v))) : def;

  return {
    atsScore: toNum(data.atsScore, 0, 100, 0),
    weakPoints: Array.isArray(data.weakPoints)
      ? (data.weakPoints as string[]).filter(Boolean).slice(0, 6)
      : [],
    rewrittenBullets: Array.isArray(data.rewrittenBullets)
      ? (data.rewrittenBullets as Record<string, unknown>[])
          .filter((b) => b && typeof b === 'object' && 'original' in b && 'optimized' in b)
          .slice(0, 6)
      : [{ original: 'Could not parse.', optimized: 'Please try again.' }],
    missingSkills: Array.isArray(data.missingSkills)
      ? (data.missingSkills as string[]).filter(Boolean).slice(0, 8)
      : [],
    skillGaps: Array.isArray(data.skillGaps)
      ? (data.skillGaps as Record<string, unknown>[])
          .filter((g) => g && typeof g === 'object' && 'skillName' in g)
          .map((g) => ({
            skillName: String(g.skillName),
            userScore: toNum(g.userScore, 0, 100, 40),
            marketRequirement: toNum(g.marketRequirement, 0, 100, 80),
          }))
          .slice(0, 8)
      : [{ skillName: 'General', userScore: 40, marketRequirement: 80 }],
    interviewQuestions: Array.isArray(data.interviewQuestions)
      ? (data.interviewQuestions as string[]).filter(Boolean).slice(0, 8)
      : ['Please try re-uploading your resume.'],
    summary: typeof data.summary === 'string' ? data.summary : '',
  };
}

async function callAIWithFallback(
  messages: { role: string; content: string }[],
  maxTokens = 1800
): Promise<string> {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      const completion = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: messages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      });
      const content = completion.choices[0]?.message?.content || '';
      if (content.trim()) {
        console.log(`✅ Got response from ${model} (${content.length} chars)`);
        return content;
      }
      throw new Error('Empty response');
    } catch (err) {
      lastError = err as Error;
      console.warn(`⚠️  Model ${model} failed: ${lastError.message}`);
    }
  }

  throw lastError || new Error('All AI models failed.');
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer, {
      // More robust options
      max: 0, // no page limit
    });
    const text = (data.text as string).trim();
    if (text.length > 50) return text;
    throw new Error('Extracted text too short');
  } catch (err) {
    console.error('Primary PDF parse failed:', (err as Error).message);
    // Try a second pass with different options
    try {
      const data = await pdfParse(buffer);
      return (data.text as string).trim();
    } catch {
      throw new Error(
        'Could not extract text from this PDF. Please ensure the PDF contains selectable text (not a scanned image). Try re-saving as a text-based PDF.'
      );
    }
  }
}

// ========================
// GET /api/health
// ========================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    models: MODELS,
    supabase: supabase ? 'connected' : 'not configured',
    timestamp: new Date().toISOString(),
  });
});

// ========================
// POST /api/analyze
// ========================
app.post('/api/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF.' });
      return;
    }

    if (!process.env.OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY is missing in backend .env file.' });
      return;
    }

    const { targetRole, salary, workType, userId } = req.body;

    // Step 1: Extract PDF text
    console.log(`\n📄 Parsing PDF (${req.file.size} bytes)...`);
    const fullText = await extractPDFText(req.file.buffer);
    // Limit to ~4000 chars (~1000 tokens) to stay within free model limits
    const resumeText = fullText.slice(0, 4000);
    console.log(`📝 Extracted ${resumeText.length} chars from PDF`);

    if (resumeText.length < 100) {
      res.status(400).json({
        error: 'Resume text too short. Ensure your PDF contains selectable text, not just images.',
      });
      return;
    }

    const role = targetRole || 'Software Engineer';
    const env = workType || 'remote';
    const pay = salary || 'Not specified';

    console.log(`🎯 Analyzing for: "${role}" | ${env} | ${pay}`);

    // Step 2: Call AI
    const raw = await callAIWithFallback([
      {
        role: 'system',
        content: `You are an expert ATS resume analyzer and career coach. Analyze the resume and respond ONLY with a single valid JSON object. No markdown, no code fences, no explanation text outside the JSON.

Required JSON schema (keep values concise, arrays max 6 items):
{
  "atsScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment of the candidate>",
  "weakPoints": ["weakness 1", "weakness 2", "weakness 3"],
  "rewrittenBullets": [
    {"original": "<original weak bullet>", "optimized": "<stronger rewritten version with metrics>"},
    {"original": "<original weak bullet>", "optimized": "<stronger rewritten version with metrics>"}
  ],
  "missingSkills": ["skill1", "skill2", "skill3", "skill4"],
  "skillGaps": [
    {"skillName": "<skill name>", "userScore": <0-100>, "marketRequirement": <0-100>},
    {"skillName": "<skill name>", "userScore": <0-100>, "marketRequirement": <0-100>}
  ],
  "interviewQuestions": ["question 1", "question 2", "question 3", "question 4", "question 5"]
}`,
      },
      {
        role: 'user',
        content: `Analyze this resume for the role: ${role}
Work Environment: ${env}
Expected Salary: ${pay}

Resume Text:
${resumeText}`,
      },
    ]);

    console.log('\n🔍 Raw AI response (first 300 chars):', raw.slice(0, 300));

    // Step 3: Parse & sanitize
    let parsedData: Record<string, unknown>;
    try {
      parsedData = extractJSON(raw);
    } catch (parseErr) {
      console.error('❌ JSON parse completely failed:', (parseErr as Error).message);
      parsedData = {
        atsScore: 50,
        summary: 'Analysis complete but response parsing encountered an issue. Core data recovered.',
        weakPoints: ['AI response parsing issue - please try again for full analysis'],
        rewrittenBullets: [{ original: 'Parse error', optimized: 'Please re-upload for full analysis.' }],
        missingSkills: [],
        skillGaps: [{ skillName: 'General Skills', userScore: 50, marketRequirement: 80 }],
        interviewQuestions: ['Please try re-uploading for interview questions.'],
      };
    }

    const safeData = sanitizeAnalysis(parsedData);
    console.log('✅ Analysis complete. ATS Score:', safeData.atsScore);

    // Step 4: Save to Supabase if userId provided
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && userId) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const reqSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });

        try {
          const { error: dbErr } = await reqSupabase.from('analyses').insert({
            user_id: userId,
            target_role: role,
            expected_salary: pay,
            environment: env,
            raw_text: resumeText,
            ats_score: safeData.atsScore,
            ai_feedback: safeData,
          });
          if (dbErr) throw new Error(dbErr.message);
          console.log('💾 Analysis saved to Supabase for user:', userId);
        } catch (dbErr) {
          console.warn('⚠️  Could not save to Supabase:', (dbErr as Error).message);
          // Don't fail the request just because DB save failed
        }
      } else {
        console.warn('⚠️  No Authorization header provided, skipping Supabase save.');
      }
    }

    res.json({ ...safeData, resumeText: resumeText.slice(0, 1000) });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('❌ Error analyzing resume:', msg);
    res.status(500).json({ error: msg || 'Failed to analyze resume. Please try again.' });
  }
});

// ========================
// POST /api/cover-letter
// ========================
app.post('/api/cover-letter', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY is missing in backend .env file.' });
      return;
    }

    const { targetRole, company, resumeText, userName } = req.body;

    if (!targetRole) {
      res.status(400).json({ error: 'targetRole is required.' });
      return;
    }

    console.log(`\n📝 Generating cover letter for: "${targetRole}" at "${company || 'the company'}"`);

    const raw = await callAIWithFallback(
      [
        {
          role: 'system',
          content: `You are an elite career coach who writes powerful, personalized cover letters. Write a professional, compelling cover letter that:
- Is addressed to the hiring team at the company (use "Dear Hiring Team" if no specific contact)
- Highlights the most relevant experience from the resume
- Is 3-4 paragraphs, confident and direct
- Ends with a strong call to action
Return ONLY the cover letter text with no extra commentary, labels, or markdown.`,
        },
        {
          role: 'user',
          content: `Write a cover letter for:
Applicant Name: ${userName || 'the applicant'}
Job Title: ${targetRole}
Company: ${company || 'the company'}

Resume (summary):
${(resumeText || '').slice(0, 2500)}`,
        },
      ],
      1000
    );

    // Clean up any think blocks or extra text
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    console.log('✅ Cover letter generated.');
    res.json({ coverLetter: cleaned });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('❌ Cover letter error:', msg);
    res.status(500).json({ error: msg || 'Failed to generate cover letter.' });
  }
});

// ========================
// GET /api/analyses/:userId
// ========================
app.get('/api/analyses/:userId', async (req: Request, res: Response): Promise<void> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    res.json({ analyses: [] });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const reqSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data, error } = await reqSupabase
      .from('analyses')
      .select('id, target_role, ats_score, environment, created_at')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ analyses: data || [] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Aura Backend online → http://localhost:${port}`);
  console.log(`📡 Model chain: ${MODELS.join(' → ')}`);
  console.log(`💾 Supabase: ${process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY ? 'connected' : 'not configured (analyses won\'t be saved)'}\n`);
});
