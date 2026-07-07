// RegisterPage.jsx — formulario de registro
// Crea la cuenta en Supabase Auth y una fila en la tabla profiles
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp, upsertProfile } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Cuando la sesión está activa, redirige a selección de perfil
  useEffect(() => {
    if (session) navigate('/select-role')
  }, [session])

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (!fullName) { setError('Introdueix el teu nom'); return }
    if (password.length < 6) { setError('La contrasenya ha de tenir mínim 6 caràcters'); return }
    if (password !== passwordConfirm) { setError('Les contrasenyes no coincideixen'); return }

    setLoading(true)

    // 1. Crear cuenta en Supabase Auth
    const { data, error: authError } = await signUp(email, password)
    if (authError) { setError(authError.message); setLoading(false); return }

    // 2. Crear fila en profiles con el id del usuario recién creado
    const userId = data.user.id
    await upsertProfile(userId, { full_name: fullName })

    setLoading(false)
    // La redirección la gestiona el useEffect cuando session esté disponible
  }

  return (
    <div className="screen">

      {/* Cabecera */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <span style={{ fontSize: 28 }}>🌿</span>
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#2C2C2C' }}>Crea el teu compte</h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div>
          <label style={labelStyle}>Nom complet</label>
          <input className="input-field" type="text" value={fullName}
            onChange={e => setFullName(e.target.value)} placeholder="Ex: Maria García" required />
        </div>

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

        <div>
          <label style={labelStyle}>Confirma la contrasenya</label>
          <input className="input-field" type="password" value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)} required />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Carregant...' : "Registra't"}
        </button>
      </form>

      <p style={{ color: '#5B6B7A', fontSize: 14, marginTop: 24 }}>
        Ja tens compte?{' '}
        <Link to="/login" style={{ color: '#5B8DB8', fontWeight: 600, textDecoration: 'none' }}>
          Inicia sessió
        </Link>
      </p>

    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#2C2C2C', marginBottom: 6,
}