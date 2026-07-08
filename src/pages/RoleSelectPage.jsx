import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateRole } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { AuthBackButton, COLORS } from '../components/shared/EvanUI'

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSelect(role) {
    if (loading) return
    setLoading(true)
    setError('')

    const { error: roleError } = await updateRole(session?.user?.id, role)
    if (roleError) {
      setError(roleError.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    setLoading(false)
    navigate(role === 'patient' ? '/onboarding' : '/psychologist')
  }

  return (
    <div className="screen" style={{ alignItems: 'stretch', background: COLORS.white }}>
      <AuthBackButton onClick={() => navigate(-1)} />

      <h1 style={{ fontWeight: 700, fontSize: 26, color: COLORS.text, marginBottom: 8 }}>
        Qui ets?
      </h1>
      <p style={{ color: COLORS.textSecondary, fontSize: 15, marginBottom: 40, lineHeight: 1.5 }}>
        Tria el teu perfil per personalitzar l'experiència
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <button
          onClick={() => handleSelect('patient')}
          disabled={loading}
          style={{
            background: COLORS.blue,
            border: 'none',
            borderRadius: 16,
            padding: '22px',
            color: COLORS.white,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Sóc pacient
        </button>
        <button
          onClick={() => handleSelect('psychologist')}
          disabled={loading}
          style={{
            background: COLORS.green,
            border: 'none',
            borderRadius: 16,
            padding: '22px',
            color: COLORS.white,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Sóc psicòleg
        </button>
      </div>

      {error && <p className="error-msg" style={{ marginTop: 16 }}>{error}</p>}
    </div>
  )
}
