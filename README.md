# Our Secret Haven

PROMPT PARA DESARROLLO DE APLICACIÓN WEB COMPLETA Y AUTOCONTENIDA

**Contexto del Proyecto:**
Desarrolla una aplicación web completa para parejas llamada "Nuestro Espacio" que funcione de manera 100% self-hosted, sin dependencias de servicios externos, APIs de terceros o plataformas en la nube. Toda la infraestructura debe estar contenida en el propio código y servidor.

**Principios Fundamentales:**
- **Zero External Dependencies**: No usar servicios de terceros (Cloudinary, AWS, Google, etc.)
- **Self-Hosted**: Todo corre en el servidor propio
- **Offline-First**: Funcionalidad básica sin internet
- **Privacy-First**: Todos los datos permanecen en el servidor local
- **Portable**: Fácil de migrar entre servidores

**Repositorio GitHub:**
- Nombre del repo: `nuestro-espacio`
- Estructura: Monorepo con frontend y backend separados
- README.md completo con instrucciones de instalación y despliegue
- docker-compose.yml para despliegue completo
- Archivo .env.example con todas las variables necesarias
- Scripts de npm para desarrollo, producción y mantenimiento
- Backup/restore scripts para la base de datos

**Stack Tecnológico Requerido:**

**Backend:**
- Node.js con Express.js
- PostgreSQL como base de datos principal (o SQLite para simplicidad)
- Prisma ORM para gestión de base de datos
- JWT para autenticación
- Multer para subida de archivos
- **Almacenamiento local de archivos** en sistema de archivos del servidor
- Sharp para procesamiento y compresión de imágenes
- Bcrypt para encriptación de contraseñas
- Express-validator para validación de datos
- CORS configurado correctamente
- Rate limiting para seguridad
- Node-cron para tareas programadas (recordatorios, limpieza)
- Nodemailer configurado para SMTP local (opcional)
- Socket.io para notificaciones en tiempo real

**Frontend:**
- React 18+ con Vite
- TypeScript estricto
- Tailwind CSS para estilos
- Framer Motion para animaciones
- React Router para navegación
- React Query (TanStack Query) para manejo de estado del servidor
- Zustand para estado global del cliente
- React Hook Form + Zod para formularios
- Date-fns para manejo de fechas
- React Calendar para componente de calendario
- React Dropzone para subida de imágenes
- Axios para peticiones HTTP
- React Hot Toast para notificaciones
- Service Workers para funcionalidad offline básica

**Sistema de Almacenamiento de Archivos:**

**Estructura de Directorios:**
```
/uploads
  /photos
    /original    (imágenes originales)
    /compressed  (imágenes optimizadas)
    /thumbnails  (miniaturas)
  /videos
    /original
    /compressed
  /avatars
  /temp          (archivos temporales)
```

**Características del Sistema de Archivos:**
- Procesamiento automático de imágenes al subir (redimensionar, comprimir)
- Generación automática de thumbnails
- Nombres de archivo únicos con UUID
- Validación de tipos de archivo permitidos
- Límite de tamaño configurable
- Limpieza automática de archivos temporales
- Sistema de backup integrado
- Verificación de integridad de archivos

**Diseño y UX:**
- Diseño minimalista y elegante
- Paleta de colores: tonos crema, beige, terracota suave, y acentos dorados
- Tipografía: Playfair Display para títulos, Inter para cuerpo de texto
- Totalmente responsive (mobile-first)
- Modo oscuro/claro toggle
- Animaciones suaves y transiciones
- Micro-interacciones en todos los elementos interactivos
- Skeleton loaders para carga de contenido
- Empty states atractivos
- Diseño accesible (WCAG 2.1 AA)
- Iconos SVG inline (sin dependencias externas)

**Funcionalidades Principales:**

