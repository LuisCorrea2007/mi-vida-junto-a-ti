import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Heart, HandHeart, Plus, Pencil, Trash2, ShieldCheck, Sun, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useRealtime } from '@/hooks/use-realtime';
import { useCouple } from '@/hooks/use-couple';
import { ritualPeriod } from '@/lib/ritual-period';
import { celebrate } from '@/lib/celebrate';
import { notifyPartner } from '@/lib/notify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdvisorShortcut } from '@/components/advisor-shortcut';

const CARE = [{ id: 'support', label: 'Lo que me ayuda', icon: HandHeart }, { id: 'boundaries', label: 'Mis límites', icon: ShieldCheck }, { id: 'joy', label: 'Lo que me alegra', icon: Sun }];
export function CoupleCare({ kind }: { kind: 'rituals' | 'care' }) {
  const rituals = kind === 'rituals';
  const { user } = useAuth();
  const { data: couple } = useCouple(user?.id);
  const qc = useQueryClient();
  useRealtime('couple_rituals', 'ritual_completions', 'care_cards');
  const [form, setForm] = useState({ title: '', detail: '', option: rituals ? 'daily' : 'support' });
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(timer); }, []);
  const { data: rows = [], isLoading, error } = useQuery({ queryKey: [rituals ? 'couple_rituals' : 'care_cards'], queryFn: async () => {
    if (rituals) { const { data, error } = await supabase.from('couple_rituals').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data ?? []).map(r => ({ ...r, option: r.cadence })); }
    const { data, error } = await supabase.from('care_cards').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data ?? []).map(r => ({ ...r, option: r.category }));
  } });
  const { data: completions = [] } = useQuery({ queryKey: ['ritual_completions'], enabled: rituals, queryFn: async () => { const { data, error } = await supabase.from('ritual_completions').select('*'); if (error) throw error; return data ?? []; } });
  const refresh = async () => { await Promise.all([qc.invalidateQueries({ queryKey: [rituals ? 'couple_rituals' : 'care_cards'] }), qc.invalidateQueries({ queryKey: ['ritual_completions'] })]); };
  const reset = () => { setForm({ title: '', detail: '', option: rituals ? 'daily' : 'support' }); setEditing(null); setOpen(false); };
  async function save() {
    if (!user || busy || !form.title.trim() || (!rituals && !form.detail.trim())) return;
    setBusy(true);
    try {
      const payload = { user_id: user.id, title: form.title.trim(), detail: form.detail.trim() };
      const result = rituals ? await (editing ? supabase.from('couple_rituals').update({ ...payload, cadence: form.option }).eq('id', editing).eq('user_id', user.id) : supabase.from('couple_rituals').insert({ ...payload, cadence: form.option })) : await (editing ? supabase.from('care_cards').update({ ...payload, category: form.option }).eq('id', editing).eq('user_id', user.id) : supabase.from('care_cards').insert({ ...payload, category: form.option }));
      if (result.error) throw result.error;
      await refresh();
      if (!editing) void notifyPartner(user.id, { type: 'care', title: rituals ? 'Un nuevo momento para los dos' : 'Quiero que me conozcas un poco más', message: form.title.trim(), link: rituals ? '/rituales' : '/cuidarnos' }).catch(() => toast.warning('Se guardó, pero no pudimos enviar el aviso.'));
      reset(); toast.success('Guardado en nuestro espacio');
    } catch { toast.error('No pudimos guardar. Tu texto sigue aquí.'); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!user || !window.confirm('¿Eliminar este detalle?')) return;
    const result = rituals ? await supabase.from('couple_rituals').delete().eq('id', id).eq('user_id', user.id) : await supabase.from('care_cards').delete().eq('id', id).eq('user_id', user.id);
    if (result.error) toast.error('No pudimos eliminarlo.'); else await refresh();
  }
  async function toggle(id: string, cadence: string) {
    if (!user || busy) return;
    const period = ritualPeriod(cadence, now);
    const done = completions.find(c => c.ritual_id === id && c.user_id === user.id && c.period === period);
    setBusy(true);
    const result = done ? await supabase.from('ritual_completions').delete().eq('id', done.id).eq('user_id', user.id) : await supabase.from('ritual_completions').insert({ ritual_id: id, user_id: user.id, period });
    setBusy(false);
    if (result.error) { toast.error('No pudimos actualizarlo.'); return; }
    if (!done) celebrate(12);
    await refresh();
  }
  const list = rows.filter(r => (filter === 'all' || (filter === 'mine' ? r.user_id === user?.id : r.option === filter)) && `${r.title} ${r.detail ?? ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const both = rows.filter(r => completions.some(c => c.ritual_id === r.id && c.user_id === user?.id && c.period === ritualPeriod(r.option, now)) && completions.some(c => c.ritual_id === r.id && c.user_id === couple?.partnerId && c.period === ritualPeriod(r.option, now))).length;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div><p className="text-sm text-primary">Elegirnos también en lo cotidiano</p><h1 className="mt-2 font-display text-3xl font-semibold">{rituals ? 'Nuestros rituales' : 'Cuidarnos mejor'}</h1><p className="mt-2 max-w-lg text-sm text-muted-foreground">{rituals ? 'Los pequeños momentos que queremos volver a vivir.' : 'Lo que necesito, lo que me hace bien y lo que quiero que sepas de mí.'}</p></div>
      <Button onClick={() => { reset(); setOpen(true); }}><Plus className="size-4" /> {rituals ? 'Nuevo ritual' : 'Compartir un cuidado'}</Button>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{rituals ? `${both} rituales vividos por ambos en su período actual` : `${rows.length} detalles para conocernos mejor`}</p><AdvisorShortcut subject={rituals ? 'nuestros rituales cotidianos' : 'cómo cuidarnos y respetar nuestros límites'} /></div>
    {open && <form className="grid gap-3 border-y border-border py-5" onSubmit={e => { e.preventDefault(); void save(); }}><div className="flex justify-between"><h2 className="font-display text-lg">{editing ? 'Editar nuestro detalle' : rituals ? 'Un momento que merece repetirse' : 'Esto también es parte de mí'}</h2><Button type="button" size="icon-sm" variant="ghost" aria-label="Cerrar formulario" onClick={reset}><X className="size-4" /></Button></div><Input aria-label="Título" maxLength={160} placeholder={rituals ? 'Nuestro café sin prisas' : 'Cuando tengo un día difícil…'} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /><Textarea aria-label="Detalle" maxLength={3000} placeholder={rituals ? 'Cómo queremos vivir este momento' : 'Me ayuda que me escuches antes de darme consejos…'} value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} required={!rituals} /><div className="flex flex-wrap gap-2">{(rituals ? [{ id: 'daily', label: 'Cada día' }, { id: 'weekly', label: 'Cada semana' }] : CARE).map(o => <Button key={o.id} type="button" size="sm" variant={form.option === o.id ? 'default' : 'outline'} onClick={() => setForm({ ...form, option: o.id })}>{o.label}</Button>)}</div><Button type="submit" disabled={busy}>{editing ? 'Guardar cambios' : 'Guardar para los dos'}</Button></form>}
    <div className="flex flex-wrap gap-2"><Input className="min-w-48 flex-1" aria-label="Buscar" placeholder="Buscar entre nuestros detalles" value={search} onChange={e => setSearch(e.target.value)} />{[{ id: 'all', label: 'De los dos' }, { id: 'mine', label: 'Los míos' }, ...(rituals ? [] : CARE)].map(o => <Button key={o.id} variant={filter === o.id ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter(o.id)}>{o.label}</Button>)}</div>
    {error ? <p role="alert" className="text-destructive">No pudimos cargar los detalles. <Button variant="ghost" onClick={() => void refresh()}>Reintentar</Button></p> : isLoading ? <p className="text-muted-foreground">Abriendo nuestro espacio…</p> : list.length === 0 ? <div className="py-12 text-center"><HandHeart className="mx-auto mb-4 size-10 text-primary" /><h2 className="font-display text-xl">{search ? 'No encontramos ese detalle' : 'Empecemos por algo nuestro'}</h2><p className="mt-2 text-sm text-muted-foreground">{search ? 'Prueba con otras palabras.' : rituals ? 'Ese abrazo al despedirnos también puede ser un ritual.' : 'No tienen que adivinarlo todo: aquí puedes decir qué te hace bien.'}</p></div> : <div className="grid gap-4 sm:grid-cols-2">{list.map(r => {
      const period = ritualPeriod(r.option, now); const mine = completions.some(c => c.ritual_id === r.id && c.user_id === user?.id && c.period === period); const partner = completions.some(c => c.ritual_id === r.id && c.user_id === couple?.partnerId && c.period === period); const Icon = rituals ? Heart : CARE.find(o => o.id === r.option)?.icon ?? HandHeart;
      return <article key={r.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40"><div className="flex items-start gap-3"><Icon className="mt-1 size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{r.user_id === user?.id ? 'De mí para nosotros' : 'De tu amor para nosotros'} · {rituals ? r.option === 'daily' ? 'Cada día' : 'Cada semana' : CARE.find(o => o.id === r.option)?.label}</p><h2 className="mt-1 break-words font-display text-xl">{r.title}</h2></div></div><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{r.detail}</p>{rituals && <><div className="flex gap-4 text-xs"><span className={mine ? 'text-primary' : 'text-muted-foreground'}>Tú: {mine ? 'vivido' : 'pendiente'}</span><span className={partner ? 'text-primary' : 'text-muted-foreground'}>Tu amor: {partner ? 'vivido' : 'pendiente'}</span></div><Button disabled={busy} variant={mine ? 'secondary' : 'default'} onClick={() => void toggle(r.id, r.option)}><Check className="size-4" /> {mine ? 'Deshacer mi marca' : 'Lo viví hoy'}</Button></>}<div className="mt-auto flex justify-end gap-1">{r.user_id === user?.id && <><Button size="icon-sm" variant="ghost" aria-label={`Editar ${r.title}`} onClick={() => { setEditing(r.id); setForm({ title: r.title, detail: r.detail ?? '', option: r.option }); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil className="size-4" /></Button><Button size="icon-sm" variant="ghost" aria-label={`Eliminar ${r.title}`} onClick={() => void remove(r.id)}><Trash2 className="size-4" /></Button></>}</div></article>;
    })}</div>}
  </div>;
}