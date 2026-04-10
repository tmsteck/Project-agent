const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const ENABLE_INSECURE_BROWSER_AGENT = import.meta.env.VITE_ENABLE_INSECURE_BROWSER_AGENT === 'true'

export const SYSTEM_PROMPT = `You are a research project management assistant for a physics PhD student. You help track projects, update todos, and flag quagmires.

You have access to the student's current project data (provided as JSON). Your job during check-ins is to:
1. Listen to what they worked on, what's stuck, and any updates
2. Return structured JSON with project mutations (updated todos, status changes, log entries, summary tweaks)
3. Proactively flag quagmires: tasks stuck for >1 week, vague blockers, circular reasoning, or perfectionism spirals
4. When asked "what should I work on?", rank projects and tasks by impact/urgency for a PhD student, considering advisor expectations, thesis progress, and avoiding rabbit holes

Be direct and honest like a good labmate. Don't sugarcoat when something sounds like a quagmire. Keep summaries concise.

IMPORTANT: Always respond with a JSON object in this exact shape:
{
  "message": "Your conversational reply to the student (markdown ok)",
  "projectsToAdd": [
    {
      "name": "New project title",
      "summary": "Short project summary",
      "status": "active|stalled|blocked|done (optional, defaults to active)",
      "todos": ["task 1", "task 2"],
      "logEntry": "brief creation note (optional)"
    }
  ],
  "mutations": [
    {
      "projectId": "p1",
      "projectNameUpdate": "new project name or null",
      "summaryUpdate": "new summary text or null",
      "statusUpdate": "active|stalled|blocked|done or null",
      "todosToAdd": [{"text": "..."}],
      "todosToEdit": [{"id": "todo-id-1", "text": "updated text"}],
      "todosToComplete": ["todo-id-1"],
      "todosToDelete": ["todo-id-2"],
      "logEntry": "brief log note"
    }
  ],
  "quagmireFlags": [
    {"projectId": "p1", "warning": "This task has been open for 2 weeks with no progress — classic quagmire sign."}
  ],
  "priorityAdvice": "Only include when asked for prioritization"
}
Only include keys that are relevant. projectsToAdd and mutations can be empty arrays if no changes are needed.
Use projectsToAdd when the user describes a brand-new project or asks you to create entries from a semi-formal description.
Use todosToEdit and projectNameUpdate when the user asks to directly rewrite existing text.`

export async function callAgent(conversationHistory, projects) {
  if (!ENABLE_INSECURE_BROWSER_AGENT) {
    throw new Error(
      'Agent is disabled for security. Use a backend proxy, or set VITE_ENABLE_INSECURE_BROWSER_AGENT=true only for private/testing deployments.'
    )
  }
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY for browser agent mode.')
  }

  const projectContext = JSON.stringify(projects, null, 2)
  const systemWithContext = SYSTEM_PROMPT + `\n\nCURRENT PROJECT DATA:\n${projectContext}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemWithContext,
      messages: conversationHistory,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  const raw = data.content?.map(b => b.text || '').join('')
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    return { message: raw, mutations: [], quagmireFlags: [] }
  }
}

export function applyMutations(projects, resultOrMutations) {
  const mutations = Array.isArray(resultOrMutations)
    ? resultOrMutations
    : (resultOrMutations?.mutations ?? [])
  const projectsToAdd = Array.isArray(resultOrMutations)
    ? []
    : (resultOrMutations?.projectsToAdd ?? [])

  if (!mutations?.length && !projectsToAdd?.length) return projects
  const now = new Date().toISOString()

  const statusSet = new Set(['active', 'stalled', 'blocked', 'done'])
  const createdProjects = projectsToAdd
    .filter(x => x?.name?.trim())
    .map(x => {
      const name = x.name.trim()
      const summary = x.summary?.trim() || 'New project.'
      const status = statusSet.has(x.status) ? x.status : 'active'
      const todos = (x.todos ?? [])
        .map(t => typeof t === 'string' ? t : t?.text)
        .filter(Boolean)
        .map(text => ({
          id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          text: text.trim(),
          done: false,
          added: now,
        }))
      const log = [{ ts: now, text: x.logEntry?.trim() || 'Project created by agent.' }]

      return {
        id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        status,
        summary,
        todos,
        log,
        created: now,
        lastCheckin: now,
      }
    })

  const updatedProjects = projects.map(p => {
    const m = mutations.find(x => x.projectId === p.id)
    if (!m) return p
    let updated = { ...p }
    if (m.projectNameUpdate) updated.name = m.projectNameUpdate
    if (m.summaryUpdate) updated.summary = m.summaryUpdate
    if (m.statusUpdate) updated.status = m.statusUpdate
    if (m.todosToAdd?.length) {
      const newTodos = m.todosToAdd.map(t => ({
        id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: t.text,
        done: false,
        added: now,
      }))
      updated.todos = [...updated.todos, ...newTodos]
    }
    if (m.todosToEdit?.length) {
      const edits = new Map(
        m.todosToEdit
          .filter(t => t?.id && t?.text?.trim())
          .map(t => [t.id, t.text.trim()])
      )
      updated.todos = updated.todos.map(t => (edits.has(t.id) ? { ...t, text: edits.get(t.id) } : t))
    }
    if (m.todosToComplete?.length) {
      updated.todos = updated.todos.map(t =>
        m.todosToComplete.includes(t.id) ? { ...t, done: true } : t
      )
    }
    if (m.todosToDelete?.length) {
      updated.todos = updated.todos.filter(t => !m.todosToDelete.includes(t.id))
    }
    if (m.logEntry) {
      updated.log = [...(updated.log ?? []), { ts: now, text: m.logEntry }]
    }
    updated.lastCheckin = now
    return updated
  })

  return [...updatedProjects, ...createdProjects]
}
