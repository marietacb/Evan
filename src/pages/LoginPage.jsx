// LoginPage.jsx — formulario de inicio de sesión
// Llama a Supabase Auth y redirige según el role del usuario
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session && profile) {
      if (profile.role === 'psychologist') {
        navigate('/psychologist')
      } else {
        navigate('/home')
      }
    }
  }, [session, profile])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await signIn(email, password)
    setLoading(false)

    if (authError) {
      setError('Correu o contrasenya incorrectes')
      return
    }

    // La redirección la gestiona App.jsx automáticamente
    // cuando detecta el cambio de sesión via onAuthStateChange
  }

  return (
    <div className="screen">

      {/* Cabecera */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <span style={{ fontSize: 28 }}>🌿</span>
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#2C2C2C' }}>Benvingut/da</h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div>
          <label style={labelStyle}>Correu electrònic</label>
          <input className="input-field" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required />
        </div>

        <div>
          <label style={labelStyle}>Contrasenya</label>
          <input className="input-field" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Carregant...' : 'Inicia sessió'}
        </button>
      </form>

      <Link to="/forgot-password" style={{ color: '#5B6B7A', fontSize: 14, marginTop: 16, textDecoration: 'none' }}>
        Has oblidat la contrasenya?
      </Link>

      <p style={{ color: '#5B6B7A', fontSize: 14, marginTop: 16 }}>
        No tens compte?{' '}
        <Link to="/register" style={{ color: '#5B8DB8', fontWeight: 600, textDecoration: 'none' }}>
          Registra't
        </Link>
      </p>

    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#2C2C2C', marginBottom: 6,
}