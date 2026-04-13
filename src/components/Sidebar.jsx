import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import { DEFAULT_PROJECT_SUMMARY, STATUS_META } from '../lib/utils.js'

export default function Sidebar({ projects, selectedId, view, onSelect, onViewChange, onAdd, onDelete, onGlobalAgent, isOpen, onClose }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), summary: summary.trim() || DEFAULT_PROJECT_SUMMARY })
    setName(''); setSummary(''); setShowForm(false)
  }

  return (
    <div className={`sidebar-drawer${isOpen ? ' open' : ''}`} style={{
      width: 248,
      background: '#0a1628',
      borderRight: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo + mobile close button */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
            Research Tracker
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>PhD Project Tracker</div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
      </div>

      {/* Global agent */}
      <button
        onClick={onGlobalAgent}
        style={{
          margin: '10px 10px 4px',
          padding: '8px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          background: view === 'global-agent' ? '#1d4ed820' : 'transparent',
          border: view === 'global-agent' ? '1px solid #3b82f660' : '1px solid #1e293b',
          color: view === 'global-agent' ? '#60a5fa' : '#64748b',
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'left',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        🧠 All Projects Agent
      </button>

      <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#334155', fontWeight: 700, padding: '10px 16px 6px', textTransform: 'uppercase' }}>
        Projects
      </div>

      {/* Project list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {projects.map(p => {
          const isActive = selectedId === p.id && view !== 'global-agent'
          const m = STATUS_META[p.status] ?? STATUS_META.active
          return (
            <div
              key={p.id}
              style={{
                margin: '2px 8px',
                borderRadius: 6,
                background: isActive ? '#1e293b' : 'transparent',
                border: isActive ? '1px solid #334155' : '1px solid transparent',
              }}
            >
              <button
                onClick={() => { onSelect(p.id); onViewChange('project') }}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: m.color, fontSize: 8 }}>{m.dot}</span>
                  <span style={{
                    fontSize: 12,
                    color: isActive ? '#f1f5f9' : '#94a3b8',
                    fontWeight: isActive ? 700 : 400,
                    lineHeight: 1.3,
                  }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#475569', paddingLeft: 14 }}>
                  {p.todos.filter(t => !t.done).length} open tasks
                </div>
              </button>

              {isActive && (
                <div style={{ display: 'flex', gap: 2, padding: '0 8px 6px' }}>
                  {['project', 'agent'].map(v => (
                    <button
                      key={v}
                      onClick={() => onViewChange(v)}
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: '3px 0',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: view === v ? '#3b82f6' : '#0f172a',
                        border: '1px solid #334155',
                        color: view === v ? '#fff' : '#64748b',
                        textTransform: 'capitalize',
                      }}
                    >
                      {v === 'project' ? 'Tasks' : 'Agent'}
                    </button>
                  ))}
                  <button
                    onClick={() => onDelete(p.id)}
                    title="Delete project"
                    style={{
                      fontSize: 10,
                      padding: '3px 6px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#475569',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add project */}
      <div style={{ padding: 10, borderTop: '1px solid #1e293b' }}>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px dashed #334155',
              borderRadius: 6,
              color: '#475569',
              fontSize: 12,
              padding: 8,
              cursor: 'pointer',
            }}
          >
            + New Project
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Project name"
              autoFocus
              style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
                color: '#cbd5e1', fontSize: 12, padding: '6px 8px', outline: 'none',
              }}
            />
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief summary (optional)"
              rows={2}
              style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
                color: '#cbd5e1', fontSize: 12, padding: '6px 8px', outline: 'none', resize: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleAdd}
                style={{
                  flex: 1, background: '#3b82f6', border: 'none', borderRadius: 5,
                  color: '#fff', fontSize: 12, padding: 6, cursor: 'pointer',
                }}
              >
                Create
              </button>
              <button
                onClick={() => { setShowForm(false); setName(''); setSummary('') }}
                style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
                  color: '#64748b', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
