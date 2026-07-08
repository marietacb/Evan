// EmergencyPage.jsx — Kit d'emergència
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getLinkedPsychologist, getProfile, getEmergencyContacts } from '../services/supabase'
import {
  COLORS,
  KitCard,
  PageHeader,
  GhostButton,
  PillButton,
  OutlineButton,
  ContactRow,
  CallButton,
  AddContactButton,
} from '../components/shared/EvanUI'
import BottomNav from '../components/shared/BottomNav'

const GROUNDING_STEPS = [
  { count: 5, title: 'Coses que veus', desc: 'Mira al teu voltant i nombra-les' },
  { count: 4, title: 'Coses que toques', desc: 'Sent la textura, temperatura,...' },
  { count: 3, title: 'Coses que escoltes', desc: 'Escolta els sons del teu entorn' },
  { count: 2, title: 'Coses que olores', desc: 'Identifica olors al teu voltant' },
  { count: 1, title: 'Coses que tastes', desc: 'Percep el sabor a la boca' },
]

const BREATHING_PHASES = [
  { label: 'Inspira', duration: 4, scale: 1.14 },
  { label: 'Mantén', duration: 4, scale: 1.14 },
  { label: 'Expira', duration: 6, scale: 0.86 },
]
const TOTAL_CYCLES = 5
const RESTING_SCALE = 0.9

function playPhaseChime(audioCtx) {
  if (!audioCtx) return
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(now)
    osc.stop(now + 0.4)
  } catch {
    // audio no disponible
  }
}

export default function EmergencyPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [view, setView] = useState('main')
  const [psychologist, setPsychologist] = useState(null)
  const [personalContacts, setPersonalContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const isSubView = view !== 'main'
  const pageBg = isSubView ? COLORS.white : COLORS.bg

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
          psychContact = { name: psych.full_name, phone: psych.phone || null }
        }
      }

      setPsychologist(psychContact)
      setPersonalContacts(
        (contactsResult.data || []).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
        }))
      )
      setLoadingContacts(false)
    }
    loadContacts()
  }, [view, session?.user?.id])

  function handleBack() {
    if (view === 'main') navigate('/home')
    else if (view === 'regulate') setView('main')
    else if (view === 'breathing' || view === 'grounding') setView('regulate')
    else setView('main')
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: view === 'main' ? COLORS.white : (view === 'regulate' ? COLORS.white : pageBg),
      fontFamily: 'Poppins, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: view === 'main' ? 80 : 0,
    }}>
      <div className="page-inner" style={{ paddingBottom: view === 'main' ? 16 : 32 }}>
        {view === 'main' && (
          <>
            <button onClick={() => navigate('/home')} style={{
              background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
              color: COLORS.text, padding: '4px 0', marginBottom: 8, alignSelf: 'flex-start',
            }}>←</button>
            <p style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>
              Estem ací amb tu
            </p>
            <h1 style={{ fontWeight: 700, fontSize: 26, color: COLORS.text, marginBottom: 32 }}>
              Kit d'emergència
            </h1>
            <div className="kit-grid" style={{
              flex: 1,
              justifyContent: 'center',
            }}>
              <KitCard
                icon="🫁"
                title="Necessito regular-me"
                subtitle="Respiració i grounding (tècniques de calma)"
                color={COLORS.green}
                onClick={() => setView('regulate')}
              />
              <KitCard
                icon="📞"
                title="Necessito ajuda externa"
                subtitle="Contacta amb persones de confiança o d'emergència"
                color={COLORS.blue}
                onClick={() => setView('external')}
              />
            </div>
          </>
        )}

        {view === 'regulate' && (
          <RegulateView
            onBreathing={() => setView('breathing')}
            onGrounding={() => setView('grounding')}
            onBack={() => setView('main')}
          />
        )}

        {view === 'breathing' && (
          <BreathingExercise onBack={handleBack} onDone={() => setView('regulate')} />
        )}

        {view === 'grounding' && (
          <GroundingExercise onBack={handleBack} onDone={() => setView('regulate')} />
        )}

        {view === 'external' && (
          <ExternalHelp
            onBack={handleBack}
            psychologist={psychologist}
            personalContacts={personalContacts}
            loading={loadingContacts}
            onAddContact={() => navigate('/settings')}
          />
        )}
      </div>

      {view === 'main' && <BottomNav />}
    </div>
  )
}

function RegulateView({ onBreathing, onGrounding, onBack }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
        color: COLORS.text, padding: '4px 0', marginBottom: 16, alignSelf: 'flex-start',
      }}>←</button>
      <h1 style={{ fontWeight: 700, fontSize: 24, color: COLORS.text, marginBottom: 6 }}>
        Tria una tècnica
      </h1>
      <p style={{ color: COLORS.textSecondary, fontSize: 15, marginBottom: 32 }}>
        Quina t'ajuda més ara?
      </p>

      <div className="kit-grid" style={{
        flex: 1,
        justifyContent: 'center',
      }}>
        <KitCard
          icon="🫁"
          title="Respiració guiada"
          subtitle="Exercicis de respiració 4-4-6"
          color={COLORS.green}
          onClick={onBreathing}
        />
        <KitCard
          icon="🌿"
          title="Torna al present"
          subtitle="Tècnica de grounding 5-4-3-2-1"
          color={COLORS.green}
          onClick={onGrounding}
        />
      </div>

      <p style={{
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 1.65,
        marginTop: 36,
        marginBottom: 28,
      }}>
        Ambdues tècniques t'ajuden a regular-te en moments difícils
      </p>

      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.textSecondary,
          fontFamily: 'Poppins, sans-serif',
          fontSize: 15,
          cursor: 'pointer',
          textAlign: 'center',
          padding: '8px 0',
        }}
      >
        ← Tornar al kit
      </button>
    </div>
  )
}

function BreathingExercise({ onBack, onDone }) {
  const [started, setStarted] = useState(false)
  const [cycle, setCycle] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BREATHING_PHASES[0].duration)
  const [finished, setFinished] = useState(false)
  const [displayScale, setDisplayScale] = useState(RESTING_SCALE)
  const timerRef = useRef(null)
  const audioCtxRef = useRef(null)

  const phase = BREATHING_PHASES[phaseIndex]

  function initAudio() {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) audioCtxRef.current = new AudioCtx()
    }
    return audioCtxRef.current
  }

  function handleStart() {
    playPhaseChime(initAudio())
    setStarted(true)
  }

  useEffect(() => {
    if (!started || finished) return
    if (phase.label === 'Mantén') {
      setDisplayScale(phase.scale)
      return
    }
    const fromScale = phase.label === 'Inspira'
      ? (cycle === 1 && phaseIndex === 0 ? RESTING_SCALE : BREATHING_PHASES[2].scale)
      : BREATHING_PHASES[1].scale
    setDisplayScale(fromScale)
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDisplayScale(phase.scale))
    })
    return () => cancelAnimationFrame(frame)
  }, [phaseIndex, cycle, started, finished, phase.label, phase.scale])

  useEffect(() => {
    if (!started || finished) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, finished, phaseIndex, cycle])

  useEffect(() => {
    if (!started || finished) return
    if (secondsLeft > 0) return

    const nextPhaseIndex = phaseIndex + 1
    if (nextPhaseIndex < BREATHING_PHASES.length) {
      playPhaseChime(audioCtxRef.current)
      setPhaseIndex(nextPhaseIndex)
      setSecondsLeft(BREATHING_PHASES[nextPhaseIndex].duration)
      return
    }
    if (cycle < TOTAL_CYCLES) {
      playPhaseChime(audioCtxRef.current)
      setCycle(c => c + 1)
      setPhaseIndex(0)
      setSecondsLeft(BREATHING_PHASES[0].duration)
    } else {
      playPhaseChime(audioCtxRef.current)
      setFinished(true)
    }
  }, [secondsLeft, phaseIndex, cycle, finished, started])

  if (finished) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="Respiració guiada" subtitle="Tècnica 4-4-6" onBack={onDone} />
        <div style={{ flex: 1, textAlign: 'center', padding: '48px 0' }}>
          <span style={{ fontSize: 56 }}>🌿</span>
          <p style={{ fontWeight: 700, fontSize: 18, color: COLORS.text, marginTop: 16 }}>
            Molt bé! Has completat els 5 cicles.
          </p>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
            Nota com se sent el teu cos ara. Pren el temps que necessites.
          </p>
        </div>
        <GhostButton label="Tornar" onClick={onDone} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Respiració guiada" subtitle="Tècnica 4-4-6" onBack={onBack} />

      {started && (
        <div style={{
          alignSelf: 'center',
          background: '#EEF0F2',
          borderRadius: 20,
          padding: '7px 20px',
          fontSize: 13,
          color: COLORS.textSecondary,
          fontWeight: 500,
          marginBottom: 28,
        }}>
          Cicle {cycle} de {TOTAL_CYCLES}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <BreathingAnimation
          scale={started ? displayScale : RESTING_SCALE}
          transition={started && phase.label !== 'Mantén'
            ? `transform ${phase.duration}s ease-in-out`
            : 'none'}
        />

        {started ? (
          <>
            <p style={{ fontWeight: 700, fontSize: 28, color: COLORS.greenDark, marginTop: 40 }}>
              {phase.label}...
            </p>
            <p style={{ fontWeight: 700, fontSize: 18, color: COLORS.text, marginTop: 10 }}>
              {secondsLeft} segons
            </p>
            <PhaseDots active={phaseIndex} />
          </>
        ) : (
          <>
            <p style={{ fontWeight: 700, fontSize: 22, color: COLORS.greenDark, marginTop: 40, textAlign: 'center' }}>
              Segueix el cercle amb la teua respiració
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 1.6 }}>
              Inspira 4 segons · Mantén 4 segons · Expira 6 segons
            </p>
          </>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {started ? (
          <OutlineButton label="Finalitzar" onClick={onDone} />
        ) : (
          <PillButton label="Començar respiració" onClick={handleStart} />
        )}
      </div>
    </div>
  )
}

