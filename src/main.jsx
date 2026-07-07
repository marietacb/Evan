//main.jsx - Punto de entrada de la aplicación
//Envuelve toda la app en el contexto de autenticación
//cualquier componente puede usar el hook useAuth() para acceder al usuario y perfil
//sin tener que pasarlas como props

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './hooks/useAuth.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)