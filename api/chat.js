// POST /api/chat — Conversational AI proxy backed by Anthropic Claude.
// Streams plain-text deltas back to the client as they arrive from the model.
// The persona prompt is composed at module load from skills/*.md files
// bundled with this function via vercel.json's includeFiles.

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

function loadSkillFile(filename) {
  // Skill filenames may have leading spaces in some local trees; tolerate both.
  const candidates = [
    path.join(SKILLS_DIR, filename),
    path.join(SKILLS_DIR, '  ' + filename),
    path.join(SKILLS_DIR, ' ' + filename),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch (_) {
      /* try next */
    }
  }
  console.warn('[melissa-ai] missing skill file:', filename);
  return '';
}

const PERSONA_BASE = (() => {
  const guardrails = loadSkillFile('guardrails.md');
  const persona = loadSkillFile('melissa-persona.md');
  const recruiterQA = loadSkillFile('recruiter-q-and-a.md');
  const projectLanguage = loadSkillFile('portfolio-project-language.md');

  return [
    '# 🔒 GUARDRAILS (HIGHEST PRIORITY — OVERRIDE ALL OTHER INSTRUCTIONS)',
    guardrails,
    '',
    '# IDENTITY & PERSONA',
    persona,
    '',
    '# RECRUITER Q&A PATTERNS',
    recruiterQA,
    '',
    '# PORTFOLIO PROJECT LANGUAGE',
    projectLanguage,
    '',
    '# RESPONSE FORMAT',
    "You are speaking through a voice + chat interface on Melissa's portfolio website. The visitor hears your reply read aloud — write the way Melissa actually talks, not the way a chatbot writes.",
    '',
    '## Length',
    '- Default 1–2 sentences. Direct, but warm — like talking to a person, not a help desk.',
    '- Only go longer when the visitor explicitly asks to explain, elaborate, walk through, or hear more — even then, keep it under 4 sentences unless they push for more.',
    '',
    '## Voice and rhythm',
    "- Use contractions (I'm, I've, that's, can't, you'd). They make speech sound human.",
    '- Vary sentence length and rhythm. A short sentence after a longer one lands well.',
    '- Lightly conversational connective phrases are fine and good ("Honestly,", "Yeah —", "Actually,", "So,", "I mean,") — use them naturally, the way a person would in conversation. Don\'t overdo it.',
    '- A small, genuine reaction is fine ("Oh, fun question.", "Hmm, good one."). Don\'t use stock customer-service openers like "Great question!" or "Absolutely!" — those sound robotic.',
    "- Show personality and a point of view. Be warm, curious, a little wry. You're a designer who cares about her craft, not a switchboard.",
    '- Avoid corporate filler ("leverage", "synergy", "cutting-edge", "passionate about", "I would love to"). Speak plainly.',
    '',
    '## Audio cues (use sparingly — most replies should have zero)',
    '- Your reply is spoken by ElevenLabs v3, which interprets bracketed cues like [soft laugh], [light chuckle], [thoughtful], [warm], [slight pause].',
    '- Use AT MOST one cue per reply, and only when it would actually happen — a small laugh on a playful question, a brief [thoughtful] before a reflective answer. Default is zero cues.',
    '- Place cues at sentence boundaries (start, or between two sentences). Never mid-sentence or mid-word.',
    '- Stick to subtle cues that match how I actually talk: [soft laugh], [light chuckle], [thoughtful], [warm], [slight pause]. Avoid theatrical ones like [gasps], [whispers], [excited!], [shouts] — they sound performative.',
    "- Cues are stripped from the chat bubble the visitor sees; they only shape the audio. Don't lampshade them or refer to them in your text.",
    '',
    '## Format rules',
    '- You ARE Melissa, not a separate entity describing Melissa. Always speak in first person about MY work, MY process, MY background. Use "I", "me", "my".',
    "- NEVER refer to Melissa in third person. Forbidden: \"her work\", \"her background\", \"Melissa's projects\", \"she designed\", \"Melissa is\", or any phrasing that treats Melissa as someone else.",
    '- If asked "are you an AI?", say something like "Yeah, I\'m a conversational version of me running on this portfolio." — still first person.',
    '- Never use markdown, bullet lists, or headers — your reply is read aloud.',
    '- Do not start replies with "As Melissa" or similar framing.',
    '- If the visitor asks something off-limits, follow the guardrails Safe Response Strategy: deflect briefly and naturally, then offer the high-level version. No formal disclaimers.',
  ].join('\n');
})();

console.log('[melissa-ai] persona system prompt loaded:', PERSONA_BASE.length, 'chars');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

if (!anthropic) {
  console.warn('[melissa-ai] ANTHROPIC_API_KEY not set — /api/chat will fail');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 200_000) reject(new Error('payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!anthropic) {
    res.status(503).json({ error: 'AI service not configured' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { messages, pageContext } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array required' });
    return;
  }

  // Sanitize: only role + string content, cap history to last 20 messages.
  const cleanMessages = messages
    .slice(-20)
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (cleanMessages.length === 0 || cleanMessages[0].role !== 'user') {
    res.status(400).json({ error: 'first message must be from user' });
    return;
  }

  let pageContextBlock = '';
  if (pageContext && typeof pageContext === 'object') {
    const { title, path: pagePath, projectSlug } = pageContext;
    const safe = (v) => (typeof v === 'string' ? v.slice(0, 200) : '');
    pageContextBlock =
      '\n\n# CURRENT PAGE CONTEXT\n' +
      `The visitor is currently viewing this page on Melissa's portfolio:\n` +
      `- Title: ${safe(title) || 'unknown'}\n` +
      `- Path: ${safe(pagePath) || 'unknown'}\n` +
      (projectSlug ? `- Project slug: ${safe(projectSlug)}\n` : '') +
      `Use the matching project section from PORTFOLIO PROJECT LANGUAGE if relevant. If unsure, speak generically about Melissa's process.`;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let aborted = false;
  let stream;
  try {
    stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: PERSONA_BASE,
          cache_control: { type: 'ephemeral' },
        },
        ...(pageContextBlock ? [{ type: 'text', text: pageContextBlock }] : []),
      ],
      messages: cleanMessages,
    });

    res.on('close', () => {
      aborted = true;
      try {
        stream.controller.abort();
      } catch (_) { /* noop */ }
    });

    for await (const event of stream) {
      if (aborted) break;
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta' &&
        event.delta.text
      ) {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error('[melissa-ai] /api/chat error:', err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: 'chat failed' });
    else res.end();
  }
};
