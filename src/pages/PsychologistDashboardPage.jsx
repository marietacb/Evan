// PsychologistDashboardPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatientProfile, getPatientDiaryEntries, markPatientAlertsSeen } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import jsPDF from 'jspdf'
import { OtherIndicators, ExportModal, COLORS } from '../components/shared/EvanUI'
import { PeriodSelector, MoodChart, SleepChart } from '../components/shared/DashboardCharts'
import { buildChartData, avgScore, moodStatusLabel, calcStreak } from '../utils/chartData'

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

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const left = 14
    const right = pageW - 14
    const contentW = right - left

    const toNum = (v) => {
      if (v == null) return null
      const n = typeof v === 'number' ? v : Number(v)
      return Number.isFinite(n) ? n : null
    }

    const avgNum = (list) => {
      const vals = list.map(toNum).filter(v => v != null)
      if (!vals.length) return null
      return vals.reduce((s, n) => s + n, 0) / vals.length
    }

    const truncate = (text, max = 90) => {
      if (!text) return ''
      const t = String(text)
      return t.length > max ? `${t.slice(0, max - 1)}…` : t
    }

    const safeDate = (d) => {
      try {
        return d ? new Date(d).toLocaleDateString('ca') : '—'
      } catch {
        return '—'
      }
    }

    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const sleepVals = []
    for (const e of entriesToExport) {
      if (e?.mood_score != null && moodCounts[e.mood_score] != null) moodCounts[e.mood_score]++
      const s = toNum(e?.sleep_hours)
      if (s != null) sleepVals.push(s)
    }

    const avgMoodExport = avgNum(entriesToExport.map(e => e.mood_score))
    const avgSleepHours = avgNum(entriesToExport.map(e => e.sleep_hours))
    const minSleepHours = sleepVals.length ? Math.min(...sleepVals) : null
    const maxSleepHours = sleepVals.length ? Math.max(...sleepVals) : null

    const exportAvgSocial = avgScore(entriesToExport, 'social_activity')
    const exportAvgPhysical = avgScore(entriesToExport, 'physical_activity')
    const exportAvgNutrition = avgScore(entriesToExport, 'nutrition')

    const exportStatus = moodStatusLabel(avgMoodExport)
    const streak = calcStreak(entriesToExport)

    const chartPointsRaw = buildChartData(entriesToExport, periodDays)
    const chartPoints = chartPointsRaw.slice(-10) // evita densidad excessiva a 30/90 dies

    const addTopBar = () => {
      doc.setFillColor(91, 141, 184)
      doc.rect(0, 0, pageW, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('Evan — Informe del pacient', left, 20)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generat per: ${psychProfile?.full_name || 'Psicòleg/a'}`, left, 30)
      doc.text(`Data: ${new Date().toLocaleDateString('ca')}`, left, 37)
    }

    const ensureSpace = (lines = 1, lineH = 5) => {
      // marge inferior per a peu de pàgina simple
      const needed = lines * lineH
      if (y + needed > pageH - 18) {
        doc.addPage()
        y = 22
      }
    }

    addTopBar()
    let y = 52

    const addHeading = (text) => {
      doc.setTextColor(44, 44, 44)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(text, left, y)
      y += 6
    }

    const addDivider = () => {
      doc.setDrawColor(232, 234, 237)
      doc.setLineWidth(0.3)
      doc.line(left, y, right, y)
      y += 6
    }

    const addTextBlock = (lines, fontSize = 11, color = [44, 44, 44]) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...color)
      const wrapped = doc.splitTextToSize(lines, contentW)
      ensureSpace(wrapped.length, 5)
      doc.text(wrapped, left, y)
      y += wrapped.length * 5
    }

    // --- Resum del període ---
    addHeading('1) Resum del període')
    addDivider()

    const periodLabel = PERIOD_LABELS[periodDays] || `Últims ${periodDays} dies`
    const totalEntries = entriesToExport.length
    const moodAvgText = avgMoodExport == null ? '—' : `${avgMoodExport.toFixed(1)}/5`
    const sleepAvgText = avgSleepHours == null ? '—' : `${avgSleepHours.toFixed(1)}h`

    addTextBlock(
      `Pacient: ${patient?.full_name || 'Desconegut'}\nPeríode: ${periodLabel}\nEntrades: ${totalEntries}\nÀnim mitjà: ${moodAvgText} (${exportStatus.label})\nSon mitjà: ${sleepAvgText}` +
      (minSleepHours != null && maxSleepHours != null ? ` (mín ${minSleepHours.toFixed(1)}h · màx ${maxSleepHours.toFixed(1)}h)` : ''),
    11
    )

    // --- Indicadors extra ---
    addHeading('2) Indicadors clau')
    addDivider()

    const indicatorLines = [
      `Social: ${exportAvgSocial == null ? '—' : `${exportAvgSocial}/5`}`,
      `Física: ${exportAvgPhysical == null ? '—' : `${exportAvgPhysical}/5`}`,
      `Alimentació: ${exportAvgNutrition == null ? '—' : `${exportAvgNutrition}/5`}`,
      `Racha actual: ${streak} dia${streak === 1 ? '' : 's'}`
    ]
    addTextBlock(indicatorLines.join('\n'), 11, [44, 44, 44])

    // --- Distribució de l’ànim ---
    addHeading('3) Distribució d’ànim (1-5)')
    addDivider()
    const distLines = [`1: ${moodCounts[1]} · 2: ${moodCounts[2]} · 3: ${moodCounts[3]} · 4: ${moodCounts[4]} · 5: ${moodCounts[5]}`]
    addTextBlock(distLines.join('\n'), 11, [44, 44, 44])

    // --- Mini-gràfiques (últims punts) ---
    if (chartPoints.length >= 2) {
      addHeading('4) Tendència (últims punts)')
      addDivider()

      // Layout charts: dues gràfiques seguidas
      const chartX = left
      const chartW = contentW
      const chartH = 38

      // Mood line chart
      const moodTop = y
      const moodBase = moodTop + chartH
      const moodVals = chartPoints.map(p => p.anim).map(toNum).filter(v => v != null)
      const moodMin = 1
      const moodMax = 5

      doc.setDrawColor(240, 240, 240)
      doc.setLineWidth(0.3)
      for (let i = 0; i <= 4; i++) {
        const yy = moodBase - (i / 4) * chartH
        doc.line(chartX, yy, chartX + chartW, yy)
      }

      // line + points
      const xStep = chartPoints.length > 1 ? chartW / (chartPoints.length - 1) : 0
      doc.setDrawColor(91, 141, 184)
      doc.setLineWidth(0.7)
      let lastX = null
      let lastY = null

      for (let i = 0; i < chartPoints.length; i++) {
        const v = toNum(chartPoints[i]?.anim)
        if (v == null) continue
        const xx = chartX + i * xStep
        const yy = moodBase - ((v - moodMin) / (moodMax - moodMin)) * chartH
        if (lastX != null) doc.line(lastX, lastY, xx, yy)
        doc.setFillColor(91, 141, 184)
        doc.circle(xx, yy, 1.2, 'F')
        lastX = xx
        lastY = yy
      }

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(44, 44, 44)
      doc.setFontSize(10.5)
      doc.text('Ànim', chartX, moodTop - 2)

      y = moodBase + 10

      // Sleep bar chart
      const sleepTop = y
      const sleepBase = sleepTop + chartH
      const sleepValsChart = chartPoints.map(p => p.son).map(toNum).filter(v => v != null)
      const sleepMax = sleepValsChart.length ? Math.max(...sleepValsChart, 9) : 9
      const barW = chartW / chartPoints.length

      doc.setDrawColor(240, 240, 240)
      doc.setLineWidth(0.3)
      for (let i = 0; i <= 4; i++) {
        const yy = sleepBase - (i / 4) * chartH
        doc.line(chartX, yy, chartX + chartW, yy)
      }

      doc.setFillColor(123, 175, 158)
      for (let i = 0; i < chartPoints.length; i++) {
        const v = toNum(chartPoints[i]?.son)
        if (v == null) continue
        const xxCenter = chartX + i * barW + barW / 2
        const barHeight = (v / sleepMax) * chartH
        const xx = xxCenter - (barW * 0.25)
        const yy = sleepBase - barHeight
        const w = barW * 0.5
        const h = barHeight
        doc.rect(xx, yy, w, h, 'F')
      }

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(44, 44, 44)
      doc.setFontSize(10.5)
      doc.text('Son (h)', chartX, sleepTop - 2)

      // pequeña leyenda
      y = sleepBase + 12
    }

    // --- Últimas entrades ---
    addHeading('5) Últimes entrades')
    addDivider()

    const lastEntries = [...entriesToExport]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    doc.setTextColor(44, 44, 44)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)

    for (const e of lastEntries) {
      const date = safeDate(e?.created_at)
      const mood = e?.mood_score != null ? `${e.mood_score}/5` : '—'
      const sleep = e?.sleep_hours != null ? `${toNum(e.sleep_hours)?.toFixed(1)}h` : '—'
      const summary = truncate(e?.conversation_summary || '-', 95)
      const line = `• ${date} — Ànim ${mood} — Son ${sleep}\n  ${summary}`
      const wrapped = doc.splitTextToSize(line, contentW)
      ensureSpace(wrapped.length, 5)
      doc.text(wrapped, left, y)
      y += wrapped.length * 5
    }

    // Footer
    doc.setFontSize(9.5)
    doc.setTextColor(90, 90, 90)
    doc.text('Informe generat per Evan', left, pageH - 8)

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
      <div className="page-header" style={{ background: COLORS.white }}>
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

      <div className="page-body">
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
            <div className="dashboard-charts">
              <MoodChart data={chartData} />
              <SleepChart data={chartData} />
              <div className="chart-full">
                <OtherIndicators social={avgSocial} physical={avgPhysical} nutrition={avgNutrition} />
              </div>
            </div>

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
