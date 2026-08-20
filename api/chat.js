// Vercel Serverless Function — proxy aman ke Groq API.
// GROQ_API_KEY dibaca dari Environment Variable di server, TIDAK PERNAH dikirim ke browser.
// Endpoint ini otomatis aktif di: https://<domain-vercel-kalian>/api/chat

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, gunakan POST.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GROQ_API_KEY belum diset di Environment Variables Vercel. Buka Project Settings → Environment Variables.'
    });
  }

  const { messages, model } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Body request harus berisi array "messages".' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'groq/compound',
        max_tokens: 400,
        messages
      })
    });

    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal menghubungi Groq API.' });
  }
};
