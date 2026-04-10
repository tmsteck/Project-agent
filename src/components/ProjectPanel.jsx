import { useEffect, useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import TodoItem from './TodoItem.jsx'
import { now, fmtDate, STATUS_META } from '../lib/utils.js'

export default function ProjectPanel({ project, onUpdate }) {
  const [newTodo, setNewTodo] = useState('')
  const [newLogEntry, setNewLogEntry] = useState('')
  const [editingProjectText, setEditingProjectText] = useState(false)
  const [draftName, setDraftName] = useState(project.name)
  const [draftSummary, setDraftSummary] = useState(project.summary)

  useEffect(() => {
    setDraftName(project.name)
    setDraftSummary(project.summary)
    setEditingProjectText(false)
  }, [project.id, project.name, project.summary])

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

  const editTodoText = (id, text) =>
    onUpdate({
      ...project,
      todos: project.todos.map(t => t.id === id ? { ...t, text } : t),
    })

  const cycleStatus = () => {
    const order = Object.keys(STATUS_META)
    const next = order[(order.indexOf(project.status) + 1) % order.length]
    onUpdate({ ...project, status: next })
  }

  const saveProjectText = () => {
    const name = draftName.trim()
    const summary = draftSummary.trim()
    if (!name) return
    onUpdate({ ...project, name, summary: summary || 'New project.' })
    setEditingProjectText(false)
  }

  const cancelProjectText = () => {
    setDraftName(project.name)
    setDraftSummary(project.summary)
    setEditingProjectText(false)
  }

  const addLogEntry = () => {
    const text = newLogEntry.trim()
    if (!text) return
    onUpdate({
      ...project,
      log: [...(project.log ?? []), { ts: now(), text }],
    })
    setNewLogEntry('')
  }

  const open = project.todos.filter(t => !t.done)
  const done = project.todos.filter(t => t.done)

  return (
    <div className="fade-up project-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        {editingProjectText ? (
          <input
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            style={{
              margin: 0,
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#f1f5f9',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.3,
              padding: '8px 10px',
              outline: 'none',
            }}
          />
        ) : (
          <h2 style={{
            margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9',
            fontFamily: "'Playfair Display', serif", lineHeight: 1.3,
          }}>
            {project.name}
          </h2>
        )}
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
        {editingProjectText ? (
          <textarea
            value={draftSummary}
            onChange={e => setDraftSummary(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              margin: 0,
              background: '#0b1220',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#94a3b8',
              fontSize: 13.5,
              lineHeight: 1.65,
              padding: '8px 10px',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.65 }}>
            {project.summary}
          </p>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          {editingProjectText ? (
            <>
              <button
                onClick={saveProjectText}
                style={{
                  background: '#3b82f6', border: 'none', borderRadius: 5,
                  color: '#fff', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                }}
              >
                Save text
              </button>
              <button
                onClick={cancelProjectText}
                style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
                  color: '#64748b', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingProjectText(true)}
              style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 5,
                color: '#64748b', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
              }}
            >
              Edit text
            </button>
          )}
        </div>
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
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={() => toggleTodo(t.id)}
            onDelete={() => deleteTodo(t.id)}
            onEdit={text => editTodoText(t.id, text)}
          />
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
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={() => toggleTodo(t.id)}
              onDelete={() => deleteTodo(t.id)}
              onEdit={text => editTodoText(t.id, text)}
            />
          ))}
        </div>
      )}

      {/* Activity log */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          value={newLogEntry}
          onChange={e => setNewLogEntry(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addLogEntry()}
          placeholder="Add activity note..."
          style={{
            flex: 1, background: '#0f172a', border: '1px solid #334155',
            borderRadius: 6, color: '#cbd5e1', fontSize: 13, padding: '8px 12px', outline: 'none',
          }}
        />
        <button
          onClick={addLogEntry}
          style={{
            background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
            color: '#64748b', fontSize: 12, fontWeight: 600, padding: '8px 12px', cursor: 'pointer',
          }}
        >
          + Note
        </button>
      </div>
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
