import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Valores públicos del backend (clave publicable, segura en el cliente).
// Se incrustan en la compilación para que el sitio publicado nunca quede sin conexión.
const PUBLIC_BACKEND = {
  VITE_SUPABASE_URL: "https://c--4b6bb46f-cfa4-45b7-9101-4e77f086dbb3-prod.lovable.cloud",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_1u4x6yf7RDgctQ5rs2DyjA_JZj3rAnd",
  VITE_SUPABASE_PROJECT_ID: "jutbwoquwasjmwcdrivm",
} as const;

export default defineConfig({
  define: Object.fromEntries(
    Object.entries(PUBLIC_BACKEND).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(process.env[key] || value),
    ]),
  ),
});
