import { useState } from 'react'

const SESSION_KEY = 'researchos_auth'
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

export function isAuthenticated() {
  if (!APP_PASSWORD) return true          // no password configured → open
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export default function LoginGate({ children }) {
  const [authed, setAuthed] = useState(isAuthenticated)
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)

  if (authed) return children

  function submit(e) {
    e.preventDefault()
    if (input === APP_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
    } else {
      setError(true)
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080f1a',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <form
        onSubmit={submit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 320,
          padding: '32px 28px',
          background: '#0a1628',
          border: '1px solid #1e293b',
          borderRadius: 8,
          animation: shake ? 'shake 0.4s ease' : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>⚛</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', fontFamily: "'Playfair Display', serif" }}>
            Research OS
          </span>
        </div>

        <label style={{ fontSize: 11, color: '#64748b' }}>
          Password
        </label>

        <input
          autoFocus
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          placeholder="enter password"
          style={{
            background: '#0f1f35',
            border: `1px solid ${error ? '#f87171' : '#1e293b'}`,
            borderRadius: 4,
            padding: '8px 10px',
            color: '#e2e8f0',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
        />

        {error && (
          <div style={{ fontSize: 11, color: '#f87171', marginTop: -8 }}>
            Incorrect password
          </div>
        )}

        <button
          type="submit"
          style={{
            background: '#1e3a5f',
            border: '1px solid #2d5a8e',
            borderRadius: 4,
            padding: '8px 0',
            color: '#93c5fd',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Unlock →
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
