# Evan — Documentación del estado actual

Mapa completo de lo que está implementado, qué funciona de verdad y cómo fluye la navegación en la aplicación.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite |
| Routing | React Router v7 |
| Backend / BBDD | Supabase (Auth + tablas) |
| IA del diario | Google Gemini (`gemini-2.5-flash`) |
| Gráficos | Recharts |
| PDF | jsPDF |
| Despliegue | Vercel |
| Idioma UI | Textos fijos en **valenciano/catalán** (i18next está en `package.json` pero **no se usa**) |

---

## Arquitectura general

```
main.jsx
  └── AuthProvider (useAuth)
        └── App.jsx (Router)
              ├── Rutas públicas
              └── Rutas con sesión
```

El contexto `useAuth` mantiene `session`, `profile` y `loading`, y escucha cambios de sesión de Supabase.

---

## Flujo de navegación completo

### 1. Usuario no autenticado

```
/ (Welcome)
 ├── Inicia sessió → /login
 └── Registra't → /register
```

- **`/login`**: login con email/contraseña → redirige según rol (`/home` paciente, `/psychologist` psicólogo).
- **`/register`**: crea cuenta en Supabase Auth + fila en `profiles` con nombre → redirige a `/select-role`.
- **`/forgot-password`**: envía email de recuperación vía Supabase.

### 2. Post-registro (requiere sesión)

```
/register → /select-role → según rol elegido:
   ├── Paciente → /onboarding (3 pasos) → /home
   └── Psicólogo → /psychologist
```

**`RoleSelectPage`**: guarda `role` en `profiles` (`patient` o `psychologist`).

**`OnboardingPage`** (solo pacientes): 3 pasos:

1. Nombre y edad
2. Frecuencia de visitas al psicólogo → se guarda en `profiles.visit_frequency`
3. Hora del recordatorio del diario → guarda en `profiles` y va a `/home`

### 3. Flujo paciente (requiere sesión)

```
/home (PatientHomePage)
 ├── Diari intel·ligent → /diary
 ├── Kit d'emergència → /emergency
 └── Parla amb Evan → Pròximament (no funcional)

BottomNav fija:
/home ↔ /dashboard ↔ /settings
```

- **`/diary`**: chat con Evan (Gemini) → al finalizar guarda en Supabase y vuelve a `/home`.
- **`/emergency`**: kit de emergencia con técnicas de regulación y contactos de ayuda externa.
- **`/dashboard`**: gráficos de ánimo y sueño (7/30/90 días).
- **`/settings`**: editar nombre, hora de notificación, vincular con psicólogo por código, cerrar sesión.

### 4. Flujo psicólogo (requiere sesión)

```
/psychologist (PsychologistHomePage)
 ├── Generar código de invitación
 ├── Lista de pacientes vinculados (indicador de riesgo + badge de alerta)
 └── Clic en paciente → /psychologist/patient/:patientId
       └── Al entrar: alertas del paciente marcadas como vistas

/psychologist/patient/:id (PsychologistDashboardPage)
 ├── Gráficos del paciente
 ├── Últimas entradas del diario
 └── Exportar PDF
```

El psicólogo **no tiene BottomNav**; solo botón "Eixir" en su home.

**Indicador de color por paciente** (basado en alertas no vistas de la tabla `alerts`):

| Color | Condición |
|-------|-----------|
| Verde `#7BAF9E` | Sin alertas activas (`status = 'unseen'`) |
| Amarillo `#F0C040` | `risk_level` 1 |
| Naranja `#E07B4A` | `risk_level` 2 o 3 |

### 5. Rutas protegidas y fallback

- Rutas privadas: si no hay sesión → redirige a `/login`.
- Ruta `*`: si hay sesión → `/psychologist` (psicólogo) o `/home` (resto); si no → `/`.

**Nota:** no hay guard por rol en las rutas; un paciente podría entrar manualmente en `/psychologist` si tiene sesión.

---

## Qué está implementado y funciona

### Autenticación (`supabase.js` + `useAuth.jsx`)

