# TaskFlow Pro

Aplicación de gestión de tareas con técnica Pomodoro integrada para máxima productividad.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (OAuth + Email)
- **Estado**: React Query + Zustand
- **Validación**: Zod
- **PWA**: Service Workers + IndexedDB

## Características Principales

- ✅ Gestión completa de tareas (CRUD)
- ⏱️ Timer Pomodoro de alta precisión
- 📊 Analytics y métricas de productividad
- 🔔 Notificaciones de browser
- 📱 PWA con soporte offline
- 🔄 Sincronización en tiempo real
- 🎨 UI moderna y responsive

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=tu_clave_de_32_caracteres
```

## Estructura del Proyecto

```
taskflow-pro/
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── (auth)/       # Rutas de autenticación
│   │   ├── (dashboard)/  # Rutas del dashboard
│   │   └── api/          # API Routes
│   ├── components/       # Componentes React
│   ├── lib/              # Utilidades y configuración
│   ├── hooks/            # Custom hooks
│   └── types/            # Definiciones de TypeScript
├── public/               # Assets estáticos
└── docs/                 # Documentación
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Servidor de producción
- `npm run lint` - Linter
- `npm run type-check` - Verificación de tipos

## Licencia

MIT
