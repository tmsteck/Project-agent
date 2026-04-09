import { useState, useEffect, useRef } from 'react'
import { callAgent, applyMutations } from '../lib/agent.js'

const QUICK_PROMPTS = [
  "What should I work on?",
  "I'm stuck on something",
  "Mark tasks as done",
  "Flag any quagmires",
]

export default function AgentChat({ projects, onProjectsUpdate, globalMode }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: globalMode
        ? "👋 I can see all your projects. Tell me what you've been working on, what's stuck, or ask **\"what should I work on?\"** and I'll help you prioritize across everything."
        : `Ready for a check-in on **${projects[0]?.name}**. Tell me what you worked on, what's stuck, or what's changed.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [flags, setFlags] = useState([])
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Build API history (skip the initial assistant greeting)
      const history = [...messages.slice(1), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const result = await callAgent(history, projects)

      if (result.mutations?.length) {
        const updated = applyMutations(projects, result.mutations)
        onProjectsUpdate(updated)
      }
      if (result.quagmireFlags?.length) {
        setFlags(result.quagmireFlags)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: result.message }])
    } catch (e) {
      setError(e.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080f1a' }}>
      {/* Quagmire flags */}
      {flags.map((f, i) => {
        const p = projects.find(x => x.id === f.projectId)
        return (
          <div
            key={i}
            style={{
              background: '#7f1d1d22',
              border: '1px solid #f8717140',
              borderRadius: 6,
              margin: '8px 12px 0',
              padding: '8px 12px',
              fontSize: 12,
              color: '#fca5a5',
            }}
          >
            ⚠️ <strong>{p?.name ?? f.projectId}</strong>: {f.warning}
            <button
              onClick={() => setFlags(prev => prev.filter((_, j) => j !== i))}
              style={{ float: 'right', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12 }}
            >
              ✕
            </button>
          </div>
        )
      })}

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#7f1d1d33', border: '1px solid #f87171', borderRadius: 6,
          margin: '8px 12px 0', padding: '8px 12px', fontSize: 12, color: '#fca5a5',
        }}>
          ⚠️ Agent error: {error}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="fade-up"
            style={{
              marginBottom: 14,
              display: 'flex',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              gap: 8,
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.role === 'user' ? '#1d4ed8' : '#1e293b',
                padding: '10px 14px',
                fontSize: 13.5,
                color: '#e2e8f0',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ background: '#1e293b', borderRadius: '12px 12px 12px 2px', padding: '12px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              <span className="dot-1" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />
              <span className="dot-2" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />
              <span className="dot-3" style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b', display: 'inline-block' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '4px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 20,
              color: '#64748b',
              fontSize: 11,
              padding: '3px 10px',
              cursor: 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 12px', display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Check in with the agent… (Enter to send, Shift+Enter for newline)"
          rows={2}
          style={{
            flex: 1,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#cbd5e1',
            fontSize: 13,
            padding: '8px 12px',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading}
          style={{
            background: loading ? '#1e3a8a' : '#3b82f6',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 20,
            padding: '0 14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            alignSelf: 'stretch',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
