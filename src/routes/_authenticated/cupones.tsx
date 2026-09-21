import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus, Search, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { useHearts } from "@/components/hearts";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cupones")({
  head: () => ({
    meta: [
      { title: "Cupones de amor — Nuestro Espacio" },
      { name: "description", content: "Crea cupones para canjear: masajes, citas, caprichos y sorpresas." },
      { property: "og:title", content: "Cupones de amor — Nuestro Espacio" },
      { property: "og:description", content: "Cupones románticos para canjear cuando quieran." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CuponesPage,
});

type Coupon = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string;
  category: string;
  uses_total: number;
  expires_at: string | null;
  created_at: string;
};
type Redemption = { id: string; coupon_id: string; user_id: string; note: string | null; created_at: string };

const CATEGORIES = [
  { value: "detalle", label: "Detalle", emoji: "🎁" },
  { value: "mimos", label: "Mimos", emoji: "🤍" },
  { value: "comida", label: "Comida", emoji: "🍰" },
  { value: "cita", label: "Cita", emoji: "🌙" },
  { value: "capricho", label: "Capricho", emoji: "✨" },
  { value: "perdon", label: "Perdón", emoji: "🕊️" },
] as const;

const IDEAS = [
  { emoji: "💆", title: "Masaje de 20 minutos", category: "mimos" },
  { emoji: "🍳", title: "Desayuno en la cama", category: "comida" },
  { emoji: "🎬", title: "Eliges la película sin quejas", category: "cita" },
  { emoji: "🧹", title: "Me toca a mí toda la limpieza", category: "detalle" },
  { emoji: "🌙", title: "Una noche solo de abrazos", category: "mimos" },
  { emoji: "🍦", title: "Postre a la hora que quieras", category: "capricho" },
  { emoji: "📵", title: "Tarde sin celulares", category: "cita" },
  { emoji: "🚗", title: "Paseo sorpresa a donde diga yo", category: "cita" },
];

function isExpired(c: Coupon) {
  return !!c.expires_at && new Date(`${c.expires_at}T23:59:59`).getTime() < Date.now();
}

function CuponesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles } = useProfiles();
  const { burst, hearts } = useHearts();
  useRealtime("coupons", "coupon_redemptions");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const [category, setCategory] = useState<string>("detalle");
  const [uses, setUses] = useState("1");
  const [expires, setExpires] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"recibidos" | "enviados" | "usados">("recibidos");

  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, user_id, title, description, emoji, category, uses_total, expires_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ["coupon_redemptions"],
    queryFn: async (): Promise<Redemption[]> => {
      const { data, error } = await supabase
        .from("coupon_redemptions")
        .select("id, coupon_id, user_id, note, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const usedOf = (id: string) => redemptions.filter((r) => r.coupon_id === id).length;
  const nameOf = (id: string) =>
    id === user?.id ? "Tú" : (profiles?.find((p) => p.id === id)?.name ?? "Tu pareja");

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Inicia sesión");
      if (!title.trim()) throw new Error("Escribe qué regala el cupón");
      const total = Math.max(1, Math.min(99, Number(uses) || 1));
      const { error } = await supabase.from("coupons").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        emoji: emoji || "🎁",
        category,
        uses_total: total,
        expires_at: expires || null,
      });
      if (error) throw error;
      if (couple?.partnerId) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "cupon",
          title: "Tienes un cupón nuevo 🎟️",
          message: `${emoji} ${title.trim()}`,
          link: "/cupones",
        });
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setDescription("");
      setUses("1");
      setExpires("");
      burst(12);
      toast.success("Cupón creado");
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const redeem = useMutation({
    mutationFn: async (coupon: Coupon) => {
      if (!user) throw new Error("Inicia sesión");
      const { error } = await supabase
        .from("coupon_redemptions")
        .insert({ coupon_id: coupon.id, user_id: user.id });
      if (error) throw error;
      if (couple?.partnerId && coupon.user_id !== user.id) {
        await notifyPartner({
          toUserId: couple.partnerId,
          type: "cupon",
          title: "Canjeó tu cupón 🎟️",
          message: `${coupon.emoji} ${coupon.title}`,
          link: "/cupones",
        });
      }
    },
    onSuccess: () => {
      burst(16);
      toast.success("¡Cupón canjeado! Ahora toca cumplirlo 💗");
      qc.invalidateQueries({ queryKey: ["coupon_redemptions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cupón borrado");
      qc.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      const used = usedOf(c.id) >= c.uses_total;
      if (tab === "recibidos" && (c.user_id === user?.id || used || isExpired(c))) return false;
      if (tab === "enviados" && c.user_id !== user?.id) return false;
      if (tab === "usados" && !used) return false;
      if (!q) return true;
      return `${c.title} ${c.description ?? ""}`.toLowerCase().includes(q);
    });
  }, [coupons, redemptions, search, tab, user?.id]);

  const received = coupons.filter(
    (c) => c.user_id !== user?.id && usedOf(c.id) < c.uses_total && !isExpired(c),
  ).length;

  return (
    <div className="space-y-8">
      {hearts}

      <section className="surface warm-gradient p-5 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Regalos para canjear</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Cupones de amor</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Crea cupones para tu pareja: un masaje, un desayuno, una cita sorpresa. Ella o él los canjea cuando quiera.
        </p>
        <p className="mt-4 text-sm">
          Tienes <span className="font-semibold text-primary">{received}</span>{" "}
          {received === 1 ? "cupón por canjear" : "cupones por canjear"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 rounded-full">
              <Plus className="mr-2 size-4" /> Crear cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo cupón</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ideas rápidas</Label>
                <div className="flex flex-wrap gap-2">
                  {IDEAS.map((i) => (
                    <button
                      key={i.title}
                      onClick={() => {
                        setTitle(i.title);
                        setEmoji(i.emoji);
                        setCategory(i.category);
                      }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                    >
                      {i.emoji} {i.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-title">¿Qué regala el cupón?</Label>
                <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-desc">Detalles (opcional)</Label>
                <Textarea
                  id="c-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Condiciones, sorpresas, lo que quieras añadir..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setCategory(c.value);
                        setEmoji(c.emoji);
                      }}
                      className={cn(
                        "rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                        category === c.value && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="c-emoji">Emoji</Label>
                  <Input
                    id="c-emoji"
                    value={emoji}
                    maxLength={4}
                    onChange={(e) => setEmoji(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-uses">Veces que se puede usar</Label>
                  <Input
                    id="c-uses"
                    type="number"
                    min={1}
                    max={99}
                    value={uses}
                    onChange={(e) => setUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-exp">Válido hasta (opcional)</Label>
                  <Input
                    id="c-exp"
                    type="date"
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full rounded-full"
                disabled={create.isPending}
                onClick={() => create.mutate()}
              >
                Regalar cupón
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "recibidos", label: "Para mí" },
              { key: "enviados", label: "Los que regalé" },
              { key: "usados", label: "Ya canjeados" },
            ] as const
          ).map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cupón..."
          />
        </div>
        <p className="text-xs text-muted-foreground">{visible.length} en la lista</p>
      </section>

      {visible.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => {
            const used = usedOf(c.id);
            const left = c.uses_total - used;
            const expired = isExpired(c);
            const mine = c.user_id === user?.id;
            return (
              <li
                key={c.id}
                id={c.id}
                className={cn(
                  "surface relative overflow-hidden p-5 scroll-mt-24",
                  (left <= 0 || expired) && "opacity-60",
                )}
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-primary/70" />
                <div className="flex items-start gap-3 pl-2">
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{c.title}</p>
                    {c.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      De {nameOf(c.user_id)} ·{" "}
                      {left > 0 ? `${left} de ${c.uses_total} disponibles` : "sin usos"}
                    </p>
                    {c.expires_at && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {expired ? "Venció el " : "Válido hasta "}
                        {new Date(`${c.expires_at}T00:00:00`).toLocaleDateString("es", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 pl-2">
                  {!mine && left > 0 && !expired && (
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={redeem.isPending}
                      onClick={() => redeem.mutate(c)}
                    >
                      <Ticket className="mr-1 size-4" /> Canjear
                    </Button>
                  )}
                  {mine && (
                    <button
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      aria-label="Borrar cupón"
                      onClick={() => remove.mutate(c.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="surface p-8 text-center text-sm text-muted-foreground">
          {tab === "recibidos"
            ? "Aún no tienes cupones por canjear. ¡Pide uno o regala el primero!"
            : tab === "enviados"
              ? "Todavía no has regalado cupones."
              : "Aún no se ha canjeado ningún cupón."}
        </p>
      )}

      {redemptions.length > 0 && (
        <section className="surface p-6">
          <h2 className="font-display text-xl font-semibold">Historial de canjes</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {redemptions.slice(0, 12).map((r) => {
              const c = coupons.find((x) => x.id === r.coupon_id);
              return (
                <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="text-lg">{c?.emoji ?? "🎟️"}</span>
                  <span className="min-w-0 flex-1 truncate">{c?.title ?? "Cupón"}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {nameOf(r.user_id)} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
