// PsychologistDashboardPage.jsx — dashboard de un paciente visto por el psicólogo
// Incluye gráficos y exportación PDF
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatientProfile, getPatientDiaryEntries, markPatientAlertsSeen } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import jsPDF from 'jspdf'

export default function PsychologistDashboardPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { session, profile: psychProfile } = useAuth()

  const [patient, setPatient] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  const PERIODS = [
    { label: '7 dies', days: 7 },
    { label: '30 dies', days: 30 },
    { label: '3 mesos', days: 90 },
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (session?.user?.id) {
        await markPatientAlertsSeen(session.user.id, patientId)
      }
      const { data: prof } = await getPatientProfile(patientId)
      const { data: ent } = await getPatientDiaryEntries(patientId, period)
      setPatient(prof)
      setEntries(ent || [])
      setLoading(false)
    }
    load()
  }, [patientId, period, session?.user?.id])

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  const chartData = entries.map(e => ({
    date: formatDate(e.created_at),
    anim: e.mood_score,
    son: e.sleep_hours,
  }))

  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1)
    : null

  const avgSleep = entries.length
    ? (entries.reduce((s, e) => s + e.sleep_hours, 0) / entries.length).toFixed(1)
    : null

  // Exporta el informe del paciente como PDF
  function handleExportPDF() {
    const doc = new jsPDF()

    // Cabecera
    doc.setFillColor(91, 141, 184)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Evan — Informe del pacient', 14, 20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generat per: ${psychProfile?.full_name || 'Psicòleg/a'}`, 14, 30)
    doc.text(`Data: ${new Date().toLocaleDateString('ca')}`, 14, 37)

    // Datos del paciente
    doc.setTextColor(44, 44, 44)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pacient: ${patient?.full_name || 'Desconegut'}`, 14, 55)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Edat: ${patient?.age || '-'} anys`, 14, 63)
    doc.text(`Període: últims ${period} dies`, 14, 70)
    doc.text(`Total d'entrades: ${entries.length}`, 14, 77)

    if (avgMood) {
      doc.text(`Ànim mitjà: ${avgMood}/5`, 14, 84)
      doc.text(`Son mitjà: ${avgSleep}h`, 14, 91)
    }

    // Tabla de entradas
    if (entries.length > 0) {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Historial d\'entrades', 14, 106)

      let y = 114
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Data', 14, y)
      doc.text('Ànim', 60, y)
      doc.text('Son (h)', 90, y)
      doc.text('Resum', 120, y)
      y += 2
      doc.line(14, y, 196, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      entries.slice(-15).forEach(e => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(formatDate(e.created_at), 14, y)
        doc.text(String(e.mood_score), 60, y)
        doc.text(String(e.sleep_hours), 90, y)
        const summary = e.conversation_summary
          ? e.conversation_summary.substring(0, 60) + '...'
          : '-'
        doc.text(summary, 120, y, { maxWidth: 76 })
        y += 10
      })
    }

    doc.save(`evan_informe_${patient?.full_name || 'pacient'}_${new Date().toLocaleDateString('ca')}.pdf`)
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
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/psychologist')} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
            width: 36, height: 36, cursor: 'pointer', color: '#FFFFFF', fontSize: 18,
          }}>←</button>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8 }}>Progrés de</p>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>
              {patient?.full_name || 'Pacient'}
            </h1>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          style={{
            background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.5)',
            borderRadius: 10, padding: '8px 14px', color: '#FFFFFF',
            fontFamily: 'Poppins, sans-serif', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          📄 PDF
        </button>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Selector período */}
        <div style={{ display: 'flex', gap: 8 }}>
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)} style={{
              padding: '8px 16px', borderRadius: 20,
              border: period === p.days ? 'none' : '1.5px solid #E0E0E0',
              background: period === p.days ? '#5B8DB8' : '#FFFFFF',
              color: period === p.days ? '#FFFFFF' : '#5B6B7A',
              fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#5B6B7A', textAlign: 'center', marginTop: 40 }}>Carregant...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <span style={{ fontSize: 48 }}>📔</span>
            <p style={{ color: '#5B6B7A', fontSize: 14, marginTop: 12 }}>
              Aquest pacient no té entrades en aquest període.
            </p>
          </div>
        ) : (
          <>
            {/* Promedios */}
            <div style={{ display: 'flex', gap: 12 }}>
              <StatCard label="Ànim mitjà" value={`${avgMood}/5`} emoji="😊" />
              <StatCard label="Son mitjà" value={`${avgSleep}h`} emoji="🌙" />
            </div>

            {/* Gráfico ánimo */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>😊 Estat d'ànim</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="anim" stroke="#5B8DB8" strokeWidth={2} dot={{ fill: '#5B8DB8', r: 4 }} name="Ànim" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico sueño */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>🌙 Hores de son</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="son" fill="#7BAF9E" radius={[6,6,0,0]} name="Hores" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Últimas entradas */}
            <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C' }}>Últimes entrades</p>
            {entries.slice(-5).reverse().map(e => (
              <div key={e.id} style={{
                background: '#FFFFFF', borderRadius: 12, padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2C2C2C' }}>
                    {new Date(e.created_at).toLocaleDateString('ca')}
                  </span>
                  <span style={{ fontSize: 13, color: '#5B8DB8', fontWeight: 600 }}>
                    Ànim: {e.mood_score}/5
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#5B6B7A', lineHeight: 1.5 }}>
                  {e.conversation_summary || '-'}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, emoji }) {
  return (
    <div style={{
      flex: 1, background: '#FFFFFF', borderRadius: 16, padding: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center',
    }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <p style={{ fontWeight: 700, fontSize: 20, color: '#2C2C2C', margin: '8px 0 4px' }}>{value}</p>
      <p style={{ fontSize: 12, color: '#5B6B7A' }}>{label}</p>
    </div>
  )
}