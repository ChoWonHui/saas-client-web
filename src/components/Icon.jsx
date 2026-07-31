// Material Symbols 아이콘 얇은 래퍼.
export default function Icon({ name, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined${className ? ' ' + className : ''}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
