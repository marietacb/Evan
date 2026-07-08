import { useNavigate, useLocation } from 'react-router-dom'
import { COLORS } from './EvanUI'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Inici', path: '/home', icon: '🏠' },
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Configuració', path: '/settings', icon: '⚙️' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: COLORS.white,
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      zIndex: 100,
    }}>
      {tabs.map((tab, i) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderRight: i < tabs.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '12px 8px 20px',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 11,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: active ? 600 : 400,
              color: active ? COLORS.blue : COLORS.textMuted,
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
