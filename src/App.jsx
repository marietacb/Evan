// App.jsx — router principal de Evan
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Autenticación
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RoleSelectPage from './pages/RoleSelectPage'
import OnboardingPage from './pages/OnboardingPage'

// Paciente
import PatientHomePage from './pages/PatientHomePage'
import PatientDashboardPage from './pages/PatientDashboardPage'
import DiaryPage from './pages/DiaryPage'
import SettingsPage from './pages/SettingsPage'
import EmergencyPage from './pages/EmergencyPage'

// Psicólogo
import PsychologistHomePage from './pages/PsychologistHomePage'
import PsychologistDashboardPage from './pages/PsychologistDashboardPage'

function PatientRoute({ children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'patient') return <Navigate to="/psychologist" replace />
  return children
}

function PsychologistRoute({ children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'psychologist') return <Navigate to="/home" replace />
  return children
}

export default function App() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F5F5F5',
        fontFamily: 'Poppins, sans-serif', color: '#5B6B7A', fontSize: 16,
      }}>
        Carregant...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Post-registro */}
        <Route path="/select-role" element={session ? <RoleSelectPage /> : <Navigate to="/login" replace />} />
        <Route path="/onboarding" element={session ? <OnboardingPage /> : <Navigate to="/login" replace />} />

        {/* Paciente */}
        <Route path="/home" element={<PatientRoute><PatientHomePage /></PatientRoute>} />
        <Route path="/diary" element={<PatientRoute><DiaryPage /></PatientRoute>} />
        <Route path="/emergency" element={<PatientRoute><EmergencyPage /></PatientRoute>} />
        <Route path="/dashboard" element={<PatientRoute><PatientDashboardPage /></PatientRoute>} />
        <Route path="/settings" element={<PatientRoute><SettingsPage /></PatientRoute>} />

        {/* Psicólogo */}
        <Route path="/psychologist" element={<PsychologistRoute><PsychologistHomePage /></PsychologistRoute>} />
        <Route
          path="/psychologist/patient/:patientId"
          element={<PsychologistRoute><PsychologistDashboardPage /></PsychologistRoute>}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to={
              session
                ? profile?.role === 'psychologist' ? '/psychologist' : '/home'
                : '/'
            } replace />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}