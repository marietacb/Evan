import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { upsertProfile } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { COLORS, PillButton } from '../components/shared/EvanUI'

const TOTAL_STEPS = 3

const GOALS = [
  { emoji: '😰', label: 'Gestionar l\'ansietat' },
  { emoji: '😔', label: 'Superar la depressió' },
  { emoji: '🌱', label: 'Millorar el benestar general' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { session, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [notifTime, setNotifTime] = useState('21:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNext() {
    if (step === 1 && !goal) return
    if (step === 2 && !fullName) return
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else handleFinish()
  }

  async function handleFinish() {
    setLoading(true)
    setError('')
    const { error: profileError } = await upsertProfile(session?.user?.id, {
      full_name: fullName,
      age: age ? parseInt(age) : null,
      visit_frequency: goal || null,
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
    <div className="screen" style={{ alignItems: 'stretch', background: COLORS.white, justifyContent: 'flex-start', paddingTop: 48 }}>

      <div style={{ width: '100%', marginBottom: 28 }}>
        <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            height: '100%',
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: COLORS.blue,
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: COLORS.textMuted }}>{step} de {TOTAL_STEPS}</p>
      </div>

      {step === 1 && (
        <>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: COLORS.text, marginBottom: 8 }}>
            Explica'ns una mica sobre tu
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            Les teues respostes ens ajuden a personalitzar l'experiència
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {GOALS.map(g => (
              <button
                key={g.label}
                onClick={() => setGoal(g.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  width: '100%',
                  padding: '18px 16px',
                  borderRadius: 16,
                  border: `1.5px solid ${goal === g.label ? COLORS.blue : COLORS.border}`,
                  background: goal === g.label ? '#EBF3FA' : COLORS.white,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  fontWeight: goal === g.label ? 600 : 500,
                  color: goal === g.label ? COLORS.blue : COLORS.text,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 24 }}>{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: COLORS.text, marginBottom: 24 }}>
            Dades personals
          </h1>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="input-field" type="text" placeholder="Nom complet" value={fullName}
              onChange={e => setFullName(e.target.value)} />
            <input className="input-field" type="number" placeholder="Edat" value={age}
              onChange={e => setAge(e.target.value)} min={12} max={100} />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: COLORS.text, marginBottom: 8 }}>
            Recordatori del diari
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            A quina hora vols fer el diari cada dia?
          </p>
          <input className="input-field" type="time" value={notifTime}
            onChange={e => setNotifTime(e.target.value)} />
          {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}
        </>
      )}

      <div style={{ width: '100%', marginTop: 'auto', paddingTop: 32 }}>
        {step < TOTAL_STEPS ? (
          <PillButton
            label="Continuar →"
            color={COLORS.blue}
            onClick={handleNext}
          />
        ) : (
          <PillButton
            label={loading ? 'Carregant...' : 'Continuar →'}
            color={COLORS.blue}
            onClick={handleNext}
          />
        )}
      </div>
    </div>
  )
}
