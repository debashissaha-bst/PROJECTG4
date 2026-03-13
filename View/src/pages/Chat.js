import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'

const Chat = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !user) return

    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ message: text })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to get response')
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'No response.' }
      ])
    } catch (err) {
      setError(err.message || 'Network error')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <p>You must be logged in to use the chatbot.</p>
  }

  return (
    <div className="chat-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Ai Cooking Assistant</h2>
        <button type="button" className="chat-close-button" onClick={() => navigate(-1)}>
          ×
        </button>
      </div>
      <p className="chat-subtitle">Powered by Llama 3.1 8B</p>

      {error && <div className="error">{error}</div>}

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-placeholder">Send a message to start the conversation.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble-assistant chat-loading">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat
