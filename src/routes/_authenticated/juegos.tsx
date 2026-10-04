import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useProfiles } from "@/hooks/use-profiles";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/juegos")({
  head: () => ({
    meta: [
      { title: "Juegos en pareja — Nuestro Espacio" },
      { name: "description", content: "Tres en raya y Conecta 4 por turnos para jugar en pareja." },
    ],
  }),
  component: JuegosPage,
});

type Kind = "ttt" | "c4";
const GAMES: Record<Kind, { name: string; emoji: string; cols: number; rows: number; need: number; desc: string }> = {
  ttt: { name: "Tres en raya", emoji: "❌", cols: 3, rows: 3, need: 3, desc: "El clásico: tres en línea gana." },
  c4: { name: "Conecta 4", emoji: "🔴", cols: 7, rows: 6, need: 4, desc: "Deja caer fichas y junta cuatro." },
};

type Game = {
  id: string;
  user_id: string;
  opponent_id: string;
  kind: string;
  board: (string | null)[];
  turn: string;
  winner: string | null;
  updated_at: string;
};

function findWinner(board: (string | null)[], cols: number, rows: number, need: number): string | null {
  const at = (r: number, c: number) => (r >= 0 && r < rows && c >= 0 && c < cols ? board[r * cols + c] : null);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = at(r, c);
      if (!v) continue;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]] as const) {
        let k = 1;
        while (k < need && at(r + dr * k, c + dc * k) === v) k++;
        if (k === need) return v;
      }
    }
  return board.every(Boolean) ? "draw" : null;
}

function JuegosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: couple } = useCouple(user?.id);
  const { data: profiles = [] } = useProfiles();
  const [openId, setOpenId] = useState<string | null>(null);
  useRealtime("couple_games");
  const partnerId = couple?.partnerId ?? null;
  const nameOf = (id: string) => (id === user?.id ? "Tú" : profiles.find((p) => p.id === id)?.name ?? "Tu pareja");

  const { data: games = [] } = useQuery({
    queryKey: ["couple_games"],
    enabled: !!user,
    queryFn: async (): Promise<Game[]> => {
      const { data, error } = await supabase.from("couple_games").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Game[];
    },
  });

  async function start(kind: Kind) {
    if (!user || !partnerId) { toast.error("Primero une a tu pareja en Ajustes"); return; }
    const g = GAMES[kind];
    const { data, error } = await supabase
      .from("couple_games")
      .insert({ user_id: user.id, opponent_id: partnerId, kind, board: Array(g.cols * g.rows).fill(null), turn: partnerId })
      .select("id")
      .single();
    if (error) { toast.error("No se pudo crear la partida"); return; }
    setOpenId(data.id);
    qc.invalidateQueries({ queryKey: ["couple_games"] });
    notifyPartner({ toUserId: partnerId, type: "juego", title: `¡Te reto a ${g.name}!`, message: "Te toca empezar 🎲", link: "/juegos" }).catch(() => {});
  }

  async function play(game: Game, index: number) {
    if (!user || game.winner || game.turn !== user.id) return;
    const g = GAMES[game.kind as Kind];
    const board = [...game.board];
    let cell = index;
    if (game.kind === "c4") {
      const col = index % g.cols;
      cell = -1;
      for (let r = g.rows - 1; r >= 0; r--) if (!board[r * g.cols + col]) { cell = r * g.cols + col; break; }
      if (cell < 0) return;
    } else if (board[cell]) return;
    board[cell] = user.id;
    const winner = findWinner(board, g.cols, g.rows, g.need);
    const other = user.id === game.user_id ? game.opponent_id : game.user_id;
    const { error } = await supabase.from("couple_games").update({ board, winner, turn: other }).eq("id", game.id);
    if (error) { toast.error("No se pudo guardar la jugada"); return; }
    qc.invalidateQueries({ queryKey: ["couple_games"] });
    if (winner === user.id) toast.success("¡Ganaste! 🏆");
    notifyPartner({
      toUserId: other,
      type: "juego",
      title: winner ? (winner === "draw" ? "¡Empate!" : "Tu pareja ganó la partida") : "¡Te toca jugar!",
      message: g.name,
      link: "/juegos",
    }).catch(() => {});
  }

  async function remove(id: string) {
    await supabase.from("couple_games").delete().eq("id", id);
    if (openId === id) setOpenId(null);
    qc.invalidateQueries({ queryKey: ["couple_games"] });
  }

  const wins = (id?: string) => games.filter((g) => g.winner === id).length;
  const myTurn = games.filter((g) => !g.winner && g.turn === user?.id).length;
  const open = games.find((g) => g.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold"><Gamepad2 className="size-7 text-primary" /> Juegos</h1>
        <p className="text-sm text-muted-foreground">Partidas por turnos: juega cuando quieras y tu pareja recibe el aviso.</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Tus victorias", wins(user?.id)],
          ["De tu pareja", wins(partnerId ?? undefined)],
          ["Te toca", myTurn],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card/60 p-4 text-center">
            <p className="font-display text-2xl font-semibold text-primary">{v}</p>
            <p className="text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(GAMES) as Kind[]).map((k) => (
          <button key={k} onClick={() => start(k)} className="rounded-2xl border bg-card/60 p-5 text-left transition hover:border-primary/60 hover:bg-accent/40">
            <p className="text-3xl">{GAMES[k].emoji}</p>
            <p className="mt-2 font-display text-lg font-semibold">{GAMES[k].name}</p>
            <p className="text-sm text-muted-foreground">{GAMES[k].desc}</p>
            <p className="mt-3 text-xs font-medium text-primary">Nueva partida →</p>
          </button>
        ))}
      </div>

      {open && <Board game={open} userId={user?.id} nameOf={nameOf} onPlay={(i) => void play(open, i)} />}

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Partidas</h2>
        {games.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay partidas. ¡Reta a tu pareja!</p>}
        {games.map((g) => {
          const info = GAMES[g.kind as Kind];
          const status = g.winner
            ? g.winner === "draw" ? "Empate" : `Ganó: ${nameOf(g.winner)}`
            : g.turn === user?.id ? "¡Te toca!" : "Turno de tu pareja";
          return (
            <div key={g.id} className={cn("flex items-center gap-3 rounded-2xl border bg-card/60 p-3", g.id === openId && "border-primary/60")}>
              <span className="text-2xl">{info?.emoji}</span>
              <button className="min-w-0 flex-1 text-left" onClick={() => setOpenId(g.id)}>
                <p className="text-sm font-semibold">{info?.name}</p>
                <p className={cn("text-xs text-muted-foreground", !g.winner && g.turn === user?.id && "text-primary")}>
                  {g.winner && g.winner !== "draw" && <Trophy className="mr-1 inline size-3" />}{status}
                </p>
              </button>
              <Button size="sm" variant="secondary" onClick={() => setOpenId(g.id)}>Abrir</Button>
              {g.user_id === user?.id && (
                <Button size="icon" variant="ghost" aria-label="Borrar partida" onClick={() => remove(g.id)}><Trash2 className="size-4" /></Button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Board({ game, userId, nameOf, onPlay }: { game: Game; userId: string | undefined; nameOf: (id: string) => string; onPlay: (i: number) => void }) {
  const g = GAMES[game.kind as Kind];
  const mine = game.turn === userId && !game.winner;
  const mark = (v: string | null) => {
    if (!v) return "";
    const creator = v === game.user_id;
    if (game.kind === "ttt") return creator ? "✕" : "◯";
    return creator ? "🔴" : "🟡";
  };
  return (
    <section className="space-y-3 rounded-3xl border bg-card/70 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-display text-lg font-semibold">{g.name}</p>
        <p className={cn("text-muted-foreground", mine && "font-semibold text-primary")}>
          {game.winner ? (game.winner === "draw" ? "Empate 🤝" : `🏆 ${nameOf(game.winner)} ganó`) : mine ? "Tu turno" : "Esperando a tu pareja…"}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {mark(game.user_id)} {nameOf(game.user_id)} · {mark(game.opponent_id)} {nameOf(game.opponent_id)}
      </p>
      <div
        className="mx-auto grid max-w-md gap-1.5 rounded-2xl bg-secondary/50 p-2"
        style={{ gridTemplateColumns: `repeat(${g.cols}, minmax(0, 1fr))` }}
      >
        {game.board.map((v, i) => (
          <button
            key={i}
            disabled={!mine}
            onClick={() => onPlay(i)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl bg-background/80 font-display transition",
              game.kind === "ttt" ? "text-4xl text-primary" : "rounded-full text-2xl",
              mine && !v && "hover:bg-accent",
            )}
          >
            {mark(v)}
          </button>
        ))}
      </div>
    </section>
  );
}
