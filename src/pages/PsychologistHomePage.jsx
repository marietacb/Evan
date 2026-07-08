import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  createLinkage, getLinkedPatients, getPatientProfile,
  getPatientDiaryEntries, getUnseenAlerts, signOut,
} from '../services/supabase'
import { COLORS } from '../components/shared/EvanUI'
import { formatLastEntry } from '../utils/chartData'

function getPatientRiskLevel(patientAlerts) {
  if (!patientAlerts.length) return 0
  const maxRisk = Math.max(...patientAlerts.map(a => a.risk_level))
  if (maxRisk >= 2) return 2
  if (maxRisk === 1) return 1
  return 0
}

function riskInfo(level) {
  if (level === 2) return { label: 'Alerta', color: '#E07B4A', bg: '#FFF4EE', btn: '#E07B4A' }
  if (level === 1) return { label: 'Atenció', color: '#C9A020', bg: COLORS.white, btn: COLORS.blue }
  return { label: 'Bé', color: COLORS.green, bg: COLORS.white, btn: COLORS.blue }
}

export default function PsychologistHomePage() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [unseenAlerts, setUnseenAlerts] = useState([])

  useEffect(() => { loadPatients() }, [])

  async function loadPatients() {
    setLoading(true)
    const { data: linkages } = await getLinkedPatients(session.user.id)
    const { data: alerts } = await getUnseenAlerts(session.user.id)
    const alertsList = alerts || []
    setUnseenAlerts(alertsList)

    if (!linkages) { setLoading(false); return }

    const patientsData = await Promise.all(
      linkages.map(async (link) => {
        const { data: prof } = await getPatientProfile(link.patient_id)
        const { data: entries } = await getPatientDiaryEntries(link.patient_id, 7)
        const lastEntry = entries?.[entries.length - 1]
        const patientAlerts = alertsList.filter(a => a.patient_id === link.patient_id)
        return {
          id: link.patient_id,
          name: prof?.full_name || 'Pacient',
          lastDate: lastEntry?.created_at || null,
          riskLevel: getPatientRiskLevel(patientAlerts),
        }
      })
    )
    setPatients(patientsData)
    setLoading(false)
  }

  async function handleCreateCode() {
    const { data } = await createLinkage(session.user.id)
    if (data) setInviteCode(data.invite_code)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const alertPatient = patients.find(p => p.riskLevel === 2)
  const drName = profile?.full_name?.replace(/^(Dr\.?|Dra\.?)\s*/i, '') || profile?.full_name || 'Psicòleg/a'

  return (
    <div style={{
      minHeight: '100svh',
      background: COLORS.bg,
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 32,
    }}>
      <div style={{ padding: '52px 20px 20px', background: COLORS.white }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
          Hola, Dr. {drName.split(' ').pop()}
        </h1>
        <p style={{ fontSize: 15, color: COLORS.textSecondary, marginTop: 4 }}>
          Els teus pacients
        </p>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {alertPatient && (
          <div style={{
            background: '#FFF0E8',
            borderRadius: 14,
            padding: '14px 16px',
            color: '#C45A2A',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            ⚠️ Alerta — {alertPatient.name.split(' ')[0]} {alertPatient.name.split(' ')[1]?.charAt(0)}. Possible situació de risc detectada
          </div>
        )}

        <div style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: 18,
          border: `1px solid ${COLORS.border}`,
        }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 8 }}>Afegir pacient</p>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 }}>
            Genera un codi i comparteix-lo amb el teu pacient.
          </p>
          {inviteCode ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                flex: 1, background: COLORS.bg, borderRadius: 12,
                padding: '12px', fontWeight: 700, fontSize: 18,
                color: COLORS.blue, letterSpacing: 4, textAlign: 'center',
              }}>
                {inviteCode}
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 16px' }} onClick={handleCopy}>
                {copied ? '✅' : '📋'}
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleCreateCode}>Generar codi</button>
          )}
        </div>

        {loading ? (
          <p style={{ color: COLORS.textMuted, textAlign: 'center' }}>Carregant...</p>
        ) : patients.length === 0 ? (
          <p style={{ color: COLORS.textMuted, textAlign: 'center', padding: '24px 0' }}>
            Encara no tens pacients vinculats.
          </p>
        ) : (
          patients.map(patient => {
            const info = riskInfo(patient.riskLevel)
            const initial = patient.name.charAt(0).toUpperCase()
            return (
              <div
                key={patient.id}
                style={{
                  background: info.bg,
                  border: `1px solid ${patient.riskLevel === 2 ? '#F5D0BC' : COLORS.border}`,
                  borderRadius: 16,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: '#ECEEF0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 18, color: COLORS.textSecondary,
                  flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{patient.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                    Últim registre: {formatLastEntry(patient.lastDate)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: info.color }}>{info.label}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/psychologist/patient/${patient.id}`)}
                  style={{
                    background: info.btn,
                    border: 'none',
                    borderRadius: 20,
                    padding: '10px 14px',
                    color: COLORS.white,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Veure dashboard
                </button>
              </div>
            )
          })
        )}

        <button
          onClick={async () => { await signOut(); navigate('/') }}
          style={{
            marginTop: 8,
            background: 'none',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: '14px',
            color: COLORS.textSecondary,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Eixir
        </button>
      </div>
    </div>
  )
}
