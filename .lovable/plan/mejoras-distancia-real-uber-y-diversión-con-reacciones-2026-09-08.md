# Mejoras: distancia real, Uber y Diversión con reacciones

Sin tocar el diseño actual ni las funciones existentes. Todo en español y en modo oscuro.

## 1. Distancia más real en "Ahora"

Hoy se muestra la distancia en línea recta. Se añadirá, además:

- **Distancia por carretera y tiempo estimado** en auto, calculada con un servicio público de rutas gratuito. Se mostrará como "12,4 km por carretera · 22 min en auto" bajo la cifra grande.
- **Precisión de la ubicación**: si el teléfono dio una ubicación poco exacta, se avisa ("aprox. ±150 m") para que no parezca un error.
- **Ruta dibujada en el mapa** entre los dos (línea suave), en lugar de solo la línea recta.
- Si el servicio de rutas no responde, se conserva la distancia en línea recta como ahora (nada se rompe).

## 2. Botón para ir donde está la otra persona

- **"Pedir Uber"**: abre Uber con el punto de recogida (tu ubicación) y el destino (la de ella) ya puestos; funciona en la app del celular y en la web.
- **"Abrir en Maps"**: indicaciones paso a paso en el mapa del teléfono.
- Los botones solo aparecen cuando ambos están compartiendo ubicación.

## 3. Diversión: comentar, reaccionar y puntuar

Cada chiste, adivinanza, trivia o pregunta tendrá:

- **Puntuación de 1 a 5 estrellas** por persona, con el promedio visible ("4,5 ★ · 2 votos").
- **Reacciones con emoji** (😂 ❤️ 😮 👏 🔥), como en fotos y dedicatorias.
- **Comentarios** con quién los escribió y cuándo, y borrar los propios.
- **Aviso a la otra persona** cuando comenta, reacciona o puntúa, con enlace directo a ese chiste.
- **Orden** por más recientes o mejor puntuados, y filtro de favoritos.
- Todo en vivo: aparece sin refrescar.

## 4. Detalles bonitos adicionales

- En "Ahora": frase romántica según la distancia (ya existe) más un pequeño contador de "tiempo juntos" y botón para enviar un "pensando en ti 💭" que llega como notificación.
- En Diversión: botón **"Sorpréndeme"** que abre uno al azar de los que la otra persona escribió.

## Detalles técnicos

- Rutas: OSRM público (`router.project-osrm.org`) consultado desde el cliente con manejo de fallo; sin claves ni secretos. Se dibuja la geometría con `Polyline` en `couple-map.tsx`.
- Uber: enlace universal `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=…&dropoff[latitude]=…`; Maps: `https://www.google.com/maps/dir/?api=1&origin=…&destination=…`.
- Precisión: se guarda `accuracy` de la geolocalización en una columna nueva `profiles.location_accuracy` (numérica, opcional).
- Nuevas tablas: `fun_reactions`, `fun_comments`, `fun_ratings` (1–5, única por persona e ítem) y columna `fun_items.is_favorite`; con permisos, RLS privada por pareja (`same_space(user_id)` para leer, `auth.uid() = user_id` para escribir/borrar), `updated_at` con trigger y Realtime.
- Reutilización de los componentes de comentarios/reacciones ya usados en Galería y Dedicatorias; sin dependencias nuevas.