**1. Sistema de Autenticación:**
- Registro de dos usuarios únicos (pareja)
- Login con email y contraseña
- Recuperación de contraseña (generación de token local)
- Sesiones persistentes con refresh tokens
- Perfil de usuario editable (nombre, foto, fecha de aniversario)
- 2FA opcional con TOTP (Google Authenticator compatible)
- Bloqueo de cuenta después de intentos fallidos

**2. Dashboard Principal:**
- Contador en tiempo real de días/horas/minutos/segundos juntos desde la fecha de aniversario
- Próximos eventos del calendario
- Últimas notas y fotos
- Estadísticas de la relación (días juntos, notas intercambiadas, citas agendadas)
- Widget del tiempo basado en ubicación manual (sin API externa)
- Frases románticas aleatorias del sistema
- Resumen semanal/mensual de actividad

**3. Sistema de Notas con Respuestas:**
- Crear notas con título, contenido y categoría (amor, agradecimiento, recuerdo, etc.)
- Sistema de hilos de conversación en cada nota
- La pareja puede responder a las notas
- Reacciones a notas (corazón, estrella, sonrisa)
- Marcar notas como favoritas
- Buscar y filtrar notas por fecha, categoría, autor
- Notas programadas (aparecen en fecha específica)
- Notas con multimedia (imágenes adjuntas almacenadas localmente)
- Editor de texto enriquecido básico
- Notas archivadas
- Exportar notas a PDF

**4. Galería de Fotos y Videos:**
- Subida masiva de fotos y videos
- Procesamiento automático al subir (compresión, thumbnails)
- Organización en álbumes personalizados
- Sistema de etiquetas y búsqueda
- Vista de galería tipo masonry
- Lightbox con navegación por teclado
- Compartir fotos con notas adjuntas
- Fotos destacadas/favoritas
- Timeline cronológico de fotos
- Metadatos EXIF preservados
- Detección de duplicados
- Vista de mapa basada en coordenadas GPS de las fotos (sin API externa)
- Slideshow automático

**5. Calendario de Citas y Eventos:**
- Calendario mensual/semanal/diario interactivo
- Crear citas con: título, descripción, fecha, hora, lugar, recordatorio
- Categorías de citas (romántica, cena, película, viaje, etc.)
- Sistema de invitaciones (uno propone, otro acepta/rechaza)
- Recordatorios internos (notificaciones en la app)
- Citas recurrentes (semanales, mensuales, anuales)
- Historial de citas pasadas con fotos y notas
- Vista de agenda detallada
- Exportar calendario a formato iCal
- Sugerencias de citas basadas en historial
- Plantillas de citas predefinidas

**6. Lista de Deseos Compartida:**
- Crear lista de deseos (lugares por visitar, películas por ver, restaurantes, etc.)
- Sistema de votación para priorizar
- Marcar items como completados
- Categorías personalizables
- Notas y comentarios en cada item
- Enlaces externos opcionales
- Fotos adjuntas a cada deseo
- Presupuesto estimado
- Fecha límite opcional

**7. Diario de la Relación:**
- Timeline cronológico de la relación
- Hitos importantes (primer beso, primer viaje, etc.)
- Línea de tiempo visual interactiva
- Agregar fotos y notas a cada hito
- Estadísticas y logros desbloqueables
- Preguntas diarias/semanales para responder juntos
- Reflexiones mensuales
- Exportar diario a PDF

**8. Sistema de Notificaciones Internas:**
- Notificaciones en tiempo real con Socket.io
- Centro de notificaciones en la app
- Configuración de preferencias de notificaciones
- Notificaciones programadas
- Historial de notificaciones
- Marcar como leídas/no leídas
- Agrupación de notificaciones relacionadas

**9. Configuración de la Relación:**
- Fecha de inicio de la relación
- Aniversarios personalizados
- Metas de la relación (ahorro, viajes, proyectos)
- Preguntas para parejas (juego de preguntas semanales)
- Quiz de compatibilidad divertido
- Lista de valores compartidos
- Planes a futuro

