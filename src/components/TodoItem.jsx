export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <button
        onClick={onToggle}
        aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          marginTop: 1,
          border: todo.done ? 'none' : '2px solid #334155',
          background: todo.done ? '#4ade80' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a',
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {todo.done ? '✓' : ''}
      </button>

      <span
        style={{
          flex: 1,
          fontSize: 13.5,
          color: todo.done ? '#475569' : '#cbd5e1',
          textDecoration: todo.done ? 'line-through' : 'none',
          lineHeight: 1.5,
        }}
      >
        {todo.text}
      </span>

      <button
        onClick={onDelete}
        aria-label="Delete task"
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          fontSize: 12,
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
