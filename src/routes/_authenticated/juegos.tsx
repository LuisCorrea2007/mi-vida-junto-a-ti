import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Circle, Crosshair, Flag, Gamepad2, Grid3x3, Hand, Loader2, RotateCcw,
  Swords, Trophy, Users, Bot, Sparkles, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCouple } from "@/hooks/use-couple";
import { useRealtime } from "@/hooks/use-realtime";
import { notifyPartner } from "@/lib/notify";
import { celebrate } from "@/lib/celebrate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/juegos")({
  component: JuegosPage,
  head: () => ({
    meta: [
      { title: "Nuestro Espacio — Juegos" },
      { name: "description", content: "Juegos en pareja y arcade: reta a tu amor o entrena contra el bot." },
      { property: "og:title", content: "Nuestro Espacio — Juegos" },
      { property: "og:description", content: "Juegos en pareja y arcade para los dos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/* ============================== Tipos ============================== */

type GameRow = {
  id: string;
  user_id: string;
  opponent_id: string;
  kind: string;
  board: Record<string, unknown>;
  turn: string;
  winner: string | null;
  created_at: string;
  updated_at: string;
};

type Difficulty = "facil" | "media" | "dificil";
const DIFF_LABEL: Record<Difficulty, string> = { facil: "Tranquilo", media: "Parejo", dificil: "Imparable" };

const COUPLE_GAMES = [
  { kind: "t3", name: "Tres en raya", desc: "El clásico de siempre, corazón contra corazón.", icon: Grid3x3 },
  { kind: "c4", name: "Conecta 4", desc: "Cuatro en línea y la gloria es tuya.", icon: Circle },
  { kind: "naval", name: "Batalla naval", desc: "Hunde la flota de tu amor (con besos después).", icon: Crosshair },
] as const;

const ARCADE_GAMES = [
  { kind: "hockey", name: "Air hockey", desc: "Arrastra tu mazo y mete el disco en su portería." },
  { kind: "fichas", name: "Fútbol de fichas", desc: "Toca tu ficha, estira hacia atrás y suelta para chutar." },
] as const;

/* ============================== Página ============================== */

function JuegosPage() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });
  const userId = session?.user.id;
  const couple = useCouple(userId);
  const partnerId = couple.data?.partnerId ?? null;

  const [tab, setTab] = useState<"pareja" | "arcade">("pareja");
  const [activeGame, setActiveGame] = useState<GameRow | null>(null);
  const [arcade, setArcade] = useState<null | { kind: string; difficulty: Difficulty }>(null);

  useRealtime("couple_games", "naval_fleets");

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["couple-games"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couple_games")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GameRow[];
    },
  });

  const qc = useQueryClient();
  const createGame = useMutation({
    mutationFn: async (kind: string) => {
      if (!userId || !partnerId) throw new Error("Necesitas vincular a tu pareja primero.");
      const board =
        kind === "t3" ? { cells: Array(9).fill(null) } :
        kind === "c4" ? { cells: Array(42).fill(0) } :
        { shots: {} };
      const { data, error } = await supabase
        .from("couple_games")
        .insert({ user_id: userId, opponent_id: partnerId, kind, board, turn: userId })
        .select()
        .single();
      if (error) throw error;
      await notifyPartner({
        toUserId: partnerId, type: "game",
        title: "Te retaron a un juego",
        message: `Tu amor te invita a jugar ${COUPLE_GAMES.find((g) => g.kind === kind)?.name ?? "un juego"}.`,
        link: "/juegos",
      });
      return data as unknown as GameRow;
    },
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["couple-games"] });
      setActiveGame(g);
      toast.success("Partida creada. ¡Que empiece el duelo!");
    },
    onError: (e) => toast.error(e.message),
  });

  const open = games.filter((g) => !g.winner);
  const finished = games.filter((g) => !!g.winner);
  const wins = finished.filter((g) => g.winner === userId).length;
  const losses = finished.filter((g) => g.winner && g.winner !== userId && g.winner !== "draw").length;

  if (arcade) {
    return (
      <ArcadeScreen
        kind={arcade.kind}
        difficulty={arcade.difficulty}
        onExit={() => setArcade(null)}
      />
    );
  }

  if (activeGame && userId) {
    return (
      <CoupleGameScreen
        key={activeGame.id + activeGame.updated_at}
        game={games.find((g) => g.id === activeGame.id) ?? activeGame}
        userId={userId}
        partnerId={partnerId}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-semibold">Juegos</h1>
        <p className="text-sm text-muted-foreground">
          Reta a tu amor en vivo o entrena contra el bot mientras se conecta.
        </p>
      </header>

      {/* Marcador de rivalidad */}
      <Card className="surface overflow-hidden">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary"><Trophy className="size-5" /></span>
            <div>
              <p className="text-sm font-semibold">Rivalidad de la casa</p>
              <p className="text-xs text-muted-foreground">{finished.length} partidas terminadas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div><p className="text-2xl font-bold text-primary">{wins}</p><p className="text-[11px] text-muted-foreground">Tú</p></div>
            <Swords className="size-4 text-muted-foreground" />
            <div><p className="text-2xl font-bold">{losses}</p><p className="text-[11px] text-muted-foreground">Tu amor</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <div className="flex gap-1 rounded-2xl border border-border/70 bg-card/50 p-1">
        {([["pareja", "En pareja", Users], ["arcade", "Contra el bot", Bot]] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all",
              tab === k && "bg-primary/15 text-primary shadow-[var(--shadow-glow)]")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "pareja" ? (
        <div className="space-y-6">
          {!partnerId && (
            <Card><CardContent className="p-4 text-sm text-muted-foreground">
              Vincula a tu pareja desde Ajustes para retarla en vivo.
            </CardContent></Card>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Empezar un duelo</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {COUPLE_GAMES.map((g) => (
                <Card key={g.kind} className="press surface">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><g.icon className="size-5" /></span>
                    <div className="flex-1">
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.desc}</p>
                    </div>
                    <Button size="sm" disabled={!partnerId || createGame.isPending} onClick={() => createGame.mutate(g.kind)}>
                      {createGame.isPending ? <Loader2 className="size-4 animate-spin" /> : "Retar"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Partidas en curso</h2>
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
            ) : open.length === 0 ? (
              <Card><CardContent className="p-4 text-sm text-muted-foreground">No hay duelos abiertos. Lansa el primero.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {open.map((g) => {
                  const meta = COUPLE_GAMES.find((c) => c.kind === g.kind);
                  const myTurn = g.turn === userId;
                  return (
                    <Card key={g.id} className="press surface cursor-pointer" onClick={() => setActiveGame(g)}>
                      <CardContent className="flex items-center gap-3 p-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                          {meta ? <meta.icon className="size-5" /> : <Gamepad2 className="size-5" />}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{meta?.name ?? g.kind}</p>
                          <p className={cn("text-xs", myTurn ? "text-primary" : "text-muted-foreground")}>
                            {myTurn ? "Tu turno" : "Turno de tu amor"}
                          </p>
                        </div>
                        <Button size="sm" variant={myTurn ? "default" : "outline"}>Jugar</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {finished.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Historial</h2>
              <div className="space-y-2">
                {finished.slice(0, 10).map((g) => {
                  const meta = COUPLE_GAMES.find((c) => c.kind === g.kind);
                  const result = g.winner === "draw" ? "Empate" : g.winner === userId ? "Ganaste" : "Ganó tu amor";
                  return (
                    <Card key={g.id} className="surface cursor-pointer" onClick={() => setActiveGame(g)}>
                      <CardContent className="flex items-center gap-3 p-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                          {meta ? <meta.icon className="size-4" /> : <Gamepad2 className="size-4" />}
                        </span>
                        <p className="flex-1 text-sm">{meta?.name ?? g.kind}</p>
                        <span className={cn("text-xs font-medium", g.winner === userId && "text-primary")}>{result}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ARCADE_GAMES.map((g) => (
            <ArcadeCard key={g.kind} game={g} onPlay={(d) => setArcade({ kind: g.kind, difficulty: d })} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArcadeCard({ game, onPlay }: { game: (typeof ARCADE_GAMES)[number]; onPlay: (d: Difficulty) => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("media");
  const best = typeof window !== "undefined" ? Number(localStorage.getItem(`arcade-best-${game.kind}`) ?? 0) : 0;
  return (
    <Card className="surface">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><Gamepad2 className="size-5" /></span>
        <div>
          <p className="font-semibold">{game.name}</p>
          <p className="text-xs text-muted-foreground">{game.desc}</p>
          {best > 0 && <p className="mt-1 text-[11px] text-primary">Tu mejor marca: {best}</p>}
        </div>
        <div className="flex gap-1 rounded-xl border border-border/60 p-1">
          {(Object.keys(DIFF_LABEL) as Difficulty[]).map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={cn("flex-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all",
                difficulty === d && "bg-primary/15 text-primary")}>
              {DIFF_LABEL[d]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onPlay(difficulty)}>Jugar</Button>
      </CardContent>
    </Card>
  );
}

/* ============================== Partida en pareja ============================== */

function CoupleGameScreen({ game, userId, partnerId, onExit }: {
  game: GameRow; userId: string; partnerId: string | null; onExit: () => void;
}) {
  const qc = useQueryClient();
  const myTurn = game.turn === userId && !game.winner;
  const meta = COUPLE_GAMES.find((c) => c.kind === game.kind);

  const save = useMutation({
    mutationFn: async (patch: { board: Record<string, unknown>; turn: string; winner?: string | null }) => {
      const { error } = await supabase.from("couple_games")
        .update({ board: patch.board as never, turn: patch.turn, winner: patch.winner ?? null })
        .eq("id", game.id);
      if (error) throw error;
      if (patch.winner && patch.winner !== "draw" && partnerId) {
        await notifyPartner({
          toUserId: partnerId, type: "game",
          title: patch.winner === userId ? "Perdiste… pero con amor" : "¡Ganaste la partida!",
          message: `Terminó su partida de ${meta?.name ?? "juego"}.`,
          link: "/juegos",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["couple-games"] }),
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (game.winner === userId) celebrate(40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.winner]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}><X className="mr-1 size-4" /> Salir</Button>
        <h1 className="font-display text-xl font-semibold">{meta?.name ?? "Juego"}</h1>
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium",
          game.winner ? "bg-muted text-muted-foreground" : myTurn ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground")}>
          {game.winner
            ? game.winner === "draw" ? "Empate" : game.winner === userId ? "¡Ganaste!" : "Ganó tu amor"
            : myTurn ? "Tu turno" : "Turno de tu amor"}
        </span>
      </div>

      {game.kind === "t3" && <TresEnRaya game={game} userId={userId} myTurn={myTurn} save={save.mutate} />}
      {game.kind === "c4" && <Conecta4 game={game} userId={userId} myTurn={myTurn} save={save.mutate} />}
      {game.kind === "naval" && <BatallaNaval game={game} userId={userId} myTurn={myTurn} />}
    </div>
  );
}

/* ---------- Tres en raya ---------- */

function t3Winner(cells: (string | null)[]): string | null {
  const lines: [number, number, number][] = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, b, c] of lines) if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a] ?? null;
  return cells.every(Boolean) ? "draw" : null;
}

function TresEnRaya({ game, userId, myTurn, save }: {
  game: GameRow; userId: string; myTurn: boolean;
  save: (p: { board: Record<string, unknown>; turn: string; winner?: string | null }) => void;
}) {
  const cells = (game.board["cells"] as (string | null)[]) ?? Array(9).fill(null);
  const myMark = game.user_id === userId ? "X" : "O";
  const play = (i: number) => {
    if (!myTurn || cells[i] || game.winner) return;
    const next = cells.slice();
    next[i] = myMark;
    const w = t3Winner(next);
    save({
      board: { cells: next },
      turn: game.opponent_id === userId ? game.user_id : game.opponent_id,
      winner: w ? (w === "draw" ? "draw" : userId) : null,
    });
  };
  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
      {cells.map((c, i) => (
        <button key={i} onClick={() => play(i)} disabled={!myTurn || !!c || !!game.winner}
          className={cn("press grid aspect-square place-items-center rounded-2xl border border-border/70 bg-card/60 text-4xl font-bold backdrop-blur transition-all",
            !c && myTurn && "hover:bg-primary/10 hover:border-primary/40")}>
          {c === "X" && <X className="size-10 text-primary" strokeWidth={2.5} />}
          {c === "O" && <Circle className="size-9 text-[#E9D6BE]" strokeWidth={2.5} />}
        </button>
      ))}
    </div>
  );
}

/* ---------- Conecta 4 ---------- */

function c4Winner(cells: number[]): number | null {
  const at = (r: number, c: number) => cells[r * 7 + c] ?? 0;
  const dirs: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const v = at(r, c);
    if (!v) continue;
    for (const [dr, dc] of dirs) {
      let ok = true;
      for (let k = 1; k < 4; k++) {
        const nr = r + dr * k, nc = c + dc * k;
        if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7 || at(nr, nc) !== v) { ok = false; break; }
      }
      if (ok) return v;
    }
  }
  return cells.every(Boolean) ? -1 : null;
}

function Conecta4({ game, userId, myTurn, save }: {
  game: GameRow; userId: string; myTurn: boolean;
  save: (p: { board: Record<string, unknown>; turn: string; winner?: string | null }) => void;
}) {
  const cells = (game.board["cells"] as number[]) ?? Array(42).fill(0);
  const myVal = game.user_id === userId ? 1 : 2;
  const play = (col: number) => {
    if (!myTurn || game.winner) return;
    let row = -1;
    for (let r = 5; r >= 0; r--) if (!cells[r * 7 + col]) { row = r; break; }
    if (row < 0) return;
    const next = cells.slice();
    next[row * 7 + col] = myVal;
    const w = c4Winner(next);
    save({
      board: { cells: next },
      turn: game.opponent_id === userId ? game.user_id : game.opponent_id,
      winner: w ? (w === -1 ? "draw" : userId) : null,
    });
  };
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border/70 bg-card/60 p-3 backdrop-blur">
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, col) => (
          <button key={col} onClick={() => play(col)} disabled={!myTurn || !!game.winner}
            className="group flex flex-col gap-1.5">
            {Array.from({ length: 6 }, (_, r) => {
              const v = cells[r * 7 + col];
              return (
                <span key={r} className={cn(
                  "aspect-square rounded-full border border-border/50 bg-background/60 transition-all",
                  v === 1 && "border-primary bg-primary shadow-[var(--shadow-glow)]",
                  v === 2 && "border-[#E9D6BE] bg-[#E9D6BE]",
                  !v && myTurn && "group-hover:border-primary/50",
                )} />
              );
            })}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Batalla naval ---------- */

const FLEET_SIZE = 10;

function BatallaNaval({ game, userId, myTurn }: { game: GameRow; userId: string; myTurn: boolean }) {
  const qc = useQueryClient();
  const [placing, setPlacing] = useState<number[]>([]);

  const { data: fleets = [] } = useQuery({
    queryKey: ["naval-fleets", game.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("naval_fleets").select("*").eq("game_id", game.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const myFleet = fleets.find((f) => f.user_id === userId);
  const shots = (game.board["shots"] as Record<string, number[]>) ?? {};
  const myShots = shots[userId] ?? [];
  const theirId = fleets.find((f) => f.user_id !== userId)?.user_id;
  const theirShots = theirId ? (shots[theirId] ?? []) : [];
  const theirFleet = fleets.find((f) => f.user_id !== userId);

  const place = useMutation({
    mutationFn: async (cells: number[]) => {
      const { error } = await supabase.rpc("naval_place", { _game: game.id, _cells: cells });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["naval-fleets", game.id] }); toast.success("Flota lista. ¡Al agua!"); },
    onError: (e) => toast.error(e.message),
  });

  const fire = useMutation({
    mutationFn: async (cell: number) => {
      const { data, error } = await supabase.rpc("naval_fire", { _game: game.id, _cell: cell });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (hit) => {
      qc.invalidateQueries({ queryKey: ["couple-games"] });
      toast(hit ? "¡Impacto!" : "Agua…", { icon: hit ? "💥" : "🌊" });
    },
    onError: (e) => toast.error(e.message),
  });

  if (!myFleet) {
    const toggle = (i: number) =>
      setPlacing((p) => (p.includes(i) ? p.filter((c) => c !== i) : p.length < FLEET_SIZE ? [...p, i] : p));
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Coloca tu flota: elige {FLEET_SIZE} casillas secretas ({placing.length}/{FLEET_SIZE}).
        </p>
        <div className="mx-auto grid w-full max-w-sm grid-cols-8 gap-1">
          {Array.from({ length: 64 }, (_, i) => (
            <button key={i} onClick={() => toggle(i)}
              className={cn("press aspect-square rounded-md border border-border/60 bg-card/60 transition-all",
                placing.includes(i) && "border-primary bg-primary/30 shadow-[var(--shadow-glow)]")} />
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPlacing([])}><RotateCcw className="mr-1 size-4" /> Limpiar</Button>
          <Button size="sm" disabled={placing.length !== FLEET_SIZE || place.isPending} onClick={() => place.mutate(placing)}>
            {place.isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirmar flota"}
          </Button>
        </div>
      </div>
    );
  }

  if (!theirFleet) {
    return (
      <Card><CardContent className="flex flex-col items-center gap-2 p-8 text-center">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Tu flota está lista. Esperando a que tu amor coloque la suya…</p>
      </CardContent></Card>
    );
  }

  const myCells = new Set(myFleet.cells as number[]);
  const myHits = myShots.filter((c) => (theirFleet.cells as number[]).includes(c)).length;

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-muted-foreground">
        Impactos: <span className="font-semibold text-primary">{myHits}/{FLEET_SIZE}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Su mar (dispara aquí)</p>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }, (_, i) => {
              const shot = myShots.includes(i);
              const hit = shot && (theirFleet.cells as number[]).includes(i);
              return (
                <button key={i} disabled={!myTurn || shot || !!game.winner} onClick={() => fire.mutate(i)}
                  className={cn("press aspect-square rounded-md border border-border/60 bg-card/60 transition-all",
                    !shot && myTurn && "hover:border-primary/50 hover:bg-primary/10",
                    shot && !hit && "bg-muted/50",
                    hit && "border-primary bg-primary/40")}>
                  {shot && <span className={cn("text-[10px]", hit ? "text-primary" : "text-muted-foreground")}>{hit ? "✸" : "·"}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tu mar</p>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }, (_, i) => {
              const mine = myCells.has(i);
              const hit = theirShots.includes(i);
              return (
                <span key={i} className={cn("grid aspect-square place-items-center rounded-md border text-[10px]",
                  mine ? "border-primary/50 bg-primary/20" : "border-border/60 bg-card/60",
                  hit && mine && "border-destructive bg-destructive/40",
                  hit && !mine && "bg-muted/40")}>
                  {hit ? (mine ? "✸" : "·") : ""}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Arcade (canvas, física) ============================== */

function ArcadeScreen({ kind, difficulty, onExit }: { kind: string; difficulty: Difficulty; onExit: () => void }) {
  const meta = ARCADE_GAMES.find((g) => g.kind === kind);
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}><X className="mr-1 size-4" /> Salir</Button>
        <h1 className="font-display text-xl font-semibold">{meta?.name}</h1>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
          Bot: {DIFF_LABEL[difficulty]}
        </span>
      </div>
      {kind === "hockey" ? <AirHockey difficulty={difficulty} /> : <FutbolFichas difficulty={difficulty} />}
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Hand className="size-3.5" />
        {kind === "hockey"
          ? "Arrastra tu mazo (el de abajo) y empuja el disco hacia la portería de arriba."
          : "Toca una ficha tuya, estira hacia atrás para apuntar y suelta para chutar. Mete la bola en su arco."}
      </p>
    </div>
  );
}

type Score = { me: number; bot: number };

function useScoreboard(kind: string) {
  const [score, setScore] = useState<Score>({ me: 0, bot: 0 });
  const finish = useCallback((s: Score) => {
    const key = `arcade-best-${kind}`;
    const prev = Number(localStorage.getItem(key) ?? 0);
    if (s.me > prev) localStorage.setItem(key, String(s.me));
    if (s.me > s.bot) celebrate(40);
  }, [kind]);
  return { score, setScore, finish };
}

function ScoreBar({ score, onReset }: { score: Score; onReset: () => void }) {
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="text-center"><p className="text-3xl font-bold text-primary">{score.me}</p><p className="text-[11px] text-muted-foreground">Tú</p></div>
      <button onClick={onReset} className="press grid size-9 place-items-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground">
        <RotateCcw className="size-4" />
      </button>
      <div className="text-center"><p className="text-3xl font-bold">{score.bot}</p><p className="text-[11px] text-muted-foreground">Bot</p></div>
    </div>
  );
}

/* ---------- Air hockey ---------- */

function AirHockey({ difficulty }: { difficulty: Difficulty }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { score, setScore, finish } = useScoreboard("hockey");
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const [over, setOver] = useState(false);
  const stateRef = useRef({ over: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = 360, H = 560;
    canvas.width = W * 2; canvas.height = H * 2;
    ctx.scale(2, 2);

    const puck = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 14 };
    const me = { x: W / 2, y: H - 70, px: W / 2, py: H - 70, r: 26 };
    const bot = { x: W / 2, y: 70, r: 26 };
    const GOAL = 70;
    const speedMap = { facil: 2.2, media: 3.4, dificil: 4.8 };
    const errMap = { facil: 60, media: 28, dificil: 8 };
    const botSpeed = speedMap[difficulty];
    const botErr = errMap[difficulty];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let running = true;

    const reset = (dir: 1 | -1) => {
      puck.x = W / 2; puck.y = H / 2;
      puck.vx = (Math.random() - 0.5) * 2; puck.vy = 2.5 * dir;
      me.x = W / 2; me.y = H - 70; bot.x = W / 2; bot.y = 70;
    };

    const collide = (p: { x: number; y: number; r: number }, isMe: boolean) => {
      const dx = puck.x - p.x, dy = puck.y - p.y;
      const d = Math.hypot(dx, dy), min = puck.r + p.r;
      if (d > 0 && d < min) {
        const nx = dx / d, ny = dy / d;
        puck.x = p.x + nx * min; puck.y = p.y + ny * min;
        const pvx = isMe ? (p.x - me.px) : 0, pvy = isMe ? (p.y - me.py) : 0;
        puck.vx = nx * 7 + pvx * 0.6; puck.vy = ny * 7 + pvy * 0.6;
      }
    };

    const step = () => {
      if (!running) return;
      if (!stateRef.current.over) {
        me.px = me.x; me.py = me.y;
        if (pointer) {
          me.x += (pointer.x - me.x) * 0.5;
          me.y += (Math.max(pointer.y, H / 2 + me.r) - me.y) * 0.5;
        }
        me.x = Math.max(me.r, Math.min(W - me.r, me.x));
        me.y = Math.max(H / 2 + me.r, Math.min(H - me.r, me.y));

        // Bot
        const targetX = puck.y < H / 2 ? puck.x + (Math.random() - 0.5) * botErr : W / 2;
        const targetY = puck.y < H / 2 && puck.vy < 0 ? Math.max(40, puck.y - 30) : 70;
        const dx = targetX - bot.x, dy = targetY - bot.y;
        const d = Math.hypot(dx, dy) || 1;
        const mv = Math.min(botSpeed, d);
        bot.x += (dx / d) * mv; bot.y += (dy / d) * mv;
        bot.x = Math.max(bot.r, Math.min(W - bot.r, bot.x));
        bot.y = Math.max(bot.r, Math.min(H / 2 - bot.r, bot.y));

        puck.x += puck.vx; puck.y += puck.vy;
        puck.vx *= 0.995; puck.vy *= 0.995;
        if (puck.x < puck.r) { puck.x = puck.r; puck.vx = Math.abs(puck.vx); }
        if (puck.x > W - puck.r) { puck.x = W - puck.r; puck.vx = -Math.abs(puck.vx); }
        const inGoal = Math.abs(puck.x - W / 2) < GOAL;
        if (puck.y < puck.r && !inGoal) { puck.y = puck.r; puck.vy = Math.abs(puck.vy); }
        if (puck.y > H - puck.r && !inGoal) { puck.y = H - puck.r; puck.vy = -Math.abs(puck.vy); }

        collide(me); collide(bot);

        if (puck.y < -puck.r) {
          const s = { ...scoreRef.current, me: scoreRef.current.me + 1 };
          setScore(s);
          if (s.me >= 5) { stateRef.current.over = true; setOver(true); finish(s); } else reset(-1);
        } else if (puck.y > H + puck.r) {
          const s = { ...scoreRef.current, bot: scoreRef.current.bot + 1 };
          setScore(s);
          if (s.bot >= 5) { stateRef.current.over = true; setOver(true); finish(s); } else reset(1);
        }
      }

      // Dibujo
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#32171F"); grad.addColorStop(1, "#160F12");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 20); ctx.fill();
      ctx.strokeStyle = "rgba(198,93,114,0.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(233,214,190,0.5)";
      ctx.fillRect(W / 2 - GOAL, 0, GOAL * 2, 4);
      ctx.fillRect(W / 2 - GOAL, H - 4, GOAL * 2, 4);

      ctx.fillStyle = "#C65D72";
      ctx.beginPath(); ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#E9D6BE";
      ctx.beginPath(); ctx.arc(me.x, me.y, me.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#160F12";
      ctx.beginPath(); ctx.arc(me.x, me.y, me.r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8A4256";
      ctx.beginPath(); ctx.arc(bot.x, bot.y, bot.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#160F12";
      ctx.beginPath(); ctx.arc(bot.x, bot.y, bot.r * 0.45, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    const down = (e: PointerEvent) => { pointer = toLocal(e); canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (pointer) pointer = toLocal(e); };
    const up = () => { pointer = null; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
    };
  }, [difficulty, finish, setScore]);

  return (
    <div className="space-y-3">
      <ScoreBar score={score} onReset={() => { setScore({ me: 0, bot: 0 }); stateRef.current.over = false; setOver(false); }} />
      <canvas ref={canvasRef} className="mx-auto block w-full max-w-sm touch-none rounded-3xl border border-border/70" style={{ aspectRatio: "360/560" }} />
      {over && (
        <p className="text-center text-sm font-medium">
          {score.me > score.bot ? "¡Ganaste el partido! Tu amor te debe un beso." : "Ganó el bot. La revancha es obligatoria."}
        </p>
      )}
    </div>
  );
}

/* ---------- Fútbol de fichas (resorte táctil, por turnos) ---------- */

type Disc = { x: number; y: number; vx: number; vy: number; r: number; team: 0 | 1 | 2 }; // 2 = bola

function FutbolFichas({ difficulty }: { difficulty: Difficulty }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { score, setScore, finish } = useScoreboard("fichas");
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const [turn, setTurn] = useState<"me" | "bot">("me");
  const turnRef = useRef(turn);
  turnRef.current = turn;
  const [over, setOver] = useState(false);
  const stateRef = useRef({ over: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = 380, H = 600;
    canvas.width = W * 2; canvas.height = H * 2;
    ctx.scale(2, 2);

    const GOAL = 60;
    const aimMap = { facil: 0.5, media: 0.25, dificil: 0.08 };
    const powerMap = { facil: 0.7, media: 0.9, dificil: 1.05 };
    const aimErr = aimMap[difficulty];
    const botPower = powerMap[difficulty];

    const setup = (): Disc[] => {
      const discs: Disc[] = [];
      for (let i = 0; i < 3; i++)
          discs.push({ x: W / 2 + (i - 1) * 90, y: H - 120, vx: 0, vy: 0, r: 18, team: 0 });
      for (let i = 0; i < 3; i++)
        discs.push({ x: W / 2 + (i - 1) * 90, y: 120, vx: 0, vy: 0, r: 18, team: 1 });
      discs.push({ x: W / 2, y: H / 2, vx: 0, vy: 0, r: 10, team: 2 });
      return discs;
    };

    let discs = setup();
    let drag: { disc: Disc; x: number; y: number } | null = null;
    let moving = false;
    let raf = 0;
    let running = true;

    const allStopped = () => discs.every((d) => Math.hypot(d.vx, d.vy) < 0.08);

    const resetPositions = () => { discs = setup(); };

    const botMove = () => {
      const ball = discs.find((d) => d.team === 2)!;
      const mine = discs.filter((d) => d.team === 1);
      // Ficha más cercana a la bola
      let best = mine[0], bd = Infinity;
      for (const d of mine) {
        const dist = Math.hypot(d.x - ball.x, d.y - ball.y);
        if (dist < bd) { bd = dist; best = d; }
      }
      // Apuntar: ficha -> bola -> portería rival (abajo)
      const toBallX = ball.x - best.x, toBallY = ball.y - best.y;
      const ballToGoalX = W / 2 - ball.x, ballToGoalY = H - ball.y;
      const bl = Math.hypot(ballToGoalX, ballToGoalY) || 1;
      let dirX = toBallX + (ballToGoalX / bl) * 40;
      let dirY = toBallY + (ballToGoalY / bl) * 40;
      const dl = Math.hypot(dirX, dirY) || 1;
      dirX /= dl; dirY /= dl;
      const err = (Math.random() - 0.5) * aimErr * Math.PI;
      const cos = Math.cos(err), sin = Math.sin(err);
      const fx = dirX * cos - dirY * sin, fy = dirX * sin + dirY * cos;
      const power = (5 + Math.random() * 3) * botPower;
      best.vx = fx * power; best.vy = fy * power;
      moving = true;
    };

    const step = () => {
      if (!running) return;
      if (!stateRef.current.over) {
        for (const d of discs) {
          d.x += d.vx; d.y += d.vy;
          d.vx *= 0.97; d.vy *= 0.97;
          if (Math.hypot(d.vx, d.vy) < 0.08) { d.vx = 0; d.vy = 0; }
          const isBall = d.team === 2;
          const inGoal = isBall && Math.abs(d.x - W / 2) < GOAL;
          if (d.x < d.r) { d.x = d.r; d.vx = Math.abs(d.vx) * 0.8; }
          if (d.x > W - d.r) { d.x = W - d.r; d.vx = -Math.abs(d.vx) * 0.8; }
          if (d.y < d.r && !inGoal) { d.y = d.r; d.vy = Math.abs(d.vy) * 0.8; }
          if (d.y > H - d.r && !inGoal) { d.y = H - d.r; d.vy = -Math.abs(d.vy) * 0.8; }
        }
        // Colisiones entre discos
        for (let i = 0; i < discs.length; i++) for (let j = i + 1; j < discs.length; j++) {
          const a = discs[i], b = discs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy), min = a.r + b.r;
          if (dist > 0 && dist < min) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = (min - dist) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const avn = a.vx * nx + a.vy * ny, bvn = b.vx * nx + b.vy * ny;
            const diff = bvn - avn;
            a.vx += diff * nx; a.vy += diff * ny;
            b.vx -= diff * nx; b.vy -= diff * ny;
          }
        }
        // Goles
        const ball = discs.find((d) => d.team === 2)!;
        if (ball.y < -ball.r) {
          const s = { ...scoreRef.current, bot: scoreRef.current.bot + 1 };
          setScore(s);
          if (s.bot >= 3) { stateRef.current.over = true; setOver(true); finish(s); } else resetPositions();
        } else if (ball.y > H + ball.r) {
          const s = { ...scoreRef.current, me: scoreRef.current.me + 1 };
          setScore(s);
          if (s.me >= 3) { stateRef.current.over = true; setOver(true); finish(s); } else resetPositions();
        }
        // Cambio de turno
        if (moving && allStopped()) {
          moving = false;
          setTurn((t) => {
            const next = t === "me" ? "bot" : "me";
            turnRef.current = next;
            if (next === "bot" && !stateRef.current.over) setTimeout(() => { if (running && !stateRef.current.over) { botMove(); } }, 700);
            return next;
          });
        }
      }

      // Dibujo
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1d2b1e"); grad.addColorStop(1, "#12200f");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 20); ctx.fill();
      ctx.strokeStyle = "rgba(233,214,190,0.25)"; ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.beginPath(); ctx.moveTo(14, H / 2); ctx.lineTo(W - 14, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(198,93,114,0.8)";
      ctx.fillRect(W / 2 - GOAL, 6, GOAL * 2, 8);
      ctx.fillRect(W / 2 - GOAL, H - 14, GOAL * 2, 8);

      for (const d of discs) {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.team === 0 ? "#E9D6BE" : d.team === 1 ? "#8A4256" : "#C65D72";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 2; ctx.stroke();
        if (d.team !== 2) {
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = "#160F12"; ctx.fill();
        }
      }

      // Línea de tiro (resorte)
      if (drag) {
        const dx = drag.disc.x - drag.x, dy = drag.disc.y - drag.y;
        const len = Math.hypot(dx, dy);
        const power = Math.min(len, 120);
        const nx = dx / (len || 1), ny = dy / (len || 1);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "#E9D6BE"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drag.disc.x, drag.disc.y);
        ctx.lineTo(drag.disc.x + nx * power * 1.6, drag.disc.y + ny * power * 1.6);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(drag.disc.x + nx * power * 1.6, drag.disc.y + ny * power * 1.6, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#E9D6BE"; ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    const down = (e: PointerEvent) => {
      if (turnRef.current !== "me" || moving || stateRef.current.over) return;
      const p = toLocal(e);
      for (const d of discs) {
        if (d.team === 0 && Math.hypot(d.x - p.x, d.y - p.y) < d.r + 8) {
          drag = { disc: d, x: p.x, y: p.y };
          canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    };
    const move = (e: PointerEvent) => { if (drag) { const p = toLocal(e); drag.x = p.x; drag.y = p.y; } };
    const up = () => {
      if (!drag) return;
      const dx = drag.disc.x - drag.x, dy = drag.disc.y - drag.y;
      const len = Math.hypot(dx, dy);
      if (len > 8) {
        const power = Math.min(len, 120) / 120;
        drag.disc.vx = (dx / len) * power * 11;
        drag.disc.vy = (dy / len) * power * 11;
        moving = true;
      }
      drag = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
    };
  }, [difficulty, finish, setScore]);

  return (
    <div className="space-y-3">
      <ScoreBar score={score} onReset={() => {
        setScore({ me: 0, bot: 0 });
        stateRef.current.over = false;
        setOver(false);
        setTurn("me"); turnRef.current = "me";
      }} />
      <p className="text-center text-xs font-medium">
        {over ? (score.me > score.bot ? "¡Campeones de la casa! Celebren con un abrazo." : "El bot ganó. Pide la revancha.") :
          turn === "me" ? <span className="text-primary">Tu turno: estira y suelta una ficha.</span> : "Turno del bot…"}
      </p>
      <canvas ref={canvasRef} className="mx-auto block w-full max-w-sm touch-none rounded-3xl border border-border/70" style={{ aspectRatio: "380/600" }} />
    </div>
  );
}
