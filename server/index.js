const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Simple POST /api/chat
// Environment variables:
// - PROVIDER: 'openai' | 'together' | 'generic' (optional)
// - AI_KEY: API key for the provider
// - PROVIDER_URL: For 'generic' or 'together', the full endpoint to proxy to
// - MODEL: (optional) model for OpenAI provider

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message required' });
  }

  const provider = (process.env.PROVIDER || 'mock').toLowerCase();

  try {
    if (provider === 'openai') {
      // Example for OpenAI Chat Completions
      const apiKey = process.env.AI_KEY;
      if (!apiKey) return res.status(500).json({ error: 'AI_KEY not configured on server' });

      const model = process.env.MODEL || 'gpt-4o-mini';
      const payload = {
        model,
        messages: [{ role: 'user', content: message }]
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      // Safely extract content from various possible shapes
      const reply = j?.choices?.[0]?.message?.content || j?.output || j?.reply || JSON.stringify(j);
      return res.json({ reply });
    }

    if (provider === 'together' || provider === 'generic') {
      const url = process.env.PROVIDER_URL;
      if (!url) return res.status(500).json({ error: 'PROVIDER_URL not configured' });
      const apiKey = process.env.AI_KEY;

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      // For generic endpoints we POST { input: message } by default
      const r = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ input: message })
      });
      const j = await r.json();
      const reply = j?.reply || j?.output || j?.result || j?.data || JSON.stringify(j);
      return res.json({ reply });
    }

    // Mock provider (no key) - for local dev/demo
    return res.json({ reply: `Demo assistant reply to: "${message}"` });
  } catch (err) {
    console.error('Proxy error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'AI proxy error', details: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI proxy listening on port ${port} (provider=${process.env.PROVIDER || 'mock'})`));
