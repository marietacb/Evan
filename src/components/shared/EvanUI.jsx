// Componentes UI compartidos — diseño Evan (mockups + DOCUMENTACION.md)

export const COLORS = {
  blue: '#5B8DB8',
  green: '#7BAF9E',
  greenDark: '#5E9484',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  text: '#2C2C2C',
  textSecondary: '#5B6B7A',
  textMuted: '#8A96A3',
  border: '#E8EAED',
  borderLight: '#E0E4E8',
}

export const AVATAR_COLORS = [
  { bg: '#D6E8F5', text: '#4A7FA5' },
  { bg: '#D8EDE4', text: '#5A9A7E' },
  { bg: '#D0E0EF', text: '#4A7FA5' },
]

export function KitCard({ icon, title, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: color,
        border: 'none',
        borderRadius: 28,
        padding: '56px 28px 40px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{
        position: 'absolute',
        top: -30,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: COLORS.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      }}>
        {icon}
      </div>
      <p style={{ fontWeight: 700, fontSize: 20, color: COLORS.white, marginBottom: 10, lineHeight: 1.3 }}>
        {title}
      </p>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.55 }}>
        {subtitle}
      </p>
    </button>
  )
}

export function PageHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ position: 'relative', textAlign: 'center', marginBottom: 28, paddingTop: 4 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: COLORS.text,
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ←
        </button>
      )}
      <h1 style={{ fontWeight: 700, fontSize: 22, color: COLORS.text, lineHeight: 1.3 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 6 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function OutlineButton({ label, onClick, color = COLORS.green }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: COLORS.white,
        border: `2px solid ${color}`,
        borderRadius: 28,
        padding: '16px 24px',
        color,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}

export function AuthBackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        alignSelf: 'flex-start',
        background: 'none',
        border: 'none',
        fontSize: 22,
        color: COLORS.text,
        cursor: 'pointer',
        padding: '4px 0',
        marginBottom: 24,
        lineHeight: 1,
      }}
    >
      ←
    </button>
  )
}

export function GhostButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: COLORS.white,
        border: `1.5px solid ${COLORS.borderLight}`,
        borderRadius: 28,
        padding: '16px 24px',
        color: COLORS.textMuted,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 16,
        fontWeight: 500,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}

export function PillButton({ label, onClick, color = COLORS.green }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        border: 'none',
        borderRadius: 28,
        padding: '16px 24px',
        color: COLORS.white,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}

export function PhoneIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 3C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5h-9zm0 1.5h9v15h-9v-15zm4.5 13.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25z"
        fill="#222"
      />
    </svg>
  )
}

export function CallButton({ phone, color }) {
  return (
    <a
      href={`tel:${phone}`}
      aria-label={`Trucar ${phone}`}
      style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <PhoneIcon />
    </a>
  )
}

export function ContactRow({ contact, colorIndex = 0, callColor = COLORS.green }) {
  const avatar = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
  const initial = contact.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div style={{
      background: COLORS.white,
      border: `1.5px solid ${COLORS.border}`,
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: avatar.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 18,
        color: avatar.text,
        flexShrink: 0,
      }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{contact.name}</p>
        {contact.phone && (
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{contact.phone}</p>
        )}
      </div>
      {contact.phone && <CallButton phone={contact.phone} color={callColor} />}
    </div>
  )
}

export function AddContactButton({ onClick, label = '+ Afegir contacte' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `2px dashed ${COLORS.borderLight}`,
        borderRadius: 16,
        padding: '16px',
        color: COLORS.green,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {label}
    </button>
  )
}

export function OtherIndicators({ social, physical, nutrition }) {
  const items = [
    { label: 'Social', value: social, type: 'social' },
    { label: 'Física', value: physical, type: 'physical' },
    { label: 'Alimentació', value: nutrition, type: 'nutrition' },
  ]

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: 16,
      padding: '20px 16px',
      border: `1px solid ${COLORS.border}`,
    }}>
      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 20 }}>
        Altres indicadors
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {items.map(item => {
          const info = getIndicatorLabel(item.value, item.type)
          return (
            <div key={item.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                border: `2px solid ${info.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: info.color }}>
                  {info.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: COLORS.textMuted }}>{item.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function getIndicatorLabel(score, type) {
  if (score == null) return { label: '—', color: '#C5CBD0' }
  if (type === 'social') {
    if (score >= 4) return { label: 'Sí', color: COLORS.blue }
    if (score === 3) return { label: 'Parc.', color: COLORS.green }
    return { label: 'No', color: '#A0ADB8' }
  }
  if (type === 'physical') {
    if (score >= 4) return { label: 'Alta', color: COLORS.green }
    if (score === 3) return { label: 'Parc.', color: COLORS.green }
    return { label: 'Baixa', color: '#A0ADB8' }
  }
  if (score >= 4) return { label: 'Bona', color: COLORS.blue }
  if (score === 3) return { label: 'Parc.', color: COLORS.green }
  return { label: 'Baixa', color: '#A0ADB8' }
}

export const EXPORT_PERIODS = [
  { label: 'Última setmana (7 dies)', days: 7 },
  { label: 'Últim mes (30 dies)', days: 30 },
  { label: 'Últims 3 mesos (90 dies)', days: 90 },
]

export function ExportModal({ patientName, exportPeriod, onSelectPeriod, onExport, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,35,50,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, zIndex: 100,
    }}>
      <div style={{
        background: COLORS.white,
        borderRadius: 28,
        padding: '32px 24px 24px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 36, opacity: 0.35 }}>📄</span>
          <p style={{ fontWeight: 700, fontSize: 20, color: COLORS.text, marginTop: 12 }}>
            Exportar informe
          </p>
          {patientName && (
            <p style={{ fontWeight: 600, fontSize: 15, color: COLORS.blue, marginTop: 4 }}>
              {patientName}
            </p>
          )}
        </div>

        <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 12 }}>
          Període de l'informe
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {EXPORT_PERIODS.map(p => {
            const selected = exportPeriod === p.days
            return (
              <button
                key={p.days}
                onClick={() => onSelectPeriod(p.days)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 28,
                  cursor: 'pointer',
                  border: `1.5px solid ${selected ? COLORS.blue : COLORS.borderLight}`,
                  background: selected ? '#EBF3FA' : COLORS.white,
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? COLORS.blue : '#B0B8C0'}`,
                  background: selected ? COLORS.blue : COLORS.white,
                  flexShrink: 0,
                  boxShadow: selected ? 'inset 0 0 0 3px #EBF3FA' : 'none',
                }} />
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: selected ? COLORS.blue : COLORS.textSecondary,
                }}>
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onExport}
          style={{
            background: COLORS.blue,
            border: 'none',
            borderRadius: 28,
            padding: '16px',
            color: COLORS.white,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Generar PDF
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            marginTop: 16,
            color: COLORS.textMuted,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            cursor: 'pointer',
            width: '100%',
            padding: '8px',
          }}
        >
          Cancel·lar
        </button>
      </div>
    </div>
  )
}
