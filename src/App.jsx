import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ProjectPanel from './components/ProjectPanel.jsx'
import AgentChat from './components/AgentChat.jsx'
import StatusBadge from './components/StatusBadge.jsx'
import { loadProjects, saveProjects } from './lib/supabase.js'
import { now, makeSampleProjects } from './lib/utils.js'

export default function App() {
  const [projects, setProjects] = useState(null)   // null = loading
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('project')       // 'project' | 'agent' | 'global-agent'
  const [saveError, setSaveError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Boot: load from Supabase ──────────────────────────────────────────────
  useEffect(() => {
    loadProjects()
      .then(data => {
        const p = data?.length ? data : makeSampleProjects()
        setProjects(p)
        setSelectedId(p[0]?.id ?? null)
      })
      .catch(err => {
        console.error('Supabase load error:', err)
        // Fall back to sample data so the app still works
        const p = makeSampleProjects()
        setProjects(p)
        setSelectedId(p[0]?.id ?? null)
        setSaveError('Could not connect to Supabase. Changes will not be saved.')
      })
  }, [])

  // ── Persist helper ────────────────────────────────────────────────────────
  const persist = useCallback(async (updated) => {
    setProjects(updated)
    try {
      await saveProjects(updated)
      setSaveError(null)
    } catch (e) {
      setSaveError('Save failed: ' + e.message)
    }
  }, [])

  // ── Project-level update (single project) ─────────────────────────────────
  const handleProjectUpdate = useCallback((updated) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p)
      saveProjects(next).catch(e => setSaveError('Save failed: ' + e.message))
      return next
    })
  }, [])

  // ── Full list update (from agent) ─────────────────────────────────────────
  const handleProjectsUpdate = useCallback((updated) => {
    persist(updated)
  }, [persist])

  // ── Add project ───────────────────────────────────────────────────────────
  const handleAdd = useCallback(({ name, summary }) => {
    const p = {
      id: `p${Date.now()}`,
      name,
      status: 'active',
      summary,
      todos: [],
      log: [{ ts: now(), text: 'Project created.' }],
      created: now(),
      lastCheckin: null,
    }
    setProjects(prev => {
      const next = [...prev, p]
      saveProjects(next).catch(e => setSaveError('Save failed: ' + e.message))
      return next
    })
    setSelectedId(p.id)
    setView('project')
  }, [])

  // ── Delete project ────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      saveProjects(next).catch(e => setSaveError('Save failed: ' + e.message))
      if (selectedId === id) setSelectedId(next[0]?.id ?? null)
      return next
    })
  }, [selectedId])

  // ── Loading screen ────────────────────────────────────────────────────────
  if (projects === null) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080f1a', color: '#334155', fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="dot-1" style={{ width: 8, height: 8, borderRadius: '50%', background: '#334155', display: 'inline-block' }} />
          <span className="dot-2" style={{ width: 8, height: 8, borderRadius: '50%', background: '#334155', display: 'inline-block' }} />
          <span className="dot-3" style={{ width: 8, height: 8, borderRadius: '50%', background: '#334155', display: 'inline-block' }} />
        </div>
        Loading Research OS…
      </div>
    )
  }

  const selected = projects.find(p => p.id === selectedId)

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#080f1a', color: '#e2e8f0', overflow: 'hidden' }}>
      {/* Mobile overlay behind sidebar drawer */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        projects={projects}
        selectedId={selectedId}
        view={view}
        onSelect={id => { setSelectedId(id); setView('project'); setSidebarOpen(false) }}
        onViewChange={v => { setView(v); setSidebarOpen(false) }}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onGlobalAgent={() => { setView('global-agent'); setSelectedId(null); setSidebarOpen(false) }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>
            ⚛ Research OS
          </span>
        </div>
        {/* Save error banner */}
        {saveError && (
          <div style={{
            background: '#7f1d1d33', borderBottom: '1px solid #f87171',
            padding: '6px 20px', fontSize: 12, color: '#fca5a5',
            display: 'flex', justifyContent: 'space-between',
          }}>
            ⚠️ {saveError}
            <button onClick={() => setSaveError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {view === 'global-agent' ? (
          <>
            <Header title="All Projects Agent" subtitle={`Aware of all ${projects.length} projects · can update any of them`} icon="🧠" />
            <AgentChat key="global" projects={projects} onProjectsUpdate={handleProjectsUpdate} globalMode={true} />
          </>
        ) : selected ? (
          view === 'agent' ? (
            <>
              <Header
                title={selected.name}
                subtitle="Agent Check-in"
                badge={<StatusBadge status={selected.status} />}
              />
              <AgentChat
                key={selected.id}
                projects={[selected]}
                onProjectsUpdate={updated => handleProjectUpdate(updated[0])}
                globalMode={false}
              />
            </>
          ) : (
            <>
              <div style={{ padding: '10px 32px', borderBottom: '1px solid #1e293b', background: '#0a1628', fontSize: 10, color: '#334155' }}>
                {selected.lastCheckin
                  ? `Last check-in: ${new Date(selected.lastCheckin).toLocaleString()}`
                  : 'No check-ins yet'}
              </div>
              <ProjectPanel project={selected} onUpdate={handleProjectUpdate} />
            </>
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 14 }}>
            Select a project or open the All Projects Agent ↑
          </div>
        )}
      </div>
    </div>
  )
}

function Header({ title, subtitle, icon, badge }) {
  return (
    <div style={{
      padding: '14px 24px',
      borderBottom: '1px solid #1e293b',
      background: '#0a1628',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      {badge}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', fontFamily: "'Playfair Display', serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#475569' }}>{subtitle}</div>}
      </div>
    </div>
  )
}
