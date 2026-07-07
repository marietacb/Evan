# Despliegue en Vercel — Evan

## Requisitos previos

- Repositorio en GitHub con el código del proyecto
- Cuenta en [Vercel](https://vercel.com)
- Proyecto Supabase configurado
- API key de Google Gemini

## Variables de entorno en Vercel

Configura estas variables en **Project Settings → Environment Variables**:

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `VITE_GEMINI_API_KEY` | API key de Google Gemini |

Aplícalas a los entornos **Production**, **Preview** y **Development**.

> **Importante:** Nunca subas el archivo `.env` a GitHub. Está incluido en `.gitignore`.

## Migración de base de datos

Antes del despliegue, ejecuta en el SQL Editor de Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS visit_frequency text;
```

El archivo está en `supabase/migrations/001_add_visit_frequency.sql`.

## Configuración del proyecto

- **`vercel.json`**: rewrites para que React Router funcione en rutas directas (`/login`, `/diary`, etc.)
- **`package.json`**: script `"build": "vite build"` (correcto para Vite)
- **`.gitignore`**: incluye `.env` y `.env.*`

## Pasos para el primer despliegue

### 1. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Preparar despliegue en Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión
2. Clic en **Add New… → Project**
3. Importa el repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite

### 3. Configurar el proyecto

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (por defecto)
- **Output Directory:** `dist` (por defecto en Vite)
- **Install Command:** `npm install`

### 4. Añadir variables de entorno

En la pantalla de configuración (o después en Settings → Environment Variables), añade:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

### 5. Desplegar

Clic en **Deploy**. Vercel compilará el proyecto y te dará una URL (ej. `evan-app.vercel.app`).

### 6. Despliegues automáticos

Cada `git push` a `main` generará un nuevo despliegue en producción. Los pull requests crearán despliegues de preview.

## Verificación post-despliegue

1. Abre la URL de Vercel
2. Prueba rutas directas: `/login`, `/register`, `/home`
3. Verifica login y registro con Supabase
4. Prueba el diario (requiere Gemini API key válida)

## Supabase — URLs de redirección

En Supabase → Authentication → URL Configuration, añade la URL de Vercel:

- **Site URL:** `https://tu-proyecto.vercel.app`
- **Redirect URLs:** `https://tu-proyecto.vercel.app/**`
