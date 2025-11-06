# 🚀 Inicio Rápido - Ver la App sin Supabase

## Para Ver la UI de la Aplicación

### 1. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con este contenido:

```bash
# Configuración temporal para desarrollo
NEXT_PUBLIC_SUPABASE_URL=https://ejemplo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZW1wbG8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0MjQwMCwiZXhwIjoxOTU4MTE4NDAwfQ.ejemplo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=12345678901234567890123456789012
```

### 2. Iniciar el servidor

```bash
npm run dev
```

### 3. Abrir en el navegador

Abre [http://localhost:3000](http://localhost:3000)

## 🎨 Lo que Verás

### Páginas de Autenticación
- **Login**: `/login` - Formulario de inicio de sesión con email y OAuth
- **Registro**: `/signup` - Formulario de registro

**Nota**: Los botones de login/registro no funcionarán sin Supabase configurado, pero puedes ver el diseño completo.

### Dashboard (requiere auth)
Una vez configurado Supabase, verás:
- **Dashboard**: `/` - Resumen de productividad
- **Tareas**: `/tasks` - Gestión completa de tareas
- **Pomodoro**: `/pomodoro` - Timer Pomodoro
- **Analytics**: `/analytics` - Métricas y gráficos
- **Configuración**: `/settings` - Preferencias

## 🎯 Explorando la UI

### Componentes Visibles sin Auth:

1. **Página de Login** (`/login`)
   - Formulario de email/password
   - Botones de OAuth (Google, GitHub)
   - Diseño minimalista y focus-friendly

2. **Página de Registro** (`/signup`)
   - Formulario completo de registro
   - Validación de contraseñas
   - Opciones de OAuth

### Lo que NO funcionará sin Supabase:

- ❌ Crear cuenta / Iniciar sesión
- ❌ Guardar tareas
- ❌ Iniciar sesiones Pomodoro
- ❌ Ver analytics reales

### Lo que SÍ puedes ver:

- ✅ Diseño completo de la UI
- ✅ Layout y navegación
- ✅ Componentes y estilos
- ✅ Responsive design
- ✅ Animaciones y transiciones

## 📱 Probar Responsive Design

Abre las DevTools (F12) y prueba diferentes tamaños:

- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

## 🔧 Siguiente Paso

Cuando estés listo para usar la aplicación completa:

1. Sigue la guía en `SUPABASE_SETUP.md`
2. Configura tu proyecto en Supabase (5-10 minutos)
3. Actualiza las credenciales en `.env.local`
4. Reinicia el servidor (`npm run dev`)

## 💡 Tips

- La aplicación usa Tailwind CSS para estilos
- Los colores están optimizados para productividad (verdes, grises neutros)
- El diseño es minimalista para reducir distracciones
- Todas las páginas son responsive

## 🎨 Características de Diseño

### Paleta de Colores
- **Primary**: Verde (#22c55e) - Productividad y foco
- **Pomodoro Work**: Rojo (#ef4444) - Sesiones de trabajo
- **Pomodoro Break**: Azul (#3b82f6) - Descansos
- **Categorías**: Colores diferenciados por tipo de tarea

### Tipografía
- **Font**: Inter (variable weight)
- **Tamaños**: Sistema escalable y legible

### Componentes
- Botones con estados hover y disabled
- Cards con sombras sutiles
- Modales con backdrop
- Formularios con validación visual

## ⚡ Desarrollo Rápido

Si quieres hacer cambios en la UI:

```bash
# Los cambios se reflejan automáticamente (Hot Reload)
# Edita archivos en src/app/ o src/components/
```

## 🐛 Problemas Comunes

### Error: "Invalid environment variables"
- Asegúrate de que `.env.local` existe
- Verifica que todas las variables estén definidas

### Puerto 3000 ocupado
```bash
# Usa otro puerto
npm run dev -- -p 3001
```

### Cambios no se reflejan
```bash
# Limpia cache y reinicia
rm -rf .next
npm run dev
```

## 📞 ¿Necesitas Ayuda?

1. Revisa que el servidor esté corriendo (`npm run dev`)
2. Verifica la consola del navegador (F12)
3. Asegúrate de estar en http://localhost:3000

---

**Disfruta explorando TaskFlow Pro! 🍅**

