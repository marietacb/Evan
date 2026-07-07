// PatientHomePage.jsx — pantalla principal del paciente
// Muestra saludo personalizado y las 3 tarjetas de acceso
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BottomNav from '../components/shared/BottomNav'

export default function PatientHomePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Saludo según la hora del día
  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bon dia'
    if (hour < 20) return 'Bona vesprada'
    return 'Bona nit'
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 90, // espacio para la BottomNav
    }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        padding: '48px 24px 32px',
        color: '#FFFFFF',
      }}>
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>
          {getGreeting()},
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>
          {profile?.full_name || 'benvingut/da'} 👋
        </h1>
        <p style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
          Com et sents avui?
        </p>
      </div>

      {/* Tarjetas */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Tarjeta 1 — Diari intel·ligent (funcional) */}
        <HomeCard
          emoji="📔"
          title="Diari intel·ligent"
          desc="Registra com et sents avui amb l'ajuda d'Evan"
          color="#5B8DB8"
          onClick={() => navigate('/diary')}
        />

        <HomeCard
          emoji="🆘"
          title="Kit d'emergència"
          desc="Tècniques de suport immediat"
          color="#7BAF9E"
          onClick={() => navigate('/emergency')}
        />

        {/* Tarjeta 3 — Parla amb Evan (no funcional en MVP) */}
        <HomeCard
          emoji="💬"
          title="Parla amb Evan"
          desc="Xat d'acompanyament disponible 24h"
          color="#5B8DB8"
          soon
        />

      </div>

      <BottomNav />
    </div>
  )
}

// Componente interno para cada tarjeta
function HomeCard({ emoji, title, desc, color, onClick, soon }) {
  return (
    <button
      onClick={soon ? undefined : onClick}
      style={{
        background: '#FFFFFF',
        border: 'none',
        borderRadius: 16,
        padding: '20px',
        cursor: soon ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        width: '100%',
        opacity: soon ? 0.6 : 1,
        transition: 'transform 0.15s',
      }}
      onMouseDown={e => { if (!soon) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {/* Icono */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`, // color con 10% opacidad
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 26 }}>{emoji}</span>
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#2C2C2C' }}>{title}</p>
          {soon && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#FFFFFF',
              background: '#5B6B7A', borderRadius: 6, padding: '2px 7px',
            }}>
              Pròximament
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#5B6B7A', lineHeight: 1.4 }}>{desc}</p>
      </div>

      {/* Flecha (solo si es funcional) */}
      {!soon && (
        <span style={{ fontSize: 18, color: color }}>›</span>
      )}
    </button>
  )
}