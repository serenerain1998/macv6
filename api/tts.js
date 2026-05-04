// /api/tts — ElevenLabs text-to-speech proxy. Streams MP3 bytes back to the
// client as they arrive from the upstream. Supports GET (?text=...) for use
// as an <audio src=...> source and POST (JSON body) for fetch().

const TTS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 50_000) reject(new Error('payload too large'));
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

async function streamTts(text, res) {
  const trimmed = String(text).trim().slice(0, 1500);
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const isV3 = TTS_MODEL_ID === 'eleven_v3';
  const latencyParam = isV3 ? '' : '&optimize_streaming_latency=3';

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128${latencyParam}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: TTS_MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!upstream.ok) {
    const errText = await upstream.text();
    console.error('[tts] elevenlabs error:', upstream.status, errText.slice(0, 300));
    if (!res.headersSent) res.status(502).json({ error: 'tts upstream failed' });
    return;
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const reader = upstream.body.getReader();
  res.on('close', () => {
    try {
      reader.cancel();
    } catch (_) { /* noop */ }
  });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

module.exports = async (req, res) => {
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
    res.status(503).json({ error: 'TTS service not configured' });
    return;
  }

  let text;
  if (req.method === 'GET') {
    text = typeof req.query?.text === 'string' ? req.query.text : '';
  } else if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      text = typeof body.text === 'string' ? body.text : '';
    } catch {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }
  } else {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'text required' });
    return;
  }

  try {
    await streamTts(text, res);
  } catch (err) {
    console.error('[tts] error:', err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: 'tts failed' });
    else res.end();
  }
};
