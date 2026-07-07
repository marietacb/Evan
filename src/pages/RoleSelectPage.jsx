// RoleSelectPage.jsx — selección de perfil tras el registro
// Guarda el role elegido en la tabla profiles y redirige
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateRole } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()

  const [selected, setSelected] = useState(null) // 'patient' o 'psychologist'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError('')

    const userId = session?.user?.id
    const { error: roleError } = await updateRole(userId, selected)

    if (roleError) {
      setError(roleError.message)
      setLoading(false)
      return
    }

    // Refresca el perfil para que App.jsx tenga el role actualizado
    await refreshProfile()
    setLoading(false)

    if (selected === 'patient') {
      navigate('/onboarding')
    } else {
      navigate('/psychologist')
    }
  }

  return (
    <div className="screen">

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#2C2C2C' }}>
          Com vols utilitzar Evan?
        </h1>
      </div>

      {/* Tarjetas de selección */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

        <RoleCard
          emoji="🌱"
          title="Sóc pacient"
          desc="Vull fer un seguiment del meu benestar emocional"
          color="#5B8DB8"
          selected={selected === 'patient'}
          onClick={() => setSelected('patient')}
        />

        <RoleCard
          emoji="🩺"
          title="Sóc psicòleg/a"
          desc="Vull fer el seguiment dels meus pacients"
          color="#7BAF9E"
          selected={selected === 'psychologist'}
          onClick={() => setSelected('psychologist')}
        />

      </div>

      {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

      <button
        className="btn-primary"
        onClick={handleContinue}
        disabled={!selected || loading}
      >
        {loading ? 'Carregant...' : 'Continuar'}
      </button>

    </div>
  )
}

// Componente interno reutilizable para cada tarjeta
function RoleCard({ emoji, title, desc, color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? color : '#FFFFFF',
        border: `2px solid ${selected ? color : '#E0E0E0'}`,
        borderRadius: 16,
        padding: '20px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 36 }}>{emoji}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 16, color: selected ? '#FFFFFF' : '#2C2C2C', marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: selected ? 'rgba(255,255,255,0.85)' : '#5B6B7A', lineHeight: 1.4 }}>
          {desc}
        </p>
      </div>
    </button>
  )
}
