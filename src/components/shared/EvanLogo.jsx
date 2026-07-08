export default function EvanLogo({ size = 160, className = '' }) {
  return (
    <svg
      className={className || undefined}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={className ? undefined : { flexShrink: 0, display: 'block' }}
    >
      <circle cx="80" cy="80" r="80" fill="#E2EDE4" />
      <image
        href="/evan-e.png"
        x="31"
        y="35"
        width="98"
        height="90"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  )
}
