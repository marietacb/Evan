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
import { ContactRow, AddContactButton, COLORS } from '../components/shared/EvanUI'

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
  const [showAddContact, setShowAddContact] = useState(false)
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
    setShowAddContact(false)
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
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        color: '#FFFFFF',
        paddingBottom: 32,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Configuració ⚙️</h1>
      </div>

      <div className="page-body">

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
          <div style={{ background: COLORS.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 6 }}>
              Contactes d'emergència
            </p>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>
              Persones que et poden ajudar
            </p>

            {emergencyContacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {emergencyContacts.map((contact, i) => (
                  <div key={contact.id}>
                    <ContactRow contact={contact} colorIndex={i} callColor={COLORS.green} />
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      style={{
                        background: 'none', border: 'none', marginTop: 6,
                        fontFamily: 'Poppins, sans-serif', fontSize: 12,
                        fontWeight: 600, color: COLORS.textMuted, cursor: 'pointer',
                        padding: '4px 0', width: '100%', textAlign: 'right',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddContact ? (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Nom</label>
                <input
                  className="input-field"
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Ex: Mare"
                  style={{ marginBottom: 12 }}
                />
                <label style={labelStyle}>Telèfon</label>
                <input
                  className="input-field"
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="Ex: +34 612 345 678"
                  style={{ marginBottom: 12 }}
                />
                {contactError && <p className="error-msg" style={{ marginBottom: 8 }}>{contactError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => { setShowAddContact(false); setContactError('') }}
                    style={{ flex: 1 }}
                  >
                    Cancel·lar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleAddContact}
                    disabled={contactLoading}
                    style={{ flex: 1 }}
                  >
                    {contactLoading ? 'Carregant...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <AddContactButton onClick={() => setShowAddContact(true)} />
            )}
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