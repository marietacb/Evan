import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { AuthBackButton, COLORS } from '../components/shared/EvanUI'
import EvanLogo from '../components/shared/EvanLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session && profile) {
      navigate(profile.role === 'psychologist' ? '/psychologist' : '/home')
    }
  }, [session, profile, navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signIn(email, password)
    setLoading(false)
    if (authError) setError('Correu o contrasenya incorrectes')
  }

  return (
    <div className="screen screen--auth">
      <div className="auth-brand">
        <EvanLogo className="evan-logo" />
        <h1 style={{ fontWeight: 700, fontSize: 34, color: COLORS.text, marginTop: 24, marginBottom: 8 }}>
          Evan
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 16 }}>
          El teu acompanyant virtual
        </p>
      </div>

      <div className="auth-panel">
        <AuthBackButton onClick={() => navigate('/')} />

        <h1 style={{ fontWeight: 700, fontSize: 26, color: COLORS.text, marginBottom: 32 }}>
          Benvingut de nou
        </h1>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            className="input-field"
            type="email"
            placeholder="Correu electrònic"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Contrasenya"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-msg">{error}</p>}

          <Link
            to="/forgot-password"
            style={{ color: COLORS.blue, fontSize: 14, textDecoration: 'none', alignSelf: 'flex-start' }}
          >
            Has oblidat la contrasenya?
          </Link>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, borderRadius: 14 }}>
            {loading ? 'Carregant...' : 'Inicia sessió'}
          </button>
        </form>

        <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 'auto', textAlign: 'center', paddingTop: 32 }}>
          No tens compte?{' '}
          <Link to="/register" style={{ color: COLORS.blue, fontWeight: 600, textDecoration: 'none' }}>
            Registra't
          </Link>
        </p>
      </div>
    </div>
  )
}
