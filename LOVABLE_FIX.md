# Consejero — reparación final para Lovable

## Objetivo
Dejar `/consejero` funcionando con la IA de Lovable sin poner ninguna clave secreta en el frontend ni en GitHub, y recuperar las acciones del Consejero sobre la base de datos.

## Estado actual
- El frontend llama a `POST /api/chat`.
- `src/routes/api/chat.ts` autentica al usuario y construye el contexto de la pareja.
- `/api/chat` delega la llamada de IA a `supabase/functions/advisor-chat`.
- `supabase/functions/advisor-chat/index.ts` lee `LOVABLE_API_KEY` exclusivamente desde los secrets de Edge Functions.
- `supabase/config.toml` ya declara `[functions.advisor-chat] verify_jwt = false`; la función valida manualmente el bearer token con Supabase.
- No agregar `LOVABLE_API_KEY` a `.env`, código del cliente, `VITE_*`, ni al repositorio.

## Acción única que debe hacer Lovable cuando vuelva a haber créditos

1. Detectar que el error actual `Falta la clave de IA` ya no debe resolverse poniendo la clave en el frontend. La arquitectura correcta es Edge Function -> Lovable AI Gateway.
2. Desplegar/sincronizar `supabase/functions/advisor-chat/index.ts` al proyecto Supabase/Lovable Cloud asociado al proyecto.
3. Verificar que el secret `LOVABLE_API_KEY` esté disponible para esa Edge Function. No mostrar ni copiar el valor del secret.
4. Probar el endpoint autenticado desde el preview usando una sesión real.
5. Si el gateway responde correctamente, mantener `google/gemini-3.7-flash` como modelo inicial y no cambiar de proveedor sin necesidad.
6. Si aparece 402, no tocar el código para intentar evitarlo: significa que la cuenta de Lovable no tiene créditos de IA disponibles. Esperar al siguiente cupo.
7. Recuperar las herramientas del Consejero que existían en la implementación original, manteniendo la seguridad por usuario/pareja:
   - `crear_nota`
   - `crear_dedicatoria`
   - `agendar_evento`
   - `crear_capsula`
   - `crear_reto`
   - `agregar_cancion`
   - `agregar_frase`
   - `registrar_animo`
   - `avisar_pareja`
8. Las herramientas deben ejecutarse en el mismo Edge Function, usando el cliente Supabase autenticado con el bearer del usuario. Nunca usar una service role key en el navegador.
9. Cada herramienta debe devolver al modelo un resultado estructurado con `success`, `id` cuando corresponda y un mensaje breve. El modelo solo puede afirmar que algo se guardó, agendó o notificó cuando la herramienta haya devuelto `success: true`.
10. Mantener la interfaz existente de `src/routes/_authenticated/consejero.$id.tsx`, incluyendo la representación de tool parts. No rediseñar la pantalla ni eliminar el historial compartido.
11. Mantener el guardado de `advisor_messages` y los hilos compartidos.
12. Ejecutar build/typecheck antes de terminar y corregir cualquier error causado por la integración.

## Pruebas de aceptación

### A. Chat básico
Mensaje: `Hola Consejero, ¿cómo puedes ayudarnos?`

Esperado: respuesta en español, sin 500, sin pedir al usuario una API key.

### B. Contexto
Mensaje: `¿Qué sabes de nosotros?`

Esperado: usar únicamente perfiles, ánimos, eventos y cápsulas disponibles en el contexto; no inventar recuerdos.

### C. Acción con confirmación
Mensaje inicial: `Quiero guardar una nota para mi amor.`

Esperado: pedir título/contenido o la información que falte y confirmar antes de guardar.

Después de una confirmación explícita, ejecutar `crear_nota` y mostrar el resultado de la herramienta.

### D. Calendario
Pedir crear un evento con título, fecha y hora.

Esperado: pedir cualquier dato obligatorio que falte, confirmar y luego guardar en `events`.

### E. Aviso
Pedir avisar a la pareja.

Esperado: confirmar antes de enviar, insertar la notificación para `partnerId` y tratar el push como best-effort.

### F. Seguridad
- Una persona autenticada no debe poder crear registros con `user_id` de otra persona.
- No exponer `LOVABLE_API_KEY` en respuestas, logs del navegador ni código cliente.
- No afirmar acciones exitosas si Supabase devolvió error.

## Si algo falla
Usar el status para diagnosticar sin hacer cambios innecesarios:
- `401`: sesión/bearer inválido.
- `404`: la Edge Function no está desplegada en el proyecto Supabase conectado.
- `503`: `LOVABLE_API_KEY` no está disponible para la Edge Function.
- `402`: se agotaron los créditos de IA de Lovable.
- `429`: límite temporal del gateway.
- `502`: revisar respuesta/modelo del gateway.

## Archivos principales
- `src/routes/api/chat.ts`
- `src/routes/_authenticated/consejero.$id.tsx`
- `supabase/functions/advisor-chat/index.ts`
- `supabase/config.toml`
- `src/integrations/supabase/types.ts`

## Regla importante
No volver a implementar la IA directamente en `src/routes/api/chat.ts` dependiendo de `process.env.LOVABLE_API_KEY` del servidor TanStack. Ese fue el origen del error en el preview. La clave debe permanecer del lado de la Edge Function/Lovable Cloud.
