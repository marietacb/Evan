import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp, upsertProfile } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { AuthBackButton, COLORS } from '../components/shared/EvanUI'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) navigate('/select-role')
  }, [session, navigate])

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (!fullName) { setError('Introdueix el teu nom'); return }
    if (password.length < 6) { setError('La contrasenya ha de tenir mínim 6 caràcters'); return }
    if (password !== passwordConfirm) { setError('Les contrasenyes no coincideixen'); return }
    if (!consentAccepted) { setError('Has d\'acceptar el tractament de les teues dades per a continuar'); return }

    setLoading(true)
    const { data, error: authError } = await signUp(email, password)
    if (authError) { setError(authError.message); setLoading(false); return }

    await upsertProfile(data.user.id, { full_name: fullName })
    setLoading(false)
  }

  return (
    <div className="screen" style={{ alignItems: 'stretch', background: COLORS.white }}>
      <AuthBackButton onClick={() => navigate('/')} />

      <h1 style={{ fontWeight: 700, fontSize: 26, color: COLORS.text, marginBottom: 28 }}>
        Crea el teu compte
      </h1>

      <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input className="input-field" type="text" placeholder="Nom complet" value={fullName}
          onChange={e => setFullName(e.target.value)} required />
        <input className="input-field" type="email" placeholder="Correu electrònic" value={email}
          onChange={e => setEmail(e.target.value)} required />
        <input className="input-field" type="password" placeholder="Contrasenya" value={password}
          onChange={e => setPassword(e.target.value)} required />
        <input className="input-field" type="password" placeholder="Confirmar contrasenya" value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)} required />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
          <input type="checkbox" id="consent" checked={consentAccepted}
            onChange={e => setConsentAccepted(e.target.checked)} style={{ marginTop: 3 }} />
          <label htmlFor="consent" style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.4 }}>
            Accepte el tractament de les meues dades de salut d'acord amb la política de privacitat d'Evan.
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading || !consentAccepted}
          style={{ marginTop: 8, borderRadius: 14 }}>
          {loading ? 'Carregant...' : 'Continuar'}
        </button>
      </form>

      <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 'auto', textAlign: 'center', paddingTop: 32 }}>
        Ja tens compte?{' '}
        <Link to="/login" style={{ color: COLORS.blue, fontWeight: 600, textDecoration: 'none' }}>
          Inicia sessió
        </Link>
      </p>
    </div>
  )
}
