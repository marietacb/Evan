// BottomNav.jsx — barra de navegación inferior
// Aparece en todas las pantallas principales del paciente
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation() // para saber en qué ruta estamos y marcarla activa

  const tabs = [
    { label: 'Inici',      path: '/home',      icon: '🏠' },
    { label: 'Dashboard',  path: '/dashboard', icon: '📊' },
    { label: 'Config.',    path: '/settings',  icon: '⚙️' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#FFFFFF',
      borderTop: '1px solid #E0E0E0',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 20px', // 20px extra abajo para el notch del iPhone
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '4px 16px',
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 11,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: active ? 600 : 400,
              color: active ? '#5B8DB8' : '#5B6B7A',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}