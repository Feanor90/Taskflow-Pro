# Configuración de Supabase para TaskFlow Pro

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta o inicia sesión
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: TaskFlow Pro
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Plan**: Free (para desarrollo)
4. Haz clic en "Create new project" y espera 1-2 minutos

## Paso 2: Ejecutar el Schema de Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en "New query"
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor SQL
5. Haz clic en "Run" (o presiona Ctrl/Cmd + Enter)
6. Verifica que veas el mensaje: "Schema de TaskFlow Pro creado exitosamente!"

## Paso 3: Configurar Autenticación

1. Ve a **Authentication** > **Providers** en el menú lateral
2. Habilita **Email** (ya debe estar habilitado por defecto)
3. Para habilitar **Google OAuth**:
   - Activa el toggle de Google
   - Sigue las instrucciones para crear credenciales en Google Cloud Console
   - Copia el Client ID y Client Secret
   - Guarda los cambios
4. Para habilitar **GitHub OAuth**:
   - Activa el toggle de GitHub
   - Sigue las instrucciones para crear una OAuth App en GitHub
   - Copia el Client ID y Client Secret
   - Guarda los cambios

## Paso 4: Configurar URL de Redirección

1. Ve a **Authentication** > **URL Configuration**
2. En "Site URL", añade: `http://localhost:3000` (para desarrollo)
3. En "Redirect URLs", añade:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`
4. Guarda los cambios

## Paso 5: Obtener las Credenciales

1. Ve a **Settings** > **API** en el menú lateral
2. Copia los siguientes valores:
   - **Project URL**: Este es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: Este es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Este es tu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ mantén esto secreto)

## Paso 6: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env.local`
2. Copia el contenido de `.env.local.example`
3. Reemplaza los valores con tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=genera_una_clave_de_32_caracteres
```

## Paso 7: Verificar la Configuración

1. Ejecuta el proyecto: `npm run dev`
2. Abre http://localhost:3000
3. Intenta registrarte con un email
4. Verifica que puedas iniciar sesión

## Paso 8: Verificar las Tablas

1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `tasks`
   - `pomodoro_sessions`
   - `productivity_metrics`
3. Haz clic en cada tabla para verificar que tienen las columnas correctas

## Paso 9: Habilitar Realtime (Opcional pero Recomendado)

1. Ve a **Database** > **Replication**
2. Verifica que las siguientes tablas tengan Realtime habilitado:
   - `tasks`
   - `pomodoro_sessions`
   - `productivity_metrics`
3. Si no están habilitadas, activa el toggle para cada una

## Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que no haya errores en el SQL Editor

### Error: "Invalid API key"
- Verifica que hayas copiado correctamente las credenciales
- Asegúrate de no tener espacios extra al inicio o final

### Error: "RLS policy violation"
- Verifica que las políticas RLS se hayan creado correctamente
- Ejecuta nuevamente la sección de RLS del script SQL

### No puedo iniciar sesión con OAuth
- Verifica que hayas configurado correctamente las URLs de redirección
- Asegúrate de que las credenciales de OAuth sean correctas
- Revisa la configuración en Google Cloud Console o GitHub

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

## Próximos Pasos

Una vez completada la configuración de Supabase:
1. ✅ Ejecuta `npm run dev` para iniciar el servidor de desarrollo
2. ✅ Comienza a desarrollar las funcionalidades de TaskFlow Pro
3. ✅ Prueba la autenticación y las operaciones CRUD

