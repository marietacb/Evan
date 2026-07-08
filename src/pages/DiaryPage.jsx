// DiaryPage.jsx — conversación del diario inteligente con Evan
// El usuario chatea con Evan, que extrae datos y los guarda en Supabase
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { startDiaryConversation, sendMessage, parseConversationData, getGeminiErrorMessage } from '../services/gemini'
import { saveDiaryEntry, saveConversation, getLinkedPsychologist, createAlert } from '../services/supabase'

export default function DiaryPage() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])       // historial del chat
  const [input, setInput] = useState('')             // texto del input
  const [chat, setChat] = useState(null)             // instancia del chat de Gemini
  const [loading, setLoading] = useState(true)       // cargando primer mensaje
  const [sending, setSending] = useState(false)      // enviando mensaje
  const [finished, setFinished] = useState(false)    // conversación finalizada
  const [saving, setSaving] = useState(false)        // guardando en Supabase
  const bottomRef = useRef(null)                     // para hacer scroll automático
  const initStarted = useRef(false)                  // evita doble llamada en StrictMode

  // Inicia la conversación al cargar la página
  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

    async function init() {
      try {
        const { chat: newChat, firstMessage } = await startDiaryConversation(profile)
        setChat(newChat)
        setMessages([{ role: 'evan', text: firstMessage }])
      } catch (err) {
        console.error('Error iniciant diari:', err)
        setMessages([{ role: 'evan', text: getGeminiErrorMessage(err) }])
      }
      setLoading(false)
    }
    init()
  }, [])

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Envía un mensaje del usuario
  async function handleSend() {
    if (!input.trim() || sending || !chat) return

    const userText = input.trim()
    setInput('')
    setSending(true)

    // Añade el mensaje del usuario al historial
    setMessages(prev => [...prev, { role: 'user', text: userText }])

    try {
      const response = await sendMessage(chat, userText)
      setMessages(prev => [...prev, { role: 'evan', text: response }])
    } catch (err) {
      console.error('Error enviant missatge:', err)
      setMessages(prev => [...prev, { role: 'evan', text: getGeminiErrorMessage(err) }])
    }

    setSending(false)
  }

  // Finaliza la conversación y guarda los datos en Supabase
  async function handleFinish() {
    if (!chat || saving) return
    setSaving(true)

    try {
      // Pide a Evan que genere el JSON con los datos extraídos
      const jsonResponse = await sendMessage(chat, 'FINALITZAR_CONVERSA')
      const data = parseConversationData(jsonResponse)

      if (data) {
        const userId = session.user.id

        // Guarda la entrada del diario
        await saveDiaryEntry(userId, {
          mood_score: data.mood_score,
          sleep_hours: data.sleep_hours,
          social_activity: data.social_activity,
          physical_activity: data.physical_activity,
          nutrition: data.nutrition,
          conversation_summary: data.conversation_summary,
        })

        // Guarda el historial completo de la conversación
        await saveConversation(userId, 'diary', messages, data.risk_level)

        // Si el riesgo es moderado o grave (>=2), crear alerta para el psicólogo
        if (data.risk_level >= 2) {
          const { data: linkage } = await getLinkedPsychologist(userId)
          if (linkage?.psychologist_id) {
            await createAlert(userId, linkage.psychologist_id, data.risk_level)
          }
        }
      }

      setFinished(true)
    } catch (err) {
      console.error('Error guardant:', err)
    }

    setSaving(false)
  }

  // Enviar con la tecla Enter
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Pantalla de confirmación tras guardar
  if (finished) {
    return (
      <div style={{
        minHeight: '100svh', background: '#F5F5F5', fontFamily: 'Poppins, sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}>
        <span style={{ fontSize: 64, marginBottom: 24 }}>🌙</span>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#2C2C2C', marginBottom: 12 }}>
          Entrada guardada!
        </h1>
        <p style={{ color: '#5B6B7A', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
          Gràcies per compartir el teu dia amb Evan. Bona nit! 🌿
        </p>
        <button className="btn-primary" style={{ maxWidth: 280 }} onClick={() => navigate('/home')}>
          Tornar a l'inici
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100svh', background: '#F5F5F5', fontFamily: 'Poppins, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Cabecera */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #5B8DB8, #7BAF9E)',
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 20,
      }}>
        <button onClick={() => navigate('/home')} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
          width: 36, height: 36, cursor: 'pointer', color: '#FFFFFF', fontSize: 18,
        }}>←</button>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF' }}>Diari intel·ligent</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Evan t'escolta 🌿</p>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px var(--page-padding-x)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {loading && (
          <div style={{ textAlign: 'center', color: '#5B6B7A', fontSize: 14, marginTop: 40 }}>
            Evan està preparant-se...
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user' ? '#5B8DB8' : '#FFFFFF',
              color: msg.role === 'user' ? '#FFFFFF' : '#2C2C2C',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '12px 16px',
              fontSize: 14,
              lineHeight: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador "Evan está escribiendo" */}
        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '18px 18px 18px 4px',
              padding: '12px 16px', fontSize: 14, color: '#5B6B7A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              Evan està escrivint...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input y botones */}
      <div style={{
        background: '#FFFFFF', borderTop: '1px solid #E0E0E0',
        padding: '12px var(--page-padding-x) 28px', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Escriu aquí..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            style={{
              background: '#5B8DB8', border: 'none', borderRadius: 12,
              width: 48, height: 48, cursor: 'pointer', fontSize: 20,
              color: '#FFFFFF', flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={handleFinish}
          disabled={saving || messages.length < 3}
        >
          {saving ? 'Guardant...' : 'Finalitzar i guardar 🌙'}
        </button>
      </div>

    </div>
  )
}