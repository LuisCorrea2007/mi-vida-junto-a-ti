# Última gran actualización romántica

Todo se añade encima de lo que ya existe. No se cambia el diseño oscuro actual, ni las secciones, ni los datos que ya tienen.

## 1. Cápsulas del tiempo (nuevo apartado)

- Escribir una carta, foto o audio que queda **sellado** hasta una fecha elegida.
- Antes de la fecha se ve el sobre cerrado con cuenta atrás; al llegar el día se abre y llega aviso a los dos.
- Ideal para aniversarios y "ábrelo cuando me extrañes".

## 2. Retos y misiones de pareja (nuevo apartado)

- Lista de retos románticos (mandar una foto del día, una cita sorpresa, decir tres cosas que amas...).
- Cada uno marca cuando lo cumple; se ven las rachas y un contador de retos logrados.
- Un reto nuevo sugerido cada día, más la opción de crear retos propios.

## 3. Estado de ánimo y "pensando en ti"

- Botón rápido para decir cómo te sientes (feliz, cansado, te extraño, con antojo...) con emoji; la otra persona lo ve en el Panel y en "Ahora".
- Botón **"Pensando en ti 💭"** que envía un toque al celular al instante.
- Pequeño historial del ánimo de la semana de los dos.

## 4. Panel más bonito y vivo

- Tarjeta con el ánimo actual de cada uno y el último "pensando en ti".
- Próxima cápsula del tiempo por abrirse y el reto de hoy.
- Contador de aniversario con celebración cuando faltan pocos días (confeti suave).

## 5. Nuestra playlist y frases favoritas

- Lista de canciones "nuestras" con enlace (Spotify/YouTube) y quién la agregó, con reacciones.
- Frases favoritas guardadas, con una destacada cada día en el Panel.

## 6. Detalles cariñosos por toda la app

- Al abrir la app, saludo distinto según la hora ("buenos días, mi amor").
- Corazones flotantes al reaccionar y al mandar "pensando en ti".
- En el Libro de recuerdos se suman las cápsulas abiertas, los retos cumplidos y la playlist.

## Detalles técnicos

- Nuevas tablas: `time_capsules` (título, contenido, archivo, fecha de apertura, abierta), `challenges` + `challenge_completions`, `moods` (emoji, texto, fecha), `songs` (título, artista, enlace, nota) y `quotes`. Todas con GRANT, RLS privada por pareja (lectura `same_space(user_id)`, escritura/borrado `auth.uid() = user_id`), `updated_at` con trigger y Realtime.
- Las cápsulas se ocultan por vista/consulta hasta `open_at`, con política de lectura propia para que el autor pueda editarlas antes.
- Reutiliza los componentes de reacciones/comentarios, `notify.ts` para avisos push y `use-realtime.ts` para la actualización en vivo.
- Rutas nuevas: `/capsulas`, `/retos`, `/nuestras-canciones`, más widgets en `panel.tsx` y en `cerca.tsx`. Sin dependencias nuevas ni cambios en las rutas existentes.
