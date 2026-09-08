# Publicar la app y verificar el SSL del dominio

## Lo que hay que saber
- Lovable emite automáticamente un certificado SSL válido (Let's Encrypt) para `espacionuestro.app`, `www.espacionuestro.app` y la URL `mi-vida-junto-a-ti.lovable.app`. No hay que comprar ni instalar nada.
- Si Fortinet bloquea la página, casi nunca es por el certificado en sí, sino porque el firewall de la red filtra por categoría de dominio o intercepta el tráfico con su propio certificado (eso lo hace la red, no la app).

## Pasos
1. Publicar la app con los cambios actuales (Dedicatorias, Libro de recuerdos, buscador global).
2. Verificar el estado del dominio `espacionuestro.app` y confirmar que el SSL está activo (debe aparecer como "Active").
3. Comprobar con una visita externa que `https://espacionuestro.app` responde con certificado válido.
4. Si el dominio personalizado tuviera algún problema de SSL, confirmar que la URL de Lovable (`mi-vida-junto-a-ti.lovable.app`) abre bien — es una alternativa inmediata mientras se resuelve.

## Nota técnica
- El chequeo del dominio usa la herramienta de estado de dominios de Lovable; la verificación del certificado se hace con una petición HTTPS real desde la terminal.
- No se toca código, configuración de DNS ni nada del backend en este plan.