function BreathingAnimation({ scale, transition }) {
  return (
    <div style={{
      width: 272,
      height: 272,
      borderRadius: 52,
      background: '#E8F2EC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
      transition,
    }}>
      <div style={{
        width: 210,
        height: 210,
        borderRadius: 44,
        background: '#CDDFD4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 116,
          height: 116,
          borderRadius: '50%',
          background: COLORS.green,
        }} />
      </div>
    </div>
  )
}

function PhaseDots({ active }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: i === active ? COLORS.green : '#D5D9DD',
          }}
        />
      ))}
    </div>
  )
}

function GroundingExercise({ onBack, onDone }) {
  const [step, setStep] = useState(0)
  const audioCtxRef = useRef(null)
  const isLast = step === GROUNDING_STEPS.length - 1
  const progress = ((step + 1) / GROUNDING_STEPS.length) * 100

  function playStepChime() {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) audioCtxRef.current = new AudioCtx()
    }
    playPhaseChime(audioCtxRef.current)
  }

  function handleNext() {
    playStepChime()
    if (isLast) onDone()
    else setStep(s => s + 1)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Torna al present" subtitle="Tècnica 5-4-3-2-1" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {GROUNDING_STEPS.map((item, i) => {
          const isActive = i === step
          const isFuture = i > step
          return (
            <div
              key={item.count}
              style={{
                background: isActive ? '#E8F3EE' : COLORS.white,
                border: `1.5px solid ${isActive ? '#B8D4C8' : COLORS.border}`,
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: isFuture ? 0.4 : 1,
              }}
            >
              <span style={{
                fontSize: 38,
                fontWeight: 700,
                color: isFuture ? '#C5CBD0' : COLORS.greenDark,
                minWidth: 38,
                textAlign: 'center',
                lineHeight: 1,
              }}>
                {item.count}
              </span>
              <div>
                <p style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: isFuture ? '#B0B8C0' : COLORS.text,
                  marginBottom: 3,
                }}>
                  {item.title}
                </p>
                <p style={{
                  fontSize: 13,
                  color: isFuture ? '#C5CBD0' : COLORS.textMuted,
                  lineHeight: 1.45,
                }}>
                  {item.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{
          height: 4,
          background: COLORS.border,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 10,
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: COLORS.green,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>
          {step + 1} de {GROUNDING_STEPS.length}
        </p>
        <PillButton
          label={isLast ? 'He acabat 🌿' : 'Següent →'}
          onClick={handleNext}
        />
      </div>
    </div>
  )
}

function ExternalHelp({ onBack, psychologist, personalContacts, loading, onAddContact }) {
  const allContacts = [
    ...personalContacts.map(c => ({ ...c, isPsych: false })),
    ...(psychologist ? [{ ...psychologist, id: 'psych', isPsych: true }] : []),
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Contactes d'emergència"
        subtitle="Persones que et poden ajudar"
        onBack={onBack}
      />

      {loading ? (
        <p style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>Carregant...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allContacts.length === 0 && (
            <p style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 1.6, padding: '16px 0' }}>
              Encara no tens contactes. Afegeix persones de confiança.
            </p>
          )}
          {allContacts.map((contact, i) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              colorIndex={i}
              callColor={contact.isPsych ? COLORS.blue : COLORS.green}
            />
          ))}
        </div>
      )}

      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginTop: 28, marginBottom: 12 }}>
        Serveis d'emergència
      </p>

      <div style={{
        background: '#E8F2FA',
        border: `1.5px solid ${COLORS.blue}44`,
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.blue, marginBottom: 4 }}>
            🚨 Emergències — 112
          </p>
          <p style={{ fontSize: 13, color: COLORS.textMuted }}>
            Truca si estàs en perill immediat
          </p>
        </div>
        <CallButton phone="112" color={COLORS.blue} />
      </div>

      <div style={{ marginTop: 20 }}>
        <AddContactButton onClick={onAddContact} />
      </div>
    </div>
  )
}
