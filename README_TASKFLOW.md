# TaskFlow Pro 🍅

Aplicación de gestión de tareas con técnica Pomodoro integrada para máxima productividad.

## 🚀 Características Principales

- ✅ **Gestión de Tareas**: CRUD completo con categorías, prioridades y fechas límite
- ⏱️ **Pomodoro Timer**: Timer de alta precisión con tracking de interrupciones
- 📊 **Analytics**: Dashboard con métricas de productividad y patrones de trabajo
- 🔐 **Autenticación**: Login con email y OAuth (Google, GitHub)
- 🎨 **UI Moderna**: Diseño minimalista con Tailwind CSS
- 📱 **Responsive**: Optimizado para desktop, tablet y móvil

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **State Management**: React Query + Zustand
- **Validación**: Zod

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Sigue las instrucciones detalladas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para:
- Crear un proyecto en Supabase
- Ejecutar el schema de base de datos
- Configurar autenticación OAuth
- Obtener las credenciales

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security
ENCRYPTION_KEY=tu_clave_de_32_caracteres
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Páginas de autenticación
│   ├── (dashboard)/       # Páginas del dashboard
│   ├── api/               # API Routes
│   └── providers.tsx      # Providers de React Query
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── tasks/            # Componentes de tareas
│   ├── pomodoro/         # Componentes del timer
│   └── ui/               # Componentes UI reutilizables
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── types/                # Tipos TypeScript
└── middleware.ts         # Middleware de Next.js
```

## 🎯 Funcionalidades Implementadas

### Autenticación
- ✅ Registro e inicio de sesión con email
- ✅ OAuth con Google y GitHub
- ✅ Gestión de sesiones persistentes
- ✅ Protección de rutas

### Gestión de Tareas
- ✅ Crear, editar y eliminar tareas
- ✅ Categorías: Trabajo, Personal, Estudio, Salud
- ✅ Prioridades: Baja, Media, Alta, Urgente
- ✅ Fechas límite y tags
- ✅ Estimación de Pomodoros por tarea
- ✅ Filtros y búsqueda

### Pomodoro Timer
- ✅ Sesiones de 25 minutos (configurable)
- ✅ Descansos cortos (5 min) y largos (15 min)
- ✅ Timer de alta precisión con compensación de drift
- ✅ Tracking de interrupciones
- ✅ Notificaciones de browser
- ✅ Asociación con tareas

### Analytics y Dashboard
- ✅ Métricas diarias y semanales
- ✅ Tiempo de foco total
- ✅ Productivity score
- ✅ Patrones de productividad
- ✅ Horas pico de trabajo
- ✅ Insights automáticos

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Crear build de producción
npm run start        # Iniciar servidor de producción

# Linting
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 📊 Base de Datos

El schema de la base de datos incluye:

- **tasks**: Gestión de tareas con soporte para Pomodoros
- **pomodoro_sessions**: Historial de sesiones Pomodoro
- **productivity_metrics**: Métricas diarias de productividad

Ver [supabase-schema.sql](./supabase-schema.sql) para el schema completo.

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Validación de inputs con Zod
- Variables de entorno para secretos
- CSRF protection
- Autenticación con JWT

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Otras Plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js 14.

## 📝 Próximas Características (Post-MVP)

- [ ] PWA con funcionalidad offline
- [ ] Analytics avanzados con gráficos
- [ ] Configuración personalizada de Pomodoro
- [ ] Task templates y tareas recurrentes
- [ ] Integración con música de foco
- [ ] Reportes semanales
- [ ] Modo oscuro
- [ ] Exportar datos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Hecho con ❤️ y ☕ para mejorar la productividad

