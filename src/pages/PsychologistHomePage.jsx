// PsychologistHomePage.jsx — panel principal del psicólogo
// Muestra la lista de pacientes vinculados con indicadores de color
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createLinkage, getLinkedPatients, getPatientProfile, getPatientDiaryEntries, getUnseenAlerts, signOut } from '../services/supabase'

function getPatientRiskLevel(patientAlerts) {
  if (!patientAlerts.length) return 0
  const maxRisk = Math.max(...patientAlerts.map(a => a.risk_level))
  if (maxRisk >= 2) return 2
  if (maxRisk === 1) return 1
  return 0
}

export default function PsychologistHomePage() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [unseenAlerts, setUnseenAlerts] = useState([])

  // Carga la lista de pacientes al entrar
  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    const { data: linkages } = await getLinkedPatients(session.user.id)
    const { data: alerts } = await getUnseenAlerts(session.user.id)
    const unseenAlerts = alerts || []
    setUnseenAlerts(unseenAlerts)

    if (!linkages) { setLoading(false); return }

    const patientsData = await Promise.all(
      linkages.map(async (link) => {
        const { data: prof } = await getPatientProfile(link.patient_id)
        const { data: entries } = await getPatientDiaryEntries(link.patient_id, 7)
        const lastEntry = entries?.[entries.length - 1]
        const patientAlerts = unseenAlerts.filter(a => a.patient_id === link.patient_id)
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

  // Genera un código de invitación nuevo
  async function handleCreateCode() {
    const { data } = await createLinkage(session.user.id)
    if (data) setInviteCode(data.invite_code)
  }

  // Copia el código al portapapeles
  function handleCopy() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function riskColor(level) {
    if (level === 2) return '#E07B4A' // naranja — risk_level 2 o 3
    if (level === 1) return '#F0C040' // amarillo — risk_level 1
    return '#7BAF9E'                  // verde — sense alertes actives
  }

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100svh', background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif', paddingBottom: 32,
    }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        padding: '48px 24px 24px', color: '#FFFFFF',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <p style={{ fontSize: 13, opacity: 0.8 }}>Benvingut/da,</p>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>
            {profile?.full_name || 'Psicòleg/a'} 🩺
          </h1>
        </div>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none',
          borderRadius: 10, padding: '8px 14px', color: '#FFFFFF',
          fontFamily: 'Poppins, sans-serif', fontSize: 13, cursor: 'pointer',
        }}>
          Eixir
        </button>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Generar código de invitación */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 12 }}>
            Afegir pacient
          </p>
          <p style={{ fontSize: 13, color: '#5B6B7A', marginBottom: 12 }}>
            Genera un codi i comparteix-lo amb el teu pacient.
          </p>

          {inviteCode ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                flex: 1, background: '#F5F5F5', borderRadius: 10,
                padding: '12px 16px', fontWeight: 700, fontSize: 20,
                color: '#5B8DB8', letterSpacing: 4, textAlign: 'center',
              }}>
                {inviteCode}
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 16px' }} onClick={handleCopy}>
                {copied ? '✅' : '📋'}
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleCreateCode}>
              Generar codi
            </button>
          )}
        </div>

        {/* Lista de pacientes */}
        <p style={{ fontWeight: 700, fontSize: 16, color: '#2C2C2C', marginTop: 4 }}>
          Els meus pacients ({patients.length})
        </p>

        {loading ? (
          <p style={{ color: '#5B6B7A', textAlign: 'center' }}>Carregant...</p>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <span style={{ fontSize: 40 }}>👥</span>
            <p style={{ color: '#5B6B7A', fontSize: 14, marginTop: 12 }}>
              Encara no tens pacients vinculats.
            </p>
          </div>
        ) : (
          patients.map(patient => (
            <button
              key={patient.id}
              onClick={() => navigate(`/psychologist/patient/${patient.id}`)}
              style={{
                background: '#FFFFFF', border: 'none', borderRadius: 16,
                padding: 16, cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', width: '100%',
              }}
            >
              {/* Indicador de color */}
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: riskColor(patient.riskLevel), flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C' }}>{patient.name}</p>
                  {unseenAlerts.some(a => a.patient_id === patient.id) && (
                    <span style={{
                      background: '#E07B4A', color: '#FFFFFF',
                      fontSize: 10, fontWeight: 700,
                      borderRadius: 6, padding: '2px 7px',
                    }}>
                      ! Alerta
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#5B6B7A', marginTop: 2 }}>
                  {patient.lastDate
                    ? `Última entrada: ${new Date(patient.lastDate).toLocaleDateString('ca')}`
                    : 'Sense entrades'}
                </p>
              </div>
              <span style={{ color: '#5B8DB8', fontSize: 20 }}>›</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}