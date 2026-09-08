# Guía de Implementación - Nuestro Espacio

## Funcionalidades Implementadas ✅

### 1. Notas con Audios y PDFs
- **Ubicación**: `/src/routes/_authenticated/notas.$id.tsx`
- **Características**:
  - Grabar y adjuntar notas de voz (formato audio/*)
  - Subir documentos PDF
  - Reproductor de audio integrado
  - Vista previa de PDFs
  - Opción de descargar archivos
  - Eliminar adjuntos

### 2. Calendario con Cuenta Regresiva y Exportación
- **Ubicación**: `/src/routes/_authenticated/calendario.tsx`
- **Características**:
  - Cuenta regresiva en tiempo real para eventos futuros
  - Exportar a Google Calendar (abre enlace directo)
  - Descargar archivo .ics para calendario del dispositivo
  - Soporte para eventos recurrentes

### 3. Galería con Comentarios y Reacciones
- **Ubicación**: `/src/routes/_authenticated/galeria.tsx`
- **Características** (requiere completar):
  - Comentar fotos individuales
  - Reaccionar con emojis predefinidos
  - Descargar fotos
  - Sistema de notificaciones al comentar

---

## Migración a Producción Sin Costos

### Paso 1: Configurar Base de Datos (Supabase Gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis
2. Crea un nuevo proyecto
3. En el Dashboard, ve a **SQL Editor** y ejecuta:
   - Primero: `/supabase/migrations/*.sql` (archivos existentes)
   - Luego: `/supabase/migrations/20250101000000_add_advanced_features.sql`

4. Obten tus credenciales:
   - Ve a **Settings > API**
   - Copia `Project URL` y `anon public key`

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### Paso 3: Desplegar en Vercel (Recomendado)

**Opción A: Desde GitHub**
1. Sube tu código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/nuestro-espacio.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
3. Importa tu repositorio
4. Agrega las variables de entorno en Vercel Dashboard > Settings > Environment Variables
5. ¡Deploy automático!

**Opción B: Desde CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Paso 4: Alternativa - Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Conecta tu repo de GitHub
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `.output/public`
4. Agrega variables de entorno
5. Deploy

---

## Próximas Funcionalidades por Implementar

### 4. Sección de Diversión
Crear nueva ruta `/src/routes/_authenticated/diversion.tsx`:
- Chistes (cada usuario puede agregar)
- Adivinanzas
- Trivias de opción múltiple
- Preguntas para parejas
- Sistema de puntos/ranking

### 5. Notificaciones Push
- Integrar Firebase Cloud Messaging (gratis)
- Guardar tokens en tabla `push_tokens`
- Service Worker para notificaciones web
- Redireccionamiento desde notificación al contenido específico

### 6. Widget de Pantalla de Inicio (PWA)
Configurar en `public/manifest.json`:
```json
{
  "name": "Nuestro Espacio",
  "short_name": "NuestroEspacio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ec4899",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7. Distancia entre Usuarios
- Usar API de geolocalización del navegador
- Guardar coordenadas en `user_locations`
- Calcular distancia con fórmula Haversine
- Mostrar en mapa simple (Leaflet.js - gratis)

### 8. Chat Efímero (24 horas)
- Nueva ruta `/src/routes/_authenticated/chat.tsx`
- Mensajes se auto-eliminan después de 24h
- Soporte para texto, imágenes y ubicación
- Indicador de "en línea"

### 9. Videos Diarios
- Nueva ruta `/src/routes/_authenticated/videos.tsx`
- Subir videos cortos (< 50MB para plan gratis)
- Título con actividad del día
- Timestamp de subida
- Comentarios y descargas

### 10. Login Persistente (Remember Me)
- Usar localStorage para guardar sesión
- Token de refresh
- Al abrir app: mostrar selector de cuenta
- Validar contraseña antes de entrar

### 11. Quitar Modo Oscuro
- Eliminar componente `ThemeToggle`
- Forzar tema claro en `tailwind.config.js`
- Actualizar estilos en `src/styles.css`

---

## Estructura de Archivos Clave

```
/workspace
├── src/
│   ├── routes/
│   │   ├── _authenticated/
│   │   │   ├── notas.index.tsx      ✅ Notas lista
│   │   │   ├── notas.$id.tsx        ✅ Notas detalle + audios/PDFs
│   │   │   ├── calendario.tsx       ✅ Eventos + countdown + export
│   │   │   ├── galeria.tsx          🔄 Galería (falta comentarios)
│   │   │   ├── diversion.tsx        ⏳ Pendiente
│   │   │   ├── chat.tsx             ⏳ Pendiente
│   │   │   └── videos.tsx           ⏳ Pendiente
│   ├── components/
│   │   └── note-attachments.tsx     ✅ Componente adjuntos
│   └── lib/
│       ├── media.ts                 ✅ Utilidades multimedia
│       └── content.ts               ✅ Constantes
├── supabase/
│   └── migrations/
│       ├── *.sql                    ✅ Schema base
│       └── 20250101...sql           ✅ Nuevas tablas
├── public/
│   ├── manifest.json                ⏳ PWA config
│   └── icon-*.png                   ⏳ Iconos PWA
└── .env                             ⚠️ Configurar con Supabase
```

---

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview local de producción
npm run start

# Verificar types
npm run typecheck

# Lint
npm run lint
```

---

## Consideraciones de Plan Gratuito

### Supabase Free Tier:
- 500 MB base de datos
- 1 GB almacenamiento de archivos
- 50,000 requests/mes
- Suficiente para uso personal de pareja

### Vercel Free Tier:
- Hosting ilimitado
- 100 GB bandwidth/mes
- Functions: 100 GB-hours
- Perfecto para este proyecto

### Límites Recomendados:
- Fotos: máximo 5 MB cada una (ya implementado en compressImage)
- Videos: máximo 50 MB (usar compresión)
- Audios: máximo 10 MB
- Limpieza automática de chat cada 24h

---

## Soporte y Recursos

- Documentación TanStack Start: https://tanstack.com/start
- Documentación Supabase: https://supabase.com/docs
- Comunidad Vercel: https://vercel.community
- Tailwind CSS: https://tailwindcss.com/docs

---

**Estado Actual**: ✅ Build exitoso, listo para deploy
**Próximo Paso**: Configurar Supabase y desplegar en Vercel
