import { useCallback, useState } from "react";

type Heart = { id: number; left: number; delay: number; scale: number };

/**
 * Lluvia de corazones que se puede lanzar desde cualquier parte de la app.
 * Uso: const { hearts, burst } = useHearts(); ... {hearts}
 */
export function useHearts() {
  const [items, setItems] = useState<Heart[]>([]);

  const burst = useCallback((count = 12) => {
    const base = Date.now();
    const next: Heart[] = Array.from({ length: count }, (_, i) => ({
      id: base + i,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 0.6,
      scale: 0.7 + Math.random() * 0.9,
    }));
    setItems((prev) => [...prev, ...next]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((h) => !next.some((n) => n.id === h.id)));
    }, 2600);
  }, []);

  return { burst, hearts: <HeartsLayer items={items} /> };
}

function HeartsLayer({ items }: { items: Heart[] }) {
  if (!items.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {items.map((h) => (
        <span
          key={h.id}
          className="heart-float absolute bottom-0 text-2xl"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            transform: `scale(${h.scale})`,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