**10. Panel de Administración:**
- Solo accesible para ambos usuarios
- Gestión de contenido (eliminar notas, fotos, etc.)
- Configuración de la cuenta
- Privacidad y seguridad
- **Sistema de backup completo**
- **Exportar todos los datos**
- **Importar datos desde backup**
- Estadísticas de uso de almacenamiento
- Logs de actividad
- Limpieza de archivos no utilizados

**11. Sistema de Backup y Restauración:**
- Backup automático programado (diario, semanal, mensual)
- Backup manual bajo demanda
- Backup completo (base de datos + archivos)
- Restauración desde backup
- Compresión de backups
- Retención de backups antiguos configurable
- Verificación de integridad de backups
- Notificación de backup exitoso/fallido

**Estructura de Base de Datos:**

```sql
Tablas principales:
- users (id, email, password_hash, name, avatar_url, anniversary_date, created_at, updated_at)
- sessions (id, user_id, token, expires_at, created_at)
- notes (id, user_id, title, content, category, is_favorite, is_archived, scheduled_date, created_at, updated_at)
- note_replies (id, note_id, user_id, content, created_at, updated_at)
- note_reactions (id, note_id, user_id, reaction_type, created_at)
- note_attachments (id, note_id, file_path, file_type, file_size, created_at)
- photos (id, user_id, album_id, original_path, compressed_path, thumbnail_path, caption, is_favorite, gps_lat, gps_lon, taken_at, created_at)
- albums (id, user_id, name, description, cover_photo_id, created_at, updated_at)
- photo_tags (id, photo_id, tag_name, created_at)
- events (id, user_id, title, description, date, time, location, category, reminder_minutes, is_recurring, recurrence_rule, created_at, updated_at)
- event_responses (id, event_id, user_id, response_status, created_at)
- wishes (id, user_id, title, description, category, priority, is_completed, budget, deadline, created_at, updated_at)
- wish_votes (id, wish_id, user_id, vote_value, created_at)
- wish_comments (id, wish_id, user_id, content, created_at)
- milestones (id, user_id, title, description, date, photo_id, created_at, updated_at)
- notifications (id, user_id, type, title, message, data, is_read, created_at)
- backups (id, file_path, file_size, type, status, created_at)
- activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
- settings (id, user_id, key, value, created_at, updated_at)
```

**API Endpoints Requeridos:**

```
Auth:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/enable-2fa
POST /api/auth/verify-2fa
POST /api/auth/disable-2fa

Users:
GET /api/users/me
PUT /api/users/me
POST /api/users/me/avatar
DELETE /api/users/me/avatar

Notes:
GET /api/notes
POST /api/notes
GET /api/notes/:id
PUT /api/notes/:id
DELETE /api/notes/:id
POST /api/notes/:id/replies
GET /api/notes/:id/replies
DELETE /api/notes/:id/replies/:replyId
POST /api/notes/:id/reactions
DELETE /api/notes/:id/reactions
POST /api/notes/:id/favorite
POST /api/notes/:id/archive
POST /api/notes/:id/attachments
GET /api/notes/:id/attachments
DELETE /api/notes/:id/attachments/:attachmentId
GET /api/notes/export/:format

Photos:
GET /api/photos
POST /api/photos/upload
POST /api/photos/upload-multiple
GET /api/photos/:id
PUT /api/photos/:id
DELETE /api/photos/:id
POST /api/photos/:id/favorite
GET /api/photos/:id/metadata
GET /api/photos/:id/original
GET /api/photos/:id/compressed
GET /api/photos/:id/thumbnail
GET /api/albums
POST /api/albums
GET /api/albums/:id
PUT /api/albums/:id
DELETE /api/albums/:id
POST /api/photos/tags
GET /api/photos/search

Events:
GET /api/events
POST /api/events
GET /api/events/:id
PUT /api/events/:id
DELETE /api/events/:id
POST /api/events/:id/respond
GET /api/events/upcoming
GET /api/events/past
GET /api/events/export/ical
GET /api/events/templates

Wishes:
GET /api/wishes
POST /api/wishes
GET /api/wishes/:id
PUT /api/wishes/:id
DELETE /api/wishes/:id
POST /api/wishes/:id/complete
POST /api/wishes/:id/vote
POST /api/wishes/:id/comments
GET /api/wishes/:id/comments

Milestones:
GET /api/milestones
POST /api/milestones
GET /api/milestones/:id
PUT /api/milestones/:id
DELETE /api/milestones/:id

Notifications:
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
DELETE /api/notifications/:id

Admin:
GET /api/admin/stats
GET /api/admin/storage
POST /api/admin/backup
GET /api/admin/backups
POST /api/admin/restore/:backupId
DELETE /api/admin/backups/:backupId
GET /api/admin/logs
POST /api/admin/cleanup
GET /api/admin/export
POST /api/admin/import

Settings:
GET /api/settings
PUT /api/settings
GET /api/settings/:key
PUT /api/settings/:key
```