| Función | Estado |
|---------|--------|
| Registro (`signUp`) | ✅ |
| Login (`signIn`) | ✅ |
| Logout (`signOut`) | ✅ |
| Recuperar contraseña (`resetPassword`) | ✅ |
| Perfil en tabla `profiles` | ✅ |
| Persistencia de sesión | ✅ |

### Perfil y onboarding

| Función | Estado |
|---------|--------|
| Crear/actualizar perfil (`upsertProfile`) | ✅ |
| Selección de rol | ✅ |
| Onboarding paciente (nombre, edad, hora notificación) | ✅ |
| Frecuencia de visitas al psicólogo (`visit_frequency`) | ✅ |
| Selector de idioma | ❌ No implementado |

### Diario inteligente (`DiaryPage` + `gemini.js`)

| Función | Estado |
|---------|--------|
| Chat con Evan en valenciano | ✅ |
| Preguntas sobre ánimo, sueño, actividad, alimentación, social | ✅ |
| Extracción de datos vía JSON al finalizar | ✅ |
| Guardar entrada en `diary_entries` | ✅ |
| Guardar conversación en `conversations` | ✅ |
| Alerta de riesgo si `risk_level >= 2` y paciente vinculado | ✅ |
| Manejo de errores (rate limit Gemini, API key) | ✅ |

### Kit d'emergència (`EmergencyPage`)

| Función | Estado |
|---------|--------|
| Pantalla principal con dos opciones grandes | ✅ |
| "Necessito regular-me" → subpantalla de técnicas | ✅ |
| Respiración guiada 4-4-6 (animación + contador, 5 ciclos) | ✅ |
| Grounding 5-4-3-2-1 (navegación paso a paso) | ✅ |
| "Necessito ajuda externa" → psicólogo vinculado + llamar al 112 | ✅ |
| Acceso desde home del paciente | ✅ |

### Dashboard paciente (`PatientDashboardPage`)

| Función | Estado |
|---------|--------|
| Gráfico línea: estado de ánimo (1–5) | ✅ |
| Gráfico barras: horas de sueño | ✅ |
| Períodos 7 / 30 / 90 días | ✅ |
| Promedios de ánimo y sueño | ✅ |
| Estado vacío sin entradas | ✅ |

### Configuración paciente (`SettingsPage`)

| Función | Estado |
|---------|--------|
| Editar nombre | ✅ |
| Editar hora de recordatorio | ✅ (solo guarda en perfil) |
| Vincular con psicólogo por código | ✅ |
| Cerrar sesión | ✅ |
| Notificaciones push reales | ❌ No implementadas |

### Panel psicólogo

| Función | Estado |
|---------|--------|
| Generar código de invitación (`createLinkage`) | ✅ |
| Copiar código al portapapeles | ✅ |
| Lista de pacientes vinculados | ✅ |
| Indicador de color por `risk_level` de alertas no vistas | ✅ |
| Badge "Alerta" si hay alertas no vistas | ✅ |
| Dashboard individual del paciente | ✅ |
| Exportar informe PDF | ✅ |
| Marcar alertas como vistas al entrar al dashboard (`markPatientAlertsSeen`) | ✅ |

---

## Qué NO está implementado (placeholders)

En `PatientHomePage` queda una tarjeta marcada como **"Pròximament"**:

1. **Parla amb Evan** — chat 24h (distinto del diario)

Tampoco hay:

- Notificaciones push a la hora configurada
- Internacionalización real (aunque `i18next` está instalado)
- Chat libre con Evan fuera del diario
- Protección estricta de rutas por rol
- Contactos de emergencia personales editables en configuración

---

## Tablas de Supabase que usa la app

| Tabla | Uso |
|-------|-----|
| `profiles` | Datos de usuario, rol, preferencias, `visit_frequency` |
| `diary_entries` | Entradas del diario (ánimo, sueño, resumen, etc.) |
| `conversations` | Historial completo de chats |
| `linkages` | Vinculación psicólogo ↔ paciente por código |
| `alerts` | Alertas de riesgo para el psicólogo (`status`: `unseen` / `seen`) |

### Migración necesaria

