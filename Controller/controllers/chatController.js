// Use :fastest so the router picks an available provider; remove suffix if you want a specific one
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct:fastest'
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/responses'

const chatWithAI = async (req, res) => {
  const { message } = req.body
  const token = process.env.HUGGINGFACE_TOKEN

  if (!token) {
    return res.status(503).json({
      error: 'Chat service not configured. Set HUGGINGFACE_TOKEN in controller/.env'
    })
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    const response = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        instructions: 'You are a helpful assistant.',
        input: message.trim()
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      let errMessage = 'Hugging Face API error'
      try {
        const errJson = JSON.parse(errText)
        if (errJson.error) errMessage = errJson.error
      } catch (_) {}
      return res.status(response.status).json({ error: errMessage })
    }

    const data = await response.json()

    let reply = ''
    if (data.output_text && String(data.output_text).trim()) {
      reply = String(data.output_text).trim()
    } else if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content) {
          const parts = Array.isArray(item.content) ? item.content : [item.content]
          for (const part of parts) {
            if (part && (part.text || part.type === 'output_text')) {
              const t = part.text || part.content
              if (t && String(t).trim()) reply += String(t).trim()
            }
          }
        }
        if (item.text && String(item.text).trim()) reply += String(item.text).trim()
      }
      reply = reply.trim()
    } else if (data.choices && data.choices[0] && data.choices[0].message) {
      reply = (data.choices[0].message.content || '').trim()
    } else if (data.response && data.response.output) {
      const out = data.response.output
      const items = Array.isArray(out) ? out : [out]
      for (const o of items) {
        if (o && o.text) reply += String(o.text)
      }
      reply = reply.trim()
    }

    if (!reply) {
      console.error('Chat API unexpected response shape:', JSON.stringify(data).slice(0, 500))
      return res.status(502).json({
        error: 'AI returned no text. The model may be loading or unavailable. Try again in a moment.'
      })
    }

    res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat API error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to get AI response' })
  }
}

module.exports = { chatWithAI }
