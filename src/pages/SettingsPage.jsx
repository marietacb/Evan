// SettingsPage.jsx — configuración del usuario
// Permite editar nombre, hora de notificación e idioma, y cerrar sesión
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  upsertProfile, signOut, acceptLinkage,
  getEmergencyContacts, addEmergencyContact, deleteEmergencyContact,
  deleteAccount,
} from '../services/supabase'
import BottomNav from '../components/shared/BottomNav'

export default function SettingsPage() {
  const { profile, session, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [notifTime, setNotifTime] = useState(profile?.notification_time || '21:00')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [linkCode, setLinkCode] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactError, setContactError] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (profile?.role !== 'patient' || !session?.user?.id) return
    async function loadContacts() {
      const { data } = await getEmergencyContacts(session.user.id)
      setEmergencyContacts(data || [])
    }
    loadContacts()
  }, [profile?.role, session?.user?.id])

  async function handleSave() {
    setLoading(true)
    await upsertProfile(session.user.id, {
      full_name: fullName,
      notification_time: notifTime,
    })
    await refreshProfile()
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLink() {
    setLinkLoading(true)
    setLinkError('')
    const { error } = await acceptLinkage(session.user.id, linkCode)
    setLinkLoading(false)
    if (error) {
      setLinkError('Codi incorrecte o ja utilitzat')
    } else {
      setLinkSuccess(true)
      setLinkCode('')
    }
  }

  async function handleAddContact() {
    setContactError('')
    if (!contactName.trim()) { setContactError('Introdueix un nom'); return }
    if (!contactPhone.trim()) { setContactError('Introdueix un telèfon'); return }

    setContactLoading(true)
    const { data, error } = await addEmergencyContact(
      session.user.id,
      contactName.trim(),
      contactPhone.trim(),
    )
    setContactLoading(false)

    if (error) {
      setContactError(error.message)
      return
    }

    setEmergencyContacts(prev => [...prev, data])
    setContactName('')
    setContactPhone('')
  }

  async function handleDeleteContact(contactId) {
    const { error } = await deleteEmergencyContact(contactId)
    if (!error) {
      setEmergencyContacts(prev => prev.filter(c => c.id !== contactId))
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const { error } = await deleteAccount()
    if (error) {
      setDeleting(false)
      alert('Error eliminant el compte: ' + error.message)
      return
    }
    await signOut()
    setDeleting(false)
    window.location.href = '/login'
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: '#F5F5F5',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: 90,
    }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        padding: '48px 24px 32px',
        color: '#FFFFFF',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Configuració ⚙️</h1>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Sección datos personales */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>
            Dades personals
          </p>
          <label style={labelStyle}>Nom complet</label>
          <input
            className="input-field"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        {/* Sección notificaciones */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>
            Notificacions
          </p>
          <label style={labelStyle}>Hora del recordatori del diari</label>
          <input
            className="input-field"
            type="time"
            value={notifTime}
            onChange={e => setNotifTime(e.target.value)}
          />
        </div>

        {profile?.role === 'patient' && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 8 }}>
              Contactes d'emergència
            </p>
            <p style={{ fontSize: 13, color: '#5B6B7A', marginBottom: 16 }}>
              Afig persones de confiança que apareixeran al kit d'emergència.
            </p>

            {emergencyContacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {emergencyContacts.map(contact => (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#F5F5F5', borderRadius: 12, padding: '12px 14px',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#2C2C2C' }}>{contact.name}</p>
                      <p style={{ fontSize: 13, color: '#5B6B7A' }}>{contact.phone}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      style={{
                        background: 'none', border: '1.5px solid #E0E0E0', borderRadius: 8,
                        padding: '6px 12px', fontFamily: 'Poppins, sans-serif',
                        fontSize: 12, fontWeight: 600, color: '#5B6B7A', cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label style={labelStyle}>Nom</label>
            <input
              className="input-field"
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Ex: Maria García"
              style={{ marginBottom: 12 }}
            />
            <label style={labelStyle}>Telèfon</label>
            <input
              className="input-field"
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="Ex: 600 123 456"
              style={{ marginBottom: 12 }}
            />
            {contactError && <p className="error-msg" style={{ marginBottom: 8 }}>{contactError}</p>}
            <button
              className="btn-secondary"
              onClick={handleAddContact}
              disabled={contactLoading}
            >
              {contactLoading ? 'Carregant...' : 'Afegir'}
            </button>
          </div>
        )}

        {/* Sección vinculación — solo para pacientes */}
        {profile?.role === 'patient' && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#2C2C2C', marginBottom: 8 }}>
              Vincular amb psicòleg/a
            </p>
            <p style={{ fontSize: 13, color: '#5B6B7A', marginBottom: 12 }}>
              Introdueix el codi que t'ha donat el teu psicòleg/a.
            </p>
            <input
              className="input-field"
              type="text"
              value={linkCode}
              onChange={e => setLinkCode(e.target.value.toUpperCase())}
              placeholder="Ex: AB12CD"
              maxLength={6}
              style={{ letterSpacing: 4, fontWeight: 700, fontSize: 18, textAlign: 'center' }}
            />
            {linkError && <p className="error-msg" style={{ marginTop: 8 }}>{linkError}</p>}
            {linkSuccess && <p style={{ color: '#7BAF9E', fontSize: 14, marginTop: 8 }}>✅ Vinculat correctament!</p>}
            <button
              className="btn-primary"
              onClick={handleLink}
              disabled={linkCode.length < 6 || linkLoading}
              style={{ marginTop: 12 }}
            >
              {linkLoading ? 'Carregant...' : 'Vincular'}
            </button>
          </div>
        )}

        {/* Botón guardar */}
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {saved ? '✅ Canvis guardats' : loading ? 'Carregant...' : 'Guardar canvis'}
        </button>

        

        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: '#D9534F',
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer',
            width: '100%',
            minHeight: 48,
          }}
        >
          Eliminar compte
        </button>

        {showDeleteConfirm && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 15, color: '#2C2C2C', marginBottom: 16 }}>
              Estàs segur? Esta acció no es pot desfer i eliminarà totes les teues dades.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: '2px solid #E0E0E0',
                  borderRadius: 12,
                  padding: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#5B6B7A',
                  cursor: 'pointer',
                  minHeight: 48,
                }}
              >
                Cancel·lar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  background: '#D9534F',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  minHeight: 48,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Eliminant...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '2px solid #E0E0E0',
            borderRadius: 12,
            padding: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#5B6B7A',
            cursor: 'pointer',
            width: '100%',
            minHeight: 48,
          }}
        >
          Tancar sessió
        </button>

      </div>

      <BottomNav />
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#2C2C2C', marginBottom: 6,
}