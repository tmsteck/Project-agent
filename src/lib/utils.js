export const now = () => new Date().toISOString()

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const STATUS_META = {
  active:  { label: 'Active',  color: '#4ade80', dot: '●' },
  stalled: { label: 'Stalled', color: '#facc15', dot: '◆' },
  blocked: { label: 'Blocked', color: '#f87171', dot: '▲' },
  done:    { label: 'Done',    color: '#94a3b8', dot: '✓' },
}

export function makeSampleProjects() {
  const t = now()
  return [
    {
      id: 'p1',
      name: 'Cavity QED Coupling Simulation',
      status: 'active',
      summary:
        'Simulating strong coupling regime between a single qubit and a photonic cavity. Goal is to reproduce experimental linewidths from the Chen group paper.',
      todos: [
        { id: 't1', text: 'Implement Jaynes-Cummings Hamiltonian in QuTiP', done: false, added: t },
        { id: 't2', text: 'Verify master equation solver against analytic steady state', done: false, added: t },
        { id: 't3', text: 'Plot g(2)(τ) for various coupling strengths', done: false, added: t },
      ],
      log: [{ ts: t, text: 'Project created.' }],
      created: t,
      lastCheckin: null,
    },
    {
      id: 'p2',
      name: 'Thesis Chapter 2 Draft',
      status: 'stalled',
      summary:
        'Writing the background chapter on open quantum systems. Need to cover Lindblad formalism and connect to experimental motivation.',
      todos: [
        { id: 't4', text: 'Outline sections 2.1–2.4', done: true, added: t },
        { id: 't5', text: 'Write Lindblad derivation subsection', done: false, added: t },
        { id: 't6', text: 'Get advisor feedback on intro paragraph', done: false, added: t },
      ],
      log: [{ ts: t, text: 'Project created.' }],
      created: t,
      lastCheckin: null,
    },
  ]
}
