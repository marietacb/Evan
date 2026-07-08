export default function EvanLogo({ size = 160 }) {
  return (
    <img
      src="/evan-logo.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    />
  )
}
