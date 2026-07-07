// PatientDashboardPage.jsx — dashboard del paciente con gráficos
// Muestra evolución del estado de ánimo y horas de sueño con Recharts
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDiaryEntries } from '../services/supabase'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import BottomNav from '../components/shared/BottomNav'

// Opciones de período
const PERIODS = [
  { label: '7 dies', days: 7 },
  { label: '30 dies', days: 30 },
  { label: '3 mesos', days: 90 },
]

export default function PatientDashboardPage() {
  const { session } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7) // días seleccionados

  // Carga las entradas del diario cuando cambia el período
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getDiaryEntries(session.user.id, period)
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [period])

  // Formatea la fecha para mostrar en el eje X
  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  // Prepara los datos para los gráficos
  const chartData = entries.map(e => ({
    date: formatDate(e.created_at),
    anim: e.mood_score,        // estado de ánimo (1-5)
    son: e.sleep_hours,        // horas de sueño
  }))

  // Calcula promedios
  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1)
    : null
  const avgSleep = entries.length
    ? (entries.reduce((s, e) => s + e.sleep_hours, 0) / entries.length).toFixed(1)
    : null

  return (
    <div style={{
      minHeight: '100svh', background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif', paddingBottom: 90,
    }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        padding: '48px 24px 24px', color: '#FFFFFF',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>El meu progrés 📊</h1>
        <p style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
          El teu historial emocional
        </p>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Selector de período */}
        <div style={{ display: 'flex', gap: 8 }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                border: period === p.days ? 'none' : '1.5px solid #E0E0E0',
                background: period === p.days ? '#5B8DB8' : '#FFFFFF',
                color: period === p.days ? '#FFFFFF' : '#5B6B7A',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#5B6B7A', textAlign: 'center', marginTop: 40 }}>Carregant...</p>
        ) : entries.length === 0 ? (
          /* Estado vacío */
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <span style={{ fontSize: 48 }}>📔</span>
            <p style={{ color: '#5B6B7A', fontSize: 15, marginTop: 16, lineHeight: 1.6 }}>
              Encara no tens entrades al diari.<br />
              Completa una conversa amb Evan per veure el teu progrés.
            </p>
          </div>
        ) : (
          <>
            {/* Tarjetas de promedio */}
            <div style={{ display: 'flex', gap: 12 }}>
              <StatCard label="Ànim mitjà" value={`${avgMood}/5`} emoji="😊" />
              <StatCard label="Son mitjà" value={`${avgSleep}h`} emoji="🌙" />
            </div>

            {/* Gráfico estado de ánimo */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>
                😊 Estat d'ànim
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Poppins' }} />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone" dataKey="anim"
                    stroke="#5B8DB8" strokeWidth={2}
                    dot={{ fill: '#5B8DB8', r: 4 }}
                    name="Ànim"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico horas de sueño */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>
                🌙 Hores de son
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Poppins' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="son" fill="#7BAF9E" radius={[6,6,0,0]} name="Hores" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// Tarjeta de estadística
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