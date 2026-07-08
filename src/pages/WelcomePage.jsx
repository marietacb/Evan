import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/shared/EvanUI'
import EvanLogo from '../components/shared/EvanLogo'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="screen" style={{ justifyContent: 'space-between', paddingTop: 72, paddingBottom: 48, background: COLORS.white }}>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <h1 style={{ fontWeight: 700, fontSize: 34, color: COLORS.text, marginBottom: 8 }}>
          Evan
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 16 }}>
          El teu acompanyant virtual
        </p>
      </div>

      <EvanLogo size={160} />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
