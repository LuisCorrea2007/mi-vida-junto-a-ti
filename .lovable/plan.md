# Consejero: un asistente de pareja con IA

Una sección nueva, "Consejero", donde pueden contarle lo que pasa (una pelea, un mal día, ganas de sorprender al otro) y recibe consejos pensados para ustedes, no frases genéricas. Nada de lo que ya existe cambia.

## Cómo se conversa

- Dos tipos de charla, como en un asistente moderno:
  - **Privadas**: solo las ve quien las escribió.
  - **Compartidas**: los dos escriben y leen en la misma charla, con el asistente respondiendo a ambos.
- Cada charla puede volverse compartida (y volver a privada) con un botón "Compartir con mi amor". Al compartirla, a la otra persona le llega un aviso al celular.
- Lista de charlas a la izquierda, con título automático según el tema, botón "Nueva conversación" y borrar.
- Cada charla tiene su propia dirección, así que al recargar o volver, sigue exactamente donde la dejaron.

## Guardado

- Por defecto la charla se guarda **solo en el celular donde se escribió**.
- Al compartirla, pasa a guardarse en la app para que los dos la vean desde cualquier dispositivo.
- En cualquier momento pueden borrar una charla.

## Qué sabe y qué puede hacer

El consejero conoce el contexto de ustedes (nombres, ciudad, fecha de aniversario, últimos ánimos, próximas citas, retos y cápsulas pendientes), así que sus consejos hablan de su relación real.

Puede hacer cosas por ustedes cuando se lo piden, siempre pidiendo confirmación antes:

- **Crear una nota o una dedicatoria** (por ejemplo "escríbele una carta de perdón bonita").
- **Agendar una cita o recordatorio** en el calendario.
- **Guardar una cápsula del tiempo** para abrirse en la fecha que digan.
- **Proponer y crear un reto** de pareja.
- **Agregar una canción o una frase** a la sección de canciones y frases.
- **Enviar una notificación al celular de la otra persona** con el mensaje que pidan ("dile que me siento triste").
- **Registrar tu ánimo** del momento.

Cada cosa que crea aparece en su sección normal de la app, con su aviso correspondiente.

## Detalles cariñosos

- Botón "Cuéntame cómo te sientes" y atajos: "peleamos hoy", "quiero sorprenderla", "necesito consejo", "ayúdame a pedir perdón".
- Consejo del día en el Panel, con enlace a la charla.
- Se ve escribiendo en vivo mientras piensa, con su nombre y corazón rosa.
- Enlace nuevo "Consejero" en el menú (arriba y en el menú de abajo).

## Detalles técnicos

- IA con Lovable AI (`openai/gpt-6-astra` por la Responses API, con streaming y razonamiento) mediante AI SDK: ruta servidor `src/routes/api/chat.ts` + `useChat` en el cliente; clave solo en el servidor.
- Herramientas del asistente definidas con AI SDK `tool` + zod: `crear_nota`, `crear_dedicatoria`, `agendar_evento`, `crear_capsula`, `crear_reto`, `agregar_cancion`, `agregar_frase`, `registrar_animo`, `avisar_pareja`. Las que escriben datos o mandan avisos usan `needsApproval`, `stopWhen: stepCountIs(50)`, y se ejecutan con la sesión del usuario (RLS por pareja) reutilizando `notifyPartner`.
- Contexto inyectado en el prompt del sistema desde `profiles`, `moods`, `events`, `challenges`, `time_capsules` (lectura vía `same_space`).
- Migración: `advisor_threads` (título, `is_shared`, `user_id`, `couple_id`) y `advisor_messages` (partes de `UIMessage` en jsonb) con GRANT, RLS (lectura propia o compartida por pareja, escritura `auth.uid() = user_id`), `updated_at` y Realtime para las charlas compartidas. Las privadas viven en el navegador (localStorage) y solo se suben al compartirse.
- Rutas nuevas: `src/routes/_authenticated/consejero.index.tsx` y `consejero.$id.tsx`; widget de consejo en `panel.tsx`; enlace en `app-shell.tsx`. Se reutilizan componentes UI y `use-realtime.ts`; se añaden `ai`, `@ai-sdk/react`, `@ai-sdk/openai` y markdown para las respuestas.
