//supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//AUTENTIFICACION DE USUARIO

//Para registrar un nuevo usuario
export async function signUp(email, password) {
    return supabase.auth.signUp({ email, password })
}

//Para iniciar sesión
export async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
}

//Para cerrar sesión
export async function signOut() {
    return supabase.auth.signOut()
}

//Envia correo de recuperación de contraseña
export async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email)
}


//PERFIL DE USUARIO
//La tabla profiles usa id como PK (= el id de auth.users) no 'user_id'

//Crear o actualizar el perfil de usuario
export async function upsertProfile(userId, data) {
    return supabase
        .from('profiles')
        .upsert({ id: userId, ...data })
        .select()
        .single()
}

//Leer el perfil de usuario
export async function getProfile(userId) {
    return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
}

//Actualiza solo el rol (paciente o psicologo)
export async function updateRole(userId, role) {
    return supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
}

//DIARIO

//Guardar una entrada del diario tras la coversación con Evan
export async function saveDiaryEntry(userId, entryData) {
    return supabase
        .from('diary_entries')
        .insert({ user_id: userId, ...entryData})
        .select()
        .single()
}

//Obtiente las entradas del diario de los útlimso N dias
export async function getDiaryEntries(userId, days = 7) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })
}

// Guarda el historial completo de una conversación con Evan
export async function saveConversation(userId, type, messages, riskLevel = 0) {
    return supabase
      .from('conversations')
      .insert({ user_id: userId, type, messages, risk_level: riskLevel })
      .select()
      .single()
  }

  // ── VINCULACIÓN PSICÓLOGO-PACIENTE ────────────────────────────────────────────

// El psicólogo genera un código único para compartir con el paciente
export async function createLinkage(psychologistId) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return supabase
    .from('linkages')
    .insert({ psychologist_id: psychologistId, invite_code: code, status: 'pending' })
    .select()
    .single()
}

// El paciente usa el código para vincularse con el psicólogo
export async function acceptLinkage(patientId, inviteCode) {
  return supabase
    .from('linkages')
    .update({ patient_id: patientId, status: 'active', linked_at: new Date().toISOString() })
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('status', 'pending')
    .select()
    .single()
}

// El psicólogo obtiene la lista de sus pacientes vinculados
export async function getLinkedPatients(psychologistId) {
  return supabase
    .from('linkages')
    .select('id, patient_id, linked_at')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'active')
}

// Obtiene el perfil de un paciente específico (para el psicólogo)
export async function getPatientProfile(patientId) {
  return supabase
    .from('profiles')
    .select('full_name, age')
    .eq('id', patientId)
    .single()
}

// Obtiene las entradas del diario de un paciente (para el psicólogo)
export async function getPatientDiaryEntries(patientId, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  return supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', patientId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
}

// ── ALERTAS ───────────────────────────────────────────────────────────────────

// Obtiene el psicólogo vinculado a un paciente
export async function getLinkedPsychologist(patientId) {
  return supabase
    .from('linkages')
    .select('psychologist_id')
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .single()
}

// Crea una alerta de riesgo para el psicólogo
export async function createAlert(patientId, psychologistId, riskLevel) {
  return supabase
    .from('alerts')
    .insert({ patient_id: patientId, psychologist_id: psychologistId, risk_level: riskLevel })
}

// Obtiene las alertas no vistas del psicólogo
export async function getUnseenAlerts(psychologistId) {
  return supabase
    .from('alerts')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('status', 'unseen')
    .order('created_at', { ascending: false })
}

// Marca una alerta como vista
export async function markAlertSeen(alertId) {
  return supabase
    .from('alerts')
    .update({ status: 'seen' })
    .eq('id', alertId)
}

// Marca como vistas todas las alertas no vistas de un paciente
export async function markPatientAlertsSeen(psychologistId, patientId) {
  return supabase
    .from('alerts')
    .update({ status: 'seen' })
    .eq('psychologist_id', psychologistId)
    .eq('patient_id', patientId)
    .eq('status', 'unseen')
}

// ── CONTACTES D'EMERGÈNCIA ───────────────────────────────────────────────────

export async function getEmergencyContacts(userId) {
  return supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: true })
}

export async function addEmergencyContact(userId, name, phone) {
  return supabase
    .from('emergency_contacts')
    .insert({ user_id: userId, name, phone })
    .select()
    .single()
}

export async function deleteEmergencyContact(contactId) {
  return supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId)
}

export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: { Authorization: `Bearer ${session?.access_token}` }
  })
  return { data, error }
}