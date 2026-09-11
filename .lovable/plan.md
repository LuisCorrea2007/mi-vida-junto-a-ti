# Actualización integral de Nuestro Espacio

## Objetivo
Modernizar toda la experiencia sin quitar ni cambiar las funciones actuales. La actualización priorizará carga rápida, navegación móvil estable, animaciones ligeras y nuevas formas de conectar como pareja.

## 1. Rendimiento y limpieza
- Reducir las recargas innecesarias de datos en tiempo real: cada cambio actualizará solo la sección afectada.
- Eliminar dependencias y código que ya no se usan, especialmente restos del sistema anterior del Consejero.
- Dividir las pantallas más pesadas en piezas pequeñas y cargar bajo demanda el mapa y otras funciones costosas.
- Evitar consultas repetidas y actualizaciones completas de conversaciones cuando llega un solo mensaje.
- Mantener el guardado sin conexión y la actualización en vivo existentes.

## 2. Nuevo sistema visual premium y romántico
- Conservar el modo oscuro, pero reemplazar el aspecto chocolate dominante por una paleta nocturna neutral con rosa cálido, dorado suave y superficies translúcidas.
- Usar una tipografía moderna y refinada, mejor jerarquía, espacios más limpios y bordes suaves.
- Unificar tarjetas, formularios, botones, estados vacíos, cabeceras y mensajes en todas las secciones.
- Rediseñar el menú inferior para que sea compacto, estable y cómodo; “Más” abrirá un panel móvil organizado por categorías.
- Mejorar el Panel para mostrar la relación, el estado emocional y las acciones importantes con una lectura más clara.
- Añadir transiciones CSS cortas, estados de pulsación, entradas suaves y respeto por “reducir movimiento”, sin sumar una librería pesada.

## 3. Ubicación realmente en vivo
- Sustituir la actualización cada dos minutos por seguimiento nativo continuo con `watchPosition`.
- Actualizar el punto del mapa inmediatamente en el teléfono y sincronizarlo con la pareja de forma controlada para ahorrar batería y datos.
- Enviar una actualización solo cuando haya pasado un intervalo razonable o exista un desplazamiento significativo.
- Detener correctamente el seguimiento al cerrar la pantalla, retirar el permiso o vencer el tiempo compartido.
- Mantener distancia recta, ruta por carretera, tiempo estimado, Uber y Maps; mejorar el estado de precisión y cercanía.

## 4. Nuevo espacio “Conexión”
Una sola sección ordenada, sin llenar el menú de nuevas opciones, con cuatro apartados:

### Check-in de pareja
- Registrar emoción, energía, necesidad actual y una nota opcional.
- Elegir cómo puede acompañarte tu pareja: escuchar, dar espacio, abrazar, conversar o ayudar.
- Ver el estado más reciente de ambos y un resumen semanal sencillo.

### Acuerdos de pareja
- Crear acuerdos o metas compartidas, asignar fecha de revisión y marcar avances.
- Estados: propuesto, aceptado, en progreso y cumplido.
- Comentarios breves y recordatorios dentro de la app.

### Preguntas profundas
- Pregunta diaria por categorías: futuro, cariño, confianza, recuerdos y diversión.
- Cada respuesta queda oculta hasta que ambos respondan; luego se revelan juntas.
- Guardar preguntas favoritas y continuar la conversación desde el resultado.

### Planes para dos
- Crear propuestas según tiempo disponible, presupuesto, lugar y ánimo.
- Votar por separado y destacar coincidencias.
- Convertir una propuesta elegida en una cita del calendario sin copiar datos manualmente.

## 5. Integración y privacidad
- Añadir “Conexión” al buscador y a los menús, y mostrar un resumen útil en el Panel.
- Enviar avisos funcionales al crear un acuerdo, responder una pregunta, coincidir en un plan o publicar un check-in.
- Guardar todo por pareja con las mismas reglas privadas actuales: lectura solo para ambos y edición solo del contenido propio cuando corresponda.
- Crear las tablas, permisos, validaciones y actualización en vivo necesarias sin abrir ningún dato a otros usuarios.

## 6. Verificación
- Comprobar compilación y tipos después de la limpieza.
- Probar como usuario las rutas principales, el Consejero, el nuevo espacio Conexión y la ubicación en vivo.
- Revisar visualmente móvil y escritorio, con especial atención al menú inferior, textos, mapas y formularios.
- Confirmar que no haya errores de consola, enlaces rotos ni funciones anteriores dañadas.

## Detalles técnicos
- React/TanStack Start, Tailwind CSS v4 y componentes actuales.
- Animaciones con CSS y transformaciones aceleradas; sin instalar otra librería de animación.
- Geolocalización con `navigator.geolocation.watchPosition`, limpieza con `clearWatch` y escritura limitada por tiempo/distancia.
- Nuevos datos en Lovable Cloud mediante migración, permisos explícitos y políticas privadas por pareja.
- El Consejero conservará sus charlas separadas y guardadas, como ya está configurado.
