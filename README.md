# Nuestro Espacio

Rincón privado para dos: notas, galería, calendario, deseos, diario, diversión y videos.

## Desarrollo

```bash
bun install
bun run dev
```

La app corre en `http://localhost:8080`.

## Estructura

- `src/routes/` — páginas (rutas de archivo de TanStack Start)
- `src/routes/_authenticated/` — páginas que requieren sesión
- `src/components/` — interfaz compartida (`ui/` es shadcn generado)
- `src/hooks/`, `src/lib/` — lógica reutilizable
- `src/integrations/` — clientes generados del backend (no editar)
