# Nuevas funciones: Dedicatorias, Buscador y Libro de recuerdos

Tres mejoras grandes, manteniendo el diseño actual y todo en español.

## 1. Nueva sección "Dedicatorias" (para siempre)

Un lugar permanente donde cada uno guarda lo que le dedica al otro: cartas escritas, enlaces (canciones, páginas, videos de YouTube) y archivos (videos, fotos, PDF) descargables.

- Nueva página `/dedicatorias` con acceso en el menú superior y en el menú "Más" del celular.
- Tipos de dedicatoria:
  - **Carta**: título y texto bonito, como una carta física (se abre en pantalla completa con diseño de papel).
  - **Enlace**: guarda el link y muestra vista previa con el nombre de la página.
  - **Archivo**: subir video, imagen, audio o PDF al espacio de archivos existente; se puede ver dentro de la app y descargar.
- Cada dedicatoria muestra quién la dedicó, la fecha, y permite reaccionar con emoji y comentar.
- Se puede marcar como favorita y archivar.
- La otra persona recibe notificación (campana + celular) al recibir una dedicatoria, y el aviso lleva directo a ella.
- Se actualiza en tiempo real: si ella sube algo, te aparece sin refrescar.

## 2. Buscador global y favoritos

- Botón de búsqueda (lupa) en la barra superior, con atajo al escribir.
- Un cuadro de búsqueda que encuentra en un solo lugar: notas, fotos, videos, deseos, dedicatorias, eventos y diversión.
- Resultados agrupados por tipo con vista previa; al tocar un resultado va directo a esa pantalla.
- Vista "Favoritos": un filtro para ver todo lo marcado con estrella (notas, fotos, dedicatorias) junto.

## 3. Libro de recuerdos imprimible

- Nueva página `/libro` que genera un resumen bonito por año (o por rango de meses) con: fotos destacadas, hitos del diario, citas vividas, notas favoritas y estadísticas (días juntos, recuerdos creados).
- Diseño de página tipo libro, pensado para impresión o PDF: botón "Imprimir / guardar como PDF" que usa la impresión del navegador con estilos especiales limpios (fondo claro, sin menús).
- Portada con nombres, fecha de aniversario y foto favorita.

## Cómo se construye (detalle técnico)

- Nueva tabla `dedications` (tipo, título, contenido, link, archivo) + `dedication_comments` y `dedication_reactions`, con las mismas reglas de privacidad de pareja (`same_space` para leer, dueño para editar), permisos GRANT y Realtime activado.
- Archivos se guardan en el bucket `media` existente con URL firmada (igual que fotos/videos).
- Buscador: consultas en paralelo sobre las tablas existentes con filtro de texto, dentro de un diálogo (cmdk-style) en `app-shell`.
- Libro: página que reúne datos con las consultas existentes y hoja de estilos `@media print`; el PDF lo genera el navegador.
- Se notifica a la pareja con `notifyPartner` (ya existente) al crear/comentar dedicatorias.
- Verificación: typecheck, build de producción y prueba con sesión real (crear dedicatoria, buscarla, abrir libro, imprimir).

## Orden de trabajo

1. Tabla y reglas de Dedicatorias.
2. Página Dedicatorias completa (crear, ver, reaccionar, comentar, descargar).
3. Buscador global + favoritos.
4. Libro de recuerdos imprimible.
5. Pruebas y publicación.