Ejecutar en el SQL Editor de Supabase (también en `supabase/migrations/001_add_visit_frequency.sql`):

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS visit_frequency text;
```

---

## Flujo de datos del diario (núcleo de la app)

```
Paciente abre /diary
  → DiaryPage llama a startDiaryConversation() (Gemini)
  → Evan envía el primer mensaje
  → Bucle: usuario escribe → sendMessage() → respuesta empática
  → Usuario pulsa "Finalitzar i guardar"
  → Gemini recibe "FINALITZAR_CONVERSA" y devuelve JSON
  → saveDiaryEntry() en Supabase
  → saveConversation() en Supabase
  → Si risk_level >= 2 y paciente vinculado → createAlert()
  → Pantalla "Entrada guardada!" → vuelve a /home
```

---

## Flujo de alertas (psicólogo)

```
Diario detecta risk_level >= 2
  → createAlert() en tabla alerts (status: 'unseen')
  → PsychologistHomePage muestra indicador de color y badge "! Alerta"
  → Psicólogo entra en /psychologist/patient/:id
  → markPatientAlertsSeen() marca todas las alertas de ese paciente como 'seen'
```

---

## Estructura de archivos relevante

```
├── vercel.json                      # Rewrites SPA para React Router
├── DEPLOYMENT.md                    # Guía de despliegue en Vercel
├── supabase/migrations/
│   └── 001_add_visit_frequency.sql
└── src/
    ├── App.jsx                      # Router principal
    ├── main.jsx                     # Punto de entrada + AuthProvider
    ├── hooks/
    │   └── useAuth.jsx              # Contexto de autenticación
    ├── services/
    │   ├── supabase.js              # Auth, perfiles, diario, vinculaciones, alertas
    │   └── gemini.js                # Conversación IA del diario
    ├── components/shared/
    │   └── BottomNav.jsx            # Navegación inferior del paciente
    └── pages/
        ├── WelcomePage.jsx
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── ForgotPasswordPage.jsx
        ├── RoleSelectPage.jsx
        ├── OnboardingPage.jsx
        ├── PatientHomePage.jsx
        ├── DiaryPage.jsx
        ├── EmergencyPage.jsx        # Kit d'emergència
        ├── PatientDashboardPage.jsx
        ├── SettingsPage.jsx
        ├── PsychologistHomePage.jsx
        └── PsychologistDashboardPage.jsx
```

---

## Variables de entorno necesarias

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

El archivo `.env` está en `.gitignore` y **no debe subirse a GitHub**.

---

## Despliegue en Vercel

### Archivos de configuración

| Archivo | Propósito |
|---------|-----------|
| `vercel.json` | Rewrites para que todas las rutas apunten a `index.html` (SPA) |
| `package.json` | Script `"build": "vite build"`, output en `dist/` |
| `.gitignore` | Excluye `.env`, `.env.*`, `node_modules`, `dist` |
| `DEPLOYMENT.md` | Guía paso a paso del despliegue |

### Variables en el panel de Vercel

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `VITE_GEMINI_API_KEY` | API key de Google Gemini |

### Pasos resumidos

1. Subir el repositorio a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importar el repo.
3. Vercel detecta Vite automáticamente (build: `npm run build`, output: `dist`).
4. Añadir las 3 variables de entorno.
5. Clic en **Deploy**.
6. En Supabase → Authentication → URL Configuration, añadir la URL de Vercel como Site URL y Redirect URL.

Ver detalles completos en [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## Paleta de colores

| Uso | Color |
|-----|-------|
| Azul principal | `#5B8DB8` |
| Verde secundario | `#7BAF9E` |
| Fondo | `#F5F5F5` |
| Texto | `#2C2C2C` |
| Tipografía | Poppins |

---

## Resumen

**Evan** es una aplicación web de salud mental con dos roles: el **paciente** registra su bienestar mediante un **diario conversacional con IA**, accede a un **kit de emergencia** con técnicas de regulación, ve su evolución en gráficos y puede vincularse con su psicólogo; el **psicólogo** genera códigos de invitación, monitoriza pacientes con indicadores de riesgo basados en alertas, recibe notificaciones de riesgo y exporta informes PDF. Pendiente para futuras versiones: chat 24h con Evan, notificaciones push e internacionalización.
