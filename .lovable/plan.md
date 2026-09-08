# Próximas mejoras: tiempo real, recuerdos automáticos y velocidad

El diseño se queda como está. Tres frentes de trabajo:

## 1. Todo se actualiza solo, sin refrescar

Hoy solo el chat, los avisos y la ubicación se actualizan en vivo. Lo llevamos a toda la app:

- Activar actualizaciones en vivo (Realtime) en la base de datos para: notas, fotos, comentarios y reacciones de fotos, eventos del calendario, deseos, diversión, videos y respuestas de notas.
- Crear un hook reutilizable `useRealtimeTable(tabla, queryKey)` que se suscribe a cambios y refresca los datos de React Query automáticamente (con limpieza al salir de la página, para no gastar de más).
- Usarlo en: Notas (lista y detalle), Galería (fotos, comentarios, reacciones), Calendario, Deseos, Diversión, Videos y Panel (estadísticas y actividad).

Resultado: si ella sube una foto o comenta algo, te aparece al instante en tu pantalla, y viceversa.

## 2. Recuerdos automáticos

Sin tablas nuevas: se calcula con lo que ya tienen guardado.

- Sección "Un día como hoy" en el Panel: fotos, notas y videos subidos en la misma fecha de años/meses anteriores.
- Tarjeta "Resumen del mes": cuántas fotos, notas, citas y videos compartieron este mes, con una foto destacada al azar.
- Si no hay recuerdos ese día, se muestra una frase bonita invitando a crear uno nuevo.

## 3. Velocidad y uso sin internet

- Service worker de la app (además del de avisos): guarda en caché la interfaz para que abra casi al instante y se pueda navegar aunque se caiga el internet (los datos se ven de la última vez que cargó).
- Persistir el caché de React Query en el dispositivo: al volver a abrir la app, todo aparece de inmediato mientras se actualiza en segundo plano.
- Indicador discreto de "sin conexión" cuando no haya internet.

## Detalles técnicos

- Migración SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE` para notes, note_replies, note_reactions, note_attachments, photos, photo_comments, photo_reactions, events, wishes, wish_comments, wish_votes, fun_items, videos_diarios, video_comentarios. (Sin cambios de políticas: las RLS actuales ya filtran lo que cada quien recibe.)
- Nuevo hook `src/hooks/use-realtime.ts` (suscripción dentro de `useEffect` con cleanup).
- Nuevo componente `src/components/recuerdos.tsx` para el Panel.
- Nuevo `public/app-sw.js` con estrategia cache-first para assets y network-first para la navegación; registro en `src/routes/__root.tsx` solo en producción.
- Persistencia de React Query con `@tanstack/react-query-persist-client` + `idb-keyval` (una dependencia nueva cada una, muy livianas).
- Verificación: typecheck, build, y prueba con Playwright (dos sesiones: uno sube algo y se confirma que aparece solo en la otra pantalla).