**Requisitos de Seguridad:**
- Validación de todos los inputs
- Sanitización de datos
- Protección contra XSS, CSRF, SQL injection
- Rate limiting en endpoints sensibles
- HTTPS obligatorio en producción (configuración incluida)
- Variables de entorno para secrets
- Headers de seguridad (Helmet.js)
- Autenticación en todos los endpoints protegidos
- Autorización basada en roles (solo la pareja puede acceder)
- Encriptación de datos sensibles en la base de datos
- Verificación de integridad de archivos subidos
- Protección contra path traversal en archivos
- Límites de subida de archivos
- Logs de seguridad

**Requisitos de Despliegue:**
- Docker y docker-compose para despliegue completo
- Script de instalación automática
- Scripts de migración de base de datos
- Seed data para pruebas
- Configuración para Nginx como reverse proxy
- Scripts de backup automatizados
- Monitoreo básico de salud del sistema
- Logs centralizados
- Rotación de logs
- Guía de migración entre servidores

**Scripts de Mantenimiento:**
```bash
npm run backup          # Crear backup completo
npm run restore         # Restaurar desde backup
npm run cleanup         # Limpiar archivos temporales
npm run optimize        # Optimizar imágenes
npm run migrate         # Migrar base de datos
npm run seed            # Datos de prueba
npm run check-health    # Verificar salud del sistema
npm run export-data     # Exportar todos los datos
npm run import-data     # Importar datos
```

**Estructura del Proyecto:**
```
nuestro-espacio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── uploads/
│   ├── backups/
│   ├── logs/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   └── install.sh
├── docker-compose.yml
├── .env.example
└── README.md
```

**Entregables:**
1. Código fuente completo y funcional
2. README.md con instrucciones detalladas
3. Script de instalación automática
4. Documentación de la API (Swagger/OpenAPI)
5. Guía de backup y restauración
6. Guía de migración
7. Guía de contribución
8. Licencia MIT
9. Screenshots de la aplicación
10. Video demo (opcional)

**Prioridades:**
1. Funcionalidad core (auth, notas, fotos, calendario)
2. Sistema de backup y restauración
3. Diseño y UX pulido
4. Features secundarios (deseos, milestones, etc.)
5. Optimización y performance
6. Documentación completa

**Requisitos de Calidad:**
- Código limpio y bien documentado
- TypeScript estricto sin errores
- Tests unitarios para funciones críticas
- Tests de integración para APIs principales
- Linting y formateo automático
- Commits semánticos
- CI/CD con GitHub Actions
- Code review checklist

**Nota Final:**
La aplicación debe ser completamente autónoma, sin dependencias externas. Cada feature debe funcionar sin internet (excepto sincronización). El sistema debe ser fácil de mantener, backup y migrar. La privacidad es primordial: todos los datos permanecen bajo control total del usuario. El diseño debe transmitir calidez, intimidad y conexión. Prioriza la experiencia del usuario y la confiabilidad del sistema.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd1e8501-1234-4ee1-b398-629e23d8d574).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
