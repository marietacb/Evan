//WelcomePage.jsx - Página de bienvenida que ve el usuario
//Se ven los dos botones: registrarse o iniciar sesión

import { useNavigate } from 'react-router-dom'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="screen" style={{ justifyContent: 'space-between', paddingTop: 80, paddingBottom: 60 }}>

      {/* Logo y título */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 44 }}>🌿</span>
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, color: '#2C2C2C', marginBottom: 8 }}>
          Evan
        </h1>
        <p style={{ color: '#5B6B7A', fontSize: 16, textAlign: 'center', lineHeight: 1.5 }}>
          La teua aliança terapèutica
        </p>
      </div>

      {/* Botones */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Inicia sessió
        </button>
        <button className="btn-secondary" onClick={() => navigate('/register')}>
          Registra't
        </button>
      </div>

    </div>
  )
}