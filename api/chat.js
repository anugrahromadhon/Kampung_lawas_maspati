// Vercel Serverless Function — Proxy ke lokal Ollama via ngrok
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, gunakan POST.' });
  }

  const { messages, model } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Body request harus berisi array "messages".' });
  }

  try {
    // Memanggil URL ngrok dari server Vercel (Bebas CORS!)
    const ollamaRes = await fetch('https://reliably-clapper-generic.ngrok-free.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header ini ditaruh di sini agar aman dan tidak memicu error di browser
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        model: model || 'qwen2.5:3b',
        messages
      })
    });

    const data = await ollamaRes.json();
    return res.status(ollamaRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal menghubungi PC Lokal via ngrok.' });
  }
};