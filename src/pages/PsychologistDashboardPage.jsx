// PsychologistDashboardPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatientProfile, getPatientDiaryEntries, markPatientAlertsSeen } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import jsPDF from 'jspdf'
import { OtherIndicators, ExportModal, COLORS } from '../components/shared/EvanUI'
import { PeriodSelector, MoodChart, SleepChart } from '../components/shared/DashboardCharts'
import { buildChartData, avgScore, moodStatusLabel } from '../utils/chartData'

const PERIOD_LABELS = { 7: 'Última setmana', 30: 'Últim mes', 90: 'Últims 3 mesos' }

export default function PsychologistDashboardPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { session, profile: psychProfile } = useAuth()

  const [patient, setPatient] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPeriod, setExportPeriod] = useState(7)

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

  const chartData = buildChartData(entries, period)
  const avgMood = entries.length
    ? entries.reduce((s, e) => s + e.mood_score, 0) / entries.length
    : null
  const status = moodStatusLabel(avgMood)
  const avgSocial = avgScore(entries, 'social_activity')
  const avgPhysical = avgScore(entries, 'physical_activity')
  const avgNutrition = avgScore(entries, 'nutrition')

  async function handleExportPDF(periodDays = exportPeriod) {
    const { data: exportEntries } = await getPatientDiaryEntries(patientId, periodDays)
    const entriesToExport = exportEntries || []
    const doc = new jsPDF()

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

    doc.setTextColor(44, 44, 44)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pacient: ${patient?.full_name || 'Desconegut'}`, 14, 55)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Període: últims ${periodDays} dies`, 14, 63)
    doc.text(`Total d'entrades: ${entriesToExport.length}`, 14, 70)

    if (entriesToExport.length) {
      const exportAvgMood = (entriesToExport.reduce((s, e) => s + e.mood_score, 0) / entriesToExport.length).toFixed(1)
      doc.text(`Ànim mitjà: ${exportAvgMood}/5`, 14, 77)
    }

    doc.save(`evan_informe_${patient?.full_name || 'pacient'}_${new Date().toLocaleDateString('ca')}.pdf`)
    setShowExportModal(false)
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: COLORS.bg,
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 32,
    }}>
      <div style={{ padding: '48px 20px 20px', background: COLORS.white }}>
        <button onClick={() => navigate('/psychologist')} style={{
          background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
          color: COLORS.text, padding: 0, marginBottom: 16,
        }}>←</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text }}>
              {patient?.full_name || 'Pacient'}
            </h1>
            <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>
              Pacient · {PERIOD_LABELS[period]}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: status.color }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: status.color }}>{status.label}</span>
          </div>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          style={{
            marginTop: 20,
            width: '100%',
            background: COLORS.blue,
            border: 'none',
            borderRadius: 14,
            padding: '16px',
            color: COLORS.white,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          📄 Exportar informe PDF
        </button>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PeriodSelector period={period} onChange={setPeriod} />

        {loading ? (
          <p style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>Carregant...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <span style={{ fontSize: 48 }}>📔</span>
            <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 12 }}>
              Aquest pacient no té entrades en aquest període.
            </p>
          </div>
        ) : (
          <>
            <MoodChart data={chartData} />
            <SleepChart data={chartData} />
            <OtherIndicators social={avgSocial} physical={avgPhysical} nutrition={avgNutrition} />

            <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginTop: 8 }}>Últimes entrades</p>
            {entries.slice(-5).reverse().map(e => (
              <div key={e.id} style={{
                background: COLORS.white,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                    {new Date(e.created_at).toLocaleDateString('ca')}
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.blue, fontWeight: 600 }}>
                    Ànim: {e.mood_score}/5
                  </span>
                </div>
                <p style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                  {e.conversation_summary || '-'}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      {showExportModal && (
        <ExportModal
          patientName={patient?.full_name}
          exportPeriod={exportPeriod}
          onSelectPeriod={setExportPeriod}
          onExport={() => handleExportPDF(exportPeriod)}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  )
}
