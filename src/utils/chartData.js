const DAY_LABELS = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds']

export function buildChartData(entries, period) {
  if (period === 7) return buildWeekChartData(entries)
  return entries.map(e => {
    const d = new Date(e.created_at)
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      anim: e.mood_score,
      son: e.sleep_hours,
    }
  })
}

function buildWeekChartData(entries) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayEntries = entries.filter(e => {
      const ed = new Date(e.created_at)
      ed.setHours(0, 0, 0, 0)
      return ed.getTime() === d.getTime()
    })
    const latest = dayEntries[dayEntries.length - 1]
    days.push({
      label: DAY_LABELS[d.getDay()],
      anim: latest?.mood_score ?? null,
      son: latest?.sleep_hours ?? null,
    })
  }

  return days
}

export function calcStreak(entries) {
  if (!entries.length) return 0
  const dates = new Set(
    entries.map(e => new Date(e.created_at).toDateString())
  )
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (dates.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function moodStatusLabel(avgMood) {
  if (avgMood == null) return { label: '—', color: '#8A96A3' }
  if (avgMood >= 4) return { label: 'Bé', color: '#7BAF9E' }
  if (avgMood >= 3) return { label: 'Atenció', color: '#F0C040' }
  return { label: 'Alerta', color: '#E07B4A' }
}

export function avgScore(list, field) {
  if (!list.length) return null
  const vals = list.filter(e => e[field] != null)
  if (!vals.length) return null
  return Math.round(vals.reduce((s, e) => s + e[field], 0) / vals.length)
}

export function formatLastEntry(dateStr) {
  if (!dateStr) return 'Sense registre'
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const entryDay = new Date(d)
  entryDay.setHours(0, 0, 0, 0)
  const diff = Math.round((today - entryDay) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'avui'
  if (diff === 1) return 'ahir'
  return `fa ${diff} dies`
}
