export function reportLovableError(error: unknown, context?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    console.error("[lovable-error]", error, context ?? {});
  } catch {
    // ignore
  }
}
