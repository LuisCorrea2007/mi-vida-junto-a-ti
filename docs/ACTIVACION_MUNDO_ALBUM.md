# Activación de Nuestro Mundo 2D y álbum

## Funcionalidades integradas
- Mundo privado: casa y jardín, decoración libre por casillas, personajes pixelados, peinados y atuendos, controles táctiles, gestos, pesca, objetivos y guardado sin conexión.
- Sincronización opcional: presencia cercana al tiempo real mediante una tabla PostgreSQL con RLS y almacenamiento compartido. Cambios concurrentes de decoración se combinan por casilla sin sobreescribir silenciosamente la versión local.
- Álbum: portada configurable, filtros, impresión a PDF, fotos privadas, notas completas y paginación de recuerdos por año.

## Migraciones pendientes para sincronizar entre dos cuentas
Ejecutar en **la misma instancia Supabase asociada a la app**, y en este orden (bajo revisión y con una copia de seguridad antes):
1. `supabase/migrations/20261009093000_couple_worlds.sql` — mundo guardado y RLS por pareja.
2. `supabase/migrations/20261009120000_couple_world_presence.sql` — personajes presentes, con control de acceso y timestamps.
3. `supabase/migrations/20261009170000_world_avatar_expressions.sql` — peinados y gestos efímeros.

No uses el cliente anónimo para ejecutar estas migraciones. Se necesita un operador o una integración autenticada de Supabase con permisos para administrar el esquema.

## Checklist de aceptación
1. Iniciar sesión en dos cuentas vinculadas en el mismo espacio.
2. Visitar `/mundo` en los dos dispositivos y confirmar que ambos personajes aparecen con una latencia razonable.
3. Caminar, entrar en la casa y elegir peinado y atuendo distintos.
4. Enviar un corazón y comprobar que la pareja ve el gesto brevemente.
5. Decorar casillas distintas sin guardar, y después combinar/guardar cambios desde ambas sesiones.
6. Activar modo avión, decorar, descargar respaldo y recuperar el guardado tras reconectar.
7. Pescar desde una casilla cercana al estanque y comprobar la persistencia del logro.
8. Abrir `/libro`, seleccionar años antiguos, filtrar fotos, leer una nota larga y guardar el libro completo desde impresión del navegador.
9. Revisar permisos RLS: una cuenta que no pertenezca a la pareja no puede leer ni escribir el mundo o las posiciones.

## Límites conocidos
- El mundo es un juego 2D de escala pequeña, no un RPG masivo.
- Las posiciones usan sincronización periódica con interpolación, no simulación física autoritativa.
- La decoración compartida se guarda a voluntad, no en cada clic.
- La portada del álbum y los logros de pesca son locales a cada dispositivo.
- La impresión usa el diálogo PDF del navegador.
- La calidad final en iOS/Android y el rendimiento real entre dos cuentas requieren pruebas con dispositivos.
