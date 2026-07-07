// OnboardingPage.jsx — cuestionario inicial del paciente (3 pasos)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { upsertProfile } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [frequency, setFrequency] = useState('')
  const [notifTime, setNotifTime] = useState('21:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const progress = (step / TOTAL_STEPS) * 100

  async function handleFinish() {
    setLoading(true)
    setError('')

    const userId = session?.user?.id
    const { error: profileError } = await upsertProfile(userId, {
      full_name: fullName,
      age: age ? parseInt(age) : null,
      visit_frequency: frequency || null,
      notification_time: notifTime,
      notification_enabled: true,
      language: 'ca',
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    navigate('/home')
  }

  return (
    <div className="screen">

      {/* Barra de progreso */}
      <div style={{ width: '100%', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontWeight: 700, fontSize: 20, color: '#2C2C2C' }}>
            Configurem el teu perfil
          </h1>
          <span style={{ fontSize: 13, color: '#5B6B7A' }}>{step}/{TOTAL_STEPS}</span>
        </div>
        <div style={{ height: 6, background: '#E0E0E0', borderRadius: 3 }}>
          <div style={{ height: 6, background: '#5B8DB8', borderRadius: 3, width: `${progress}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Paso 1 — Datos personales */}
      {step === 1 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input className="input-field" type="text" value={fullName}
              onChange={e => setFullName(e.target.value)} placeholder="Ex: Maria García" />
          </div>
          <div>
            <label style={labelStyle}>Edat</label>
            <input className="input-field" type="number" value={age}
              onChange={e => setAge(e.target.value)} placeholder="Ex: 25" min={12} max={100} />
          </div>
        </div>
      )}

      {/* Paso 2 — Frecuencia de visitas */}
      {step === 2 && (
        <div style={{ width: '100%' }}>
          <p style={{ fontSize: 15, color: '#2C2C2C', fontWeight: 600, marginBottom: 16 }}>
            Amb quina freqüència visites al psicòleg/a?
          </p>
          {['Setmanalment', 'Cada dues setmanes', 'Mensualment', 'Altra'].map(op => (
            <button
              key={op}
              onClick={() => setFrequency(op)}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: frequency === op ? '2px solid #5B8DB8' : '1.5px solid #E0E0E0',
                background: frequency === op ? '#EEF4FB' : '#FFFFFF',
                color: frequency === op ? '#5B8DB8' : '#2C2C2C',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: frequency === op ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 10,
              }}
            >
              {op}
            </button>
          ))}
        </div>
      )}

      {/* Paso 3 — Hora de notificación */}
      {step === 3 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>A quina hora vols fer el diari?</label>
            <input className="input-field" type="time" value={notifTime}
              onChange={e => setNotifTime(e.target.value)} />
          </div>
          <p style={{ fontSize: 13, color: '#5B6B7A' }}>
            Evan t'enviarà un recordatori cada dia a aquesta hora.
          </p>
          {error && <p className="error-msg">{error}</p>}
        </div>
      )}

      {/* Botones de navegación */}
      <div style={{ width: '100%', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step < TOTAL_STEPS ? (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !fullName) || (step === 2 && !frequency)}>
            Continuar
          </button>
        ) : (
          <button className="btn-primary" onClick={handleFinish} disabled={loading}>
            {loading ? 'Carregant...' : 'Finalitzar configuració'}
          </button>
        )}
        {step > 1 && (
          <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
            Tornar
          </button>
        )}
      </div>

    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#2C2C2C', marginBottom: 6,
}

