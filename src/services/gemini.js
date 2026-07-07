// gemini.js — servicio de comunicación con la API de Gemini
// Gestiona la conversación del diario inteligente de Evan
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const MODEL = 'gemini-2.5-flash'

function isRateLimitError(err) {
  return err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Resource exhausted')
}

// System prompt que define el comportamiento de Evan durante el diario
function buildSystemPrompt(profile) {
  return `Ets l'Evan, un assistent terapèutic empàtic i càlid. 
Acompanyes al pacient ${profile?.full_name || 'l\'usuari'} en el seu diari emocional nocturn.

La teva missió és fer preguntes naturals i conversacionals sobre:
- Com s'ha sentit avui (estat d'ànim de l'1 al 5)
- Quantes hores ha dormit
- Si ha fet activitat física
- Com ha estat la seva alimentació
- Si ha tingut contacte social

Normes importants:
- Parla sempre en valencià, de manera càlida i propera
- Fes UNA sola pregunta cada vegada, no diverses
- Escolta activament i respon amb empatia abans de fer la següent pregunta
- La conversa ha de durar entre 5 i 8 missatges
- Quan tinguis tota la informació, acomiada't amb un missatge càlid

Quan l'usuari escrigui "FINALITZAR_CONVERSA", respon ÚNICAMENT amb aquest JSON (sense cap text addicional):
{
  "mood_score": (número 1-5),
  "sleep_hours": (número decimal, ex: 7.5),
  "social_activity": (número 1-5),
  "physical_activity": (número 1-5),
  "nutrition": (número 1-5),
  "conversation_summary": "(resum breu en valencià de com s'ha sentit el pacient)",
  "risk_level": (0=sense risc, 1=lleu, 2=moderat, 3=greu)
}`
}

// Inicia una conversación nueva y devuelve el primer mensaje de Evan
export async function startDiaryConversation(profile) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildSystemPrompt(profile),
  })

  const chat = model.startChat({ history: [] })

  const result = await chat.sendMessage('Inicia la conversa del diari')
  const text = result.response.text()

  return { chat, firstMessage: text }
}

// Envía un mensaje del usuario y devuelve la respuesta de Evan
export async function sendMessage(chat, userMessage) {
  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

export function getGeminiErrorMessage(err) {
  if (isRateLimitError(err)) {
    return 'Has arribat al límit de peticions (5 per minut). Espera 1 minut i recarrega la pàgina.'
  }
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return 'No s\'ha configurat la clau de l\'API de Gemini.'
  }
  return 'Ho sent, hi ha hagut un error. Torna-ho a intentar més tard.'
}

// Extrae el JSON con los datos del diario de la respuesta final de Evan
export function parseConversationData(jsonText) {
  try {
    // Limpia posibles caracteres extra alrededor del JSON
    const clean = jsonText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Error parseando JSON de Evan:', err)
    return null
  }
}