import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import TodoItem from './TodoItem.jsx'
import { now, fmtDate, STATUS_META } from '../lib/utils.js'

export default function ProjectPanel({ project, onUpdate }) {
  const [newTodo, setNewTodo] = useState('')

  const addTodo = () => {
    if (!newTodo.trim()) return
    const todo = { id: `t${Date.now()}`, text: newTodo.trim(), done: false, added: now() }
    onUpdate({ ...project, todos: [...project.todos, todo] })
    setNewTodo('')
  }

  const toggleTodo = (id) =>
    onUpdate({ ...project, todos: project.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) })

  const deleteTodo = (id) =>
    onUpdate({ ...project, todos: project.todos.filter(t => t.id !== id) })

  const cycleStatus = () => {
    const order = Object.keys(STATUS_META)
    const next = order[(order.indexOf(project.status) + 1) % order.length]
    onUpdate({ ...project, status: next })
  }

  const open = project.todos.filter(t => !t.done)
  const done = project.todos.filter(t => t.done)

  return (
    <div className="fade-up project-panel" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <h2 style={{
          margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9',
          fontFamily: "'Playfair Display', serif", lineHeight: 1.3,
        }}>
          {project.name}
        </h2>
        <StatusBadge status={project.status} onClick={cycleStatus} />
      </div>

      {/* Summary */}
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 8, padding: '14px 16px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#64748b', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
          Project Summary
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.65 }}>
          {project.summary}
        </p>
      </div>

      {/* Open todos */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#64748b', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
          Open Tasks ({open.length})
        </div>
        {open.length === 0 && (
          <p style={{ color: '#334155', fontSize: 13, fontStyle: 'italic' }}>
            No open tasks. Add one below or ask the agent.
          </p>
        )}
        {open.map(t => (
          <TodoItem key={t.id} todo={t} onToggle={() => toggleTodo(t.id)} onDelete={() => deleteTodo(t.id)} />
        ))}
      </div>

      {/* Add todo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <input
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          style={{
            flex: 1, background: '#0f172a', border: '1px solid #334155',
            borderRadius: 6, color: '#cbd5e1', fontSize: 13, padding: '8px 12px', outline: 'none',
          }}
        />
        <button
          onClick={addTodo}
          style={{
            background: '#3b82f6', border: 'none', borderRadius: 6,
            color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 16px', cursor: 'pointer',
          }}
        >
          + Add
        </button>
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#334155', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
            Completed ({done.length})
          </div>
          {done.map(t => (
            <TodoItem key={t.id} todo={t} onToggle={() => toggleTodo(t.id)} onDelete={() => deleteTodo(t.id)} />
          ))}
        </div>
      )}

      {/* Activity log */}
      {project.log?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#334155', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
            Activity Log
          </div>
          {[...project.log].reverse().slice(0, 10).map((e, i) => (
            <div key={i} style={{
              fontSize: 12, color: '#475569', padding: '5px 0',
              borderBottom: '1px solid #0f172a',
            }}>
              <span style={{ color: '#334155' }}>{fmtDate(e.ts)}</span> — {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
