import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/shared/EvanUI'
import EvanLogo from '../components/shared/EvanLogo'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="welcome-screen">
      <div className="welcome-left">
        <div className="welcome-hero">
          <h1 style={{ fontWeight: 700, fontSize: 34, color: COLORS.text, marginBottom: 8 }}>
            Evan
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 16 }}>
            El teu acompanyant virtual
          </p>
        </div>
        <EvanLogo className="evan-logo" />
      </div>

      <div className="welcome-actions">
        <button className="btn-primary" onClick={() => navigate('/register')} style={{ borderRadius: 14 }}>
          Registrar-se
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#F0F2F4',
            border: 'none',
            borderRadius: 14,
            padding: '14px 24px',
            color: COLORS.blue,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            minHeight: 48,
          }}
        >
          Ja tens compte? Inicia sessió
        </button>
      </div>
    </div>
  )
}
