// EmergencyPage.jsx — Kit d'emergència bàsic
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getLinkedPsychologist, getProfile, getEmergencyContacts } from '../services/supabase'

const GROUNDING_STEPS = [
  { count: 5, sense: 'veus', prompt: 'Mira al teu voltant i identifica 5 coses que pugues veure.' },
  { count: 4, sense: 'toques', prompt: 'Toca 4 coses diferents al teu voltant i nota la seua textura.' },
  { count: 3, sense: 'escoltes', prompt: 'Escolta amb atenció i identifica 3 sons que pugues sentir.' },
  { count: 2, sense: 'oleixes', prompt: 'Identifica 2 olors que pugues percebre ara mateix.' },
  { count: 1, sense: 'saboreges', prompt: 'Nota 1 sabor a la teua boca, encara que siga subtil.' },
]

const BREATHING_PHASES = [
  { label: 'Inspira', duration: 4, scale: 1.3 },
  { label: 'Mantén', duration: 4, scale: 1.3 },
  { label: 'Expira', duration: 6, scale: 0.75 },
]
const TOTAL_CYCLES = 5

export default function EmergencyPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [view, setView] = useState('main')
  const [psychologist, setPsychologist] = useState(null)
  const [personalContacts, setPersonalContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  useEffect(() => {
    if (view !== 'external') return
    async function loadContacts() {
      setLoadingContacts(true)

      const [linkageResult, contactsResult] = await Promise.all([
        getLinkedPsychologist(session.user.id),
        getEmergencyContacts(session.user.id),
      ])

      let psychContact = null
      if (linkageResult.data?.psychologist_id) {
        const { data: psych } = await getProfile(linkageResult.data.psychologist_id)
        if (psych?.full_name) {
          psychContact = {
            name: psych.full_name,
            phone: psych.phone || null,
            type: 'Psicòleg/a vinculat/da',
          }
        }
      }

      setPsychologist(psychContact)
      setPersonalContacts(
        (contactsResult.data || []).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          type: 'Contacte de confiança',
        }))
      )
      setLoadingContacts(false)
    }
    loadContacts()
  }, [view, session?.user?.id])

  return (
    <div style={{
      minHeight: '100svh', background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif', display: 'flex', flexDirection: 'column',
    }}>
      <Header
        title={getTitle(view)}
        onBack={() => {
          if (view === 'main') navigate('/home')
          else if (view === 'regulate') setView('main')
          else if (view === 'breathing' || view === 'grounding') setView('regulate')
          else setView('main')
        }}
      />

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {view === 'main' && (
          <>
            <p style={{ color: '#5B6B7A', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Estàs en un espai segur. Tria l'opció que necessites ara mateix.
            </p>
            <BigButton
              label="Necessito regular-me"
              color="#7BAF9E"
              onClick={() => setView('regulate')}
            />
            <BigButton
              label="Necessito ajuda externa"
              color="#5B8DB8"
              onClick={() => setView('external')}
            />
          </>
        )}

        {view === 'regulate' && (
          <>
            <p style={{ color: '#5B6B7A', fontSize: 14, lineHeight: 1.6 }}>
              Tria una tècnica per calmar el teu cos i la teua ment.
            </p>
            <OptionCard
              emoji="🌬️"
              title="Respiració guiada 4-4-6"
              desc="5 cicles per reduir l'ansietat"
              color="#7BAF9E"
              onClick={() => setView('breathing')}
            />
            <OptionCard
              emoji="🌿"
              title="Grounding 5-4-3-2-1"
              desc="Torna al moment present amb els teus sentits"
              color="#5B8DB8"
              onClick={() => setView('grounding')}
            />
          </>
        )}

        {view === 'breathing' && <BreathingExercise onDone={() => setView('regulate')} />}
        {view === 'grounding' && <GroundingExercise onDone={() => setView('regulate')} />}
        {view === 'external' && (
          <ExternalHelp
            psychologist={psychologist}
            personalContacts={personalContacts}
            loading={loadingContacts}
          />
        )}
      </div>
    </div>
  )
}

function getTitle(view) {
  if (view === 'regulate') return 'Regular-me'
  if (view === 'breathing') return 'Respiració 4-4-6'
  if (view === 'grounding') return 'Grounding 5-4-3-2-1'
  if (view === 'external') return 'Ajuda externa'
  return "Kit d'emergència"
}

function Header({ title, onBack }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
      padding: '48px 20px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button onClick={onBack} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
        width: 36, height: 36, cursor: 'pointer', color: '#FFFFFF', fontSize: 18,
      }}>←</button>
      <h1 style={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF' }}>{title}</h1>
    </div>
  )
}

function BigButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        border: 'none',
        borderRadius: 16,
        padding: '28px 24px',
        color: '#FFFFFF',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 18,
        fontWeight: 700,
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        minHeight: 80,
      }}
    >
      {label}
    </button>
  )
}

function OptionCard({ emoji, title, desc, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#FFFFFF', border: 'none', borderRadius: 16,
        padding: 20, cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', width: '100%',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: 26 }}>{emoji}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#2C2C2C', marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 13, color: '#5B6B7A', lineHeight: 1.4 }}>{desc}</p>
      </div>
      <span style={{ fontSize: 18, color }}>›</span>
    </button>
  )
}

