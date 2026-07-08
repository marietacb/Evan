import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/shared/BottomNav'
import { COLORS } from '../components/shared/EvanUI'

export default function PatientHomePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const firstName = profile?.full_name?.split(' ')[0] || 'benvingut/da'

  return (
    <div style={{
      minHeight: '100svh',
      background: COLORS.bg,
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 90,
    }}>
      <div style={{ padding: '52px 20px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>
          Hola, {firstName}
        </h1>
        <p style={{ fontSize: 15, color: COLORS.textSecondary, marginTop: 6 }}>
          Com et trobes avui?
        </p>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <HomeCard
          emoji="📓"
          title="Diari intel·ligent"
          subtitle="Registra el teu dia amb Evan"
          bg="#E8F3EE"
          onClick={() => navigate('/diary')}
        />
        <HomeCard
          emoji="🆘"
          title="Kit d'emergència"
          subtitle="Accés ràpid en moments difícils"
          bg="#E3EEF7"
          onClick={() => navigate('/emergency')}
        />
        <HomeCard
          emoji="💬"
          title="Parla amb Evan"
          subtitle="El teu acompanyant 24 hores"
          bg="#ECEEF5"
          soon
        />
      </div>

      <BottomNav />
    </div>
  )
}

function HomeCard({ emoji, title, subtitle, bg, onClick, soon }) {
  return (
    <button
      onClick={soon ? undefined : onClick}
      style={{
        background: bg,
        border: 'none',
        borderRadius: 20,
        padding: '28px 24px',
        cursor: soon ? 'default' : 'pointer',
        textAlign: 'left',
        width: '100%',
        opacity: soon ? 0.65 : 1,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{emoji}</span>
      <p style={{ fontWeight: 700, fontSize: 18, color: COLORS.text, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.4 }}>{subtitle}</p>
      {soon && (
        <span style={{
          display: 'inline-block',
          marginTop: 10,
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.textMuted,
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 8,
          padding: '3px 10px',
        }}>
          Pròximament
        </span>
      )}
    </button>
  )
}
