import { STATUS_META } from '../lib/utils.js'

export default function StatusBadge({ status, onClick }) {
  const m = STATUS_META[status] ?? STATUS_META.active
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: m.color,
        textTransform: 'uppercase',
        background: m.color + '18',
        border: `1px solid ${m.color}40`,
        padding: '2px 8px',
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {m.dot} {m.label}
    </span>
  )
}
