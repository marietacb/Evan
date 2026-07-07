// ForgotPasswordPage.jsx — recuperación de contraseña
// Envía un email con enlace para restablecer la contraseña
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../services/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await resetPassword(email)
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="screen">

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 48 }}>🔑</span>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#2C2C2C', marginTop: 12 }}>
          Recupera la contrasenya
        </h1>
      </div>

      {/* Si ya se envió el email mostramos confirmación */}
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#7BAF9E', fontSize: 15, marginBottom: 24 }}>
            ✅ T'hem enviat un correu per restablir la contrasenya.
          </p>
          <Link to="/login">
            <button className="btn-primary">Tornar a l'inici de sessió</button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2C2C2C', marginBottom: 6 }}>
              Correu electrònic
            </label>
            <input className="input-field" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Carregant...' : 'Enviar correu de recuperació'}
          </button>

          <Link to="/login" style={{ textAlign: 'center', color: '#5B6B7A', fontSize: 14, textDecoration: 'none', marginTop: 8 }}>
            Tornar a l'inici de sessió
          </Link>

        </form>
      )}

    </div>
  )
}