function BreathingExercise({ onDone }) {
  const [cycle, setCycle] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BREATHING_PHASES[0].duration)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef(null)

  const phase = BREATHING_PHASES[phaseIndex]

  useEffect(() => {
    if (finished) return

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1
        return 0
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [finished, phaseIndex, cycle])

  useEffect(() => {
    if (secondsLeft > 0 || finished) return

    const nextPhaseIndex = phaseIndex + 1
    if (nextPhaseIndex < BREATHING_PHASES.length) {
      setPhaseIndex(nextPhaseIndex)
      setSecondsLeft(BREATHING_PHASES[nextPhaseIndex].duration)
      return
    }

    if (cycle < TOTAL_CYCLES) {
      setCycle(c => c + 1)
      setPhaseIndex(0)
      setSecondsLeft(BREATHING_PHASES[0].duration)
    } else {
      setFinished(true)
    }
  }, [secondsLeft, phaseIndex, cycle, finished])

  if (finished) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <span style={{ fontSize: 56 }}>🌿</span>
        <p style={{ fontWeight: 700, fontSize: 18, color: '#2C2C2C', marginTop: 16 }}>
          Molt bé! Has completat els 5 cicles.
        </p>
        <p style={{ color: '#5B6B7A', fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
          Nota com se sent el teu cos ara. Pren el temps que necessites.
        </p>
        <button className="btn-primary" style={{ marginTop: 32 }} onClick={onDone}>
          Tornar
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
      <p style={{ color: '#5B6B7A', fontSize: 14, marginBottom: 8 }}>
        Cicle {cycle} de {TOTAL_CYCLES}
      </p>
      <p style={{ fontWeight: 700, fontSize: 22, color: '#2C2C2C', marginBottom: 32 }}>
        {phase.label}
      </p>

      <div style={{
        width: 180, height: 180, borderRadius: '50%',
        background: 'linear-gradient(135deg, #7BAF9E, #5B8DB8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${phase.scale})`,
        transition: 'transform 1s ease-in-out',
        boxShadow: '0 8px 32px rgba(91,141,184,0.3)',
      }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#FFFFFF' }}>
          {secondsLeft}
        </span>
      </div>

      <p style={{ color: '#5B6B7A', fontSize: 13, marginTop: 32, textAlign: 'center', lineHeight: 1.6 }}>
        Inspira 4 segons · Mantén 4 segons · Expira 6 segons
      </p>
    </div>
  )
}

function GroundingExercise({ onDone }) {
  const [step, setStep] = useState(0)
  const current = GROUNDING_STEPS[step]
  const isLast = step === GROUNDING_STEPS.length - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16, padding: 28,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center', flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <p style={{ fontSize: 13, color: '#5B6B7A', marginBottom: 12 }}>
          Pas {step + 1} de {GROUNDING_STEPS.length}
        </p>
        <span style={{ fontSize: 56, fontWeight: 700, color: '#5B8DB8' }}>
          {current.count}
        </span>
        <p style={{ fontWeight: 700, fontSize: 18, color: '#2C2C2C', margin: '16px 0 12px' }}>
          Coses que {current.sense}
        </p>
        <p style={{ color: '#5B6B7A', fontSize: 15, lineHeight: 1.7 }}>
          {current.prompt}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {!isLast ? (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
            Següent pas
          </button>
        ) : (
          <button className="btn-primary" onClick={onDone}>
            He acabat 🌿
          </button>
        )}
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
            Tornar
          </button>
        )}
      </div>
    </div>
  )
}

function ExternalHelp({ psychologist, personalContacts, loading }) {
  const hasAnyContact = psychologist || personalContacts.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#5B6B7A', fontSize: 14, lineHeight: 1.6 }}>
        No estàs sol/a. Aquests són els teus contactes d'emergència.
      </p>

      {loading ? (
        <p style={{ color: '#5B6B7A', textAlign: 'center' }}>Carregant...</p>
      ) : (
        <>
          {psychologist && <ContactCard contact={psychologist} />}

          {personalContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}

          {!hasAnyContact && (
            <div style={{
              background: '#FFFFFF', borderRadius: 16, padding: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
              <p style={{ color: '#5B6B7A', fontSize: 14, lineHeight: 1.6 }}>
                Pots afegir contactes de confiança des de la configuració.
              </p>
            </div>
          )}
        </>
      )}

      <p style={{ fontWeight: 700, fontSize: 14, color: '#2C2C2C', marginTop: 4 }}>
        Emergències
      </p>
      <a
        href="tel:112"
        style={{
          display: 'block',
          background: '#5B8DB8',
          borderRadius: 16,
          padding: '20px 24px',
          color: '#FFFFFF',
          textDecoration: 'none',
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: '0 4px 16px rgba(91,141,184,0.3)',
        }}
      >
        📞 Trucar al 112
      </a>
      <p style={{ color: '#5B6B7A', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
        El 112 és el telèfon d'emergències gratuït a tot Espanya.
      </p>
    </div>
  )
}

function ContactCard({ contact }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 16, padding: 20,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <p style={{ fontSize: 12, color: '#5B6B7A', marginBottom: 4 }}>{contact.type}</p>
      <p style={{ fontWeight: 700, fontSize: 16, color: '#2C2C2C', marginBottom: 8 }}>
        {contact.name}
      </p>
      {contact.phone ? (
        <a
          href={`tel:${contact.phone}`}
          style={{
            display: 'inline-block',
            background: '#7BAF9E',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: 10,
            marginTop: 4,
          }}
        >
          📞 Trucar · {contact.phone}
        </a>
      ) : (
        <p style={{ color: '#5B6B7A', fontSize: 13 }}>
          Contacta amb aquesta persona pels mitjans habituals.
        </p>
      )}
    </div>
  )
}
