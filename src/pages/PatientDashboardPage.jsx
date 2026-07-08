import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDiaryEntries } from '../services/supabase'
import BottomNav from '../components/shared/BottomNav'
import { OtherIndicators, COLORS } from '../components/shared/EvanUI'
import { PeriodSelector, MoodChart, SleepChart } from '../components/shared/DashboardCharts'
import { buildChartData, calcStreak, avgScore } from '../utils/chartData'

const PERIOD_LABELS = { 7: 'Última setmana', 30: 'Últim mes', 90: 'Últims 3 mesos' }

export default function PatientDashboardPage() {
  const { session } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getDiaryEntries(session.user.id, period)
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [period, session.user.id])

  const chartData = buildChartData(entries, period)
  const streak = calcStreak(entries)
  const avgSocial = avgScore(entries, 'social_activity')
  const avgPhysical = avgScore(entries, 'physical_activity')
  const avgNutrition = avgScore(entries, 'nutrition')

  return (
    <div style={{
      minHeight: '100svh',
      background: COLORS.bg,
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 90,
    }}>
      <div className="page-header" style={{ background: COLORS.white }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>El teu progrés</h1>
        <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>
          {PERIOD_LABELS[period]}
        </p>
      </div>

      <div className="page-body">
        {streak > 1 && (
          <div style={{
            background: '#FFF4E5',
            borderRadius: 14,
            padding: '14px 16px',
            color: '#855D2D',
            fontSize: 14,
            fontWeight: 600,
          }}>
            🔥 {streak} dies de ratxa consecutiva!
          </div>
        )}

        <PeriodSelector period={period} onChange={setPeriod} />

        {loading ? (
          <p style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>Carregant...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <span style={{ fontSize: 48 }}>📔</span>
            <p style={{ color: COLORS.textSecondary, fontSize: 15, marginTop: 16, lineHeight: 1.6 }}>
              Encara no tens entrades al diari.<br />
              Completa una conversa amb Evan per veure el teu progrés.
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
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
