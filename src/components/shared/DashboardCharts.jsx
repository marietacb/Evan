import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { COLORS } from './EvanUI'

export const PERIOD_OPTIONS = [
  { label: '7 dies', days: 7 },
  { label: '30 dies', days: 30 },
  { label: '3 mesos', days: 90 },
]

export function PeriodSelector({ period, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: COLORS.white,
      borderRadius: 24,
      padding: 4,
      border: `1px solid ${COLORS.border}`,
    }}>
      {PERIOD_OPTIONS.map(p => {
        const active = period === p.days
        return (
          <button
            key={p.days}
            onClick={() => onChange(p.days)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 20,
              border: 'none',
              background: active ? '#ECEEF0' : 'transparent',
              color: active ? COLORS.text : COLORS.textMuted,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

export function MoodChart({ data }) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Estat d'ànim</p>
        <p style={{ fontSize: 12, color: COLORS.textMuted }}>Escala 1-5</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="anim"
            stroke={COLORS.blue}
            strokeWidth={2}
            dot={{ fill: COLORS.blue, r: 5, strokeWidth: 0 }}
            connectNulls
            name="Ànim"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SleepChart({ data }) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Hores de son</p>
        <p style={{ fontSize: 12, color: COLORS.textMuted }}>Hores per nit</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
          <YAxis ticks={[1, 3, 5, 7, 9]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip />
          <Bar dataKey="son" fill={COLORS.green} radius={[8, 8, 0, 0]} name="Hores" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
