import { useMemo, useState } from 'react';
import { Flame, Hand, Heart, RefreshCw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICE_LEVELS } from '@/lib/love-dice';
import { celebrate } from '@/lib/celebrate';

type Kind = 'besos' | 'caricias' | 'abrazos';
const KINDS: { key: Kind; label: string; icon: typeof Heart; match: RegExp }[] = [
  { key: 'besos', label: 'Besos', icon: Heart, match: /bes/i },
  { key: 'caricias', label: 'Caricias', icon: Hand, match: /acarici|masaje|manos/i },
  { key: 'abrazos', label: 'Abrazos', icon: Flame, match: /abraz|detrás|espalda|sobre ti|encima|cintura/i },
];

export function RitualPicante() {
  const [kinds, setKinds] = useState<Kind[]>(['besos']);
  const [ready, setReady] = useState([false, false]);
  const [current, setCurrent] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const pool = useMemo(() => DICE_LEVELS['muy-atrevido'].actions.filter(a => KINDS.some(k => kinds.includes(k.key) && k.match.test(a))), [kinds]);
  const both = ready[0] && ready[1];

  const toggleKind = (k: Kind) => setKinds(prev => prev.includes(k) ? (prev.length > 1 ? prev.filter(x => x !== k) : prev) : [...prev, k]);
  const draw = () => {
    let options = pool.filter(a => !seen.includes(a));
    if (!options.length) { setSeen([]); options = pool; }
    const pick = options[Math.floor(Math.random() * options.length)];
    setCurrent(pick); setSeen(s => [...s, pick]);
  };

  return (
    <section className="surface warm-gradient space-y-5 p-5 sm:p-7">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Ritual de esta noche</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Muy picante, elegido por los dos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Escojan juntos qué les apetece. Cualquiera puede decir «pausa» cuando quiera.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {KINDS.map(({ key, label, icon: Icon }) => (
          <Button key={key} size="sm" variant={kinds.includes(key) ? 'default' : 'outline'} className="press rounded-full" onClick={() => toggleKind(key)}>
            <Icon className="mr-1.5 size-4" /> {label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['Yo acepto', 'Mi amor acepta'].map((label, i) => (
          <Button key={label} variant={ready[i] ? 'default' : 'outline'} className="press rounded-full" onClick={() => setReady(r => r.map((v, j) => j === i ? !v : v))}>
            {ready[i] ? '✓ ' : ''}{label}
          </Button>
        ))}
      </div>
      {current && both && (
        <div className="rounded-2xl border border-primary/30 bg-background/40 p-5 text-center">
          <p className="font-display text-lg leading-relaxed">{current}</p>
          <Button size="sm" variant="ghost" className="mt-3 rounded-full" onClick={() => celebrate(20)}>
            <Heart className="mr-1.5 size-4" /> Lo hicimos
          </Button>
        </div>
      )}
      <Button className="press w-full rounded-full" disabled={!both || !pool.length} onClick={draw}>
        {current ? <RefreshCw className="mr-2 size-4" /> : <Shuffle className="mr-2 size-4" />}
        {both ? (current ? 'Otro ritual' : 'Descubrir nuestro ritual') : 'Esperando que los dos acepten'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{pool.length} rituales disponibles con lo que eligieron</p>
    </section>
  );
}
