import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCw, Shuffle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notifyPartner } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const N = 10;
const SHIPS = [5, 4, 3, 3, 2];
const SHIP_NAMES = ["Portaaviones", "Acorazado", "Crucero", "Submarino", "Lancha"];

export type NavalGame = {
  id: string;
  user_id: string;
  opponent_id: string;
  board: unknown;
  turn: string;
  winner: string | null;
};

type Shots = Record<string, boolean>;

export function shipCells(start: number, size: number, vertical: boolean): number[] | null {
  const r = Math.floor(start / N);
  const c = start % N;
  if (vertical ? r + size > N : c + size > N) return null;
  return Array.from({ length: size }, (_, k) => (vertical ? start + k * N : start + k));
}

export function randomFleet(): number[][] {
  for (;;) {
    const taken = new Set<number>();
    const fleet: number[][] = [];
    for (const size of SHIPS) {
      for (let t = 0; t < 200; t++) {
        const cells = shipCells(Math.floor(Math.random() * N * N), size, Math.random() < 0.5);
        if (cells && cells.every((x) => !taken.has(x))) {
          cells.forEach((x) => taken.add(x));
          fleet.push(cells);
          break;
        }
      }
    }
    if (fleet.length === SHIPS.length) return fleet;
  }
}

export function NavalBoard({
  game,
  userId,
  nameOf,
}: {
  game: NavalGame;
  userId: string | undefined;
  nameOf: (id: string) => string;
}) {
  const qc = useQueryClient();
  const board = (game.board ?? {}) as Record<string, unknown>;
  const other = userId === game.user_id ? game.opponent_id : game.user_id;
  const myShots = (board[userId ?? ""] ?? {}) as Shots;
  const theirShots = (board[other] ?? {}) as Shots;
  const otherReady = !!board[`ready_${other}`];

  const { data: myFleet, isLoading } = useQuery({
    queryKey: ["naval_fleet", game.id, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("naval_fleets").select("cells").eq("game_id", game.id).maybeSingle();
      if (error) throw error;
      return data?.cells ?? null;
    },
  });

  if (isLoading) return null;
  if (!myFleet) return <Placement gameId={game.id} other={other} onDone={() => qc.invalidateQueries({ queryKey: ["naval_fleet", game.id] })} />;

  const mine = new Set(myFleet);
  const canFire = !game.winner && game.turn === userId && otherReady;
  const hitsOnMe = Object.values(theirShots).filter(Boolean).length;
  const myHits = Object.values(myShots).filter(Boolean).length;

  async function fire(cell: number) {
    if (!canFire || cell in myShots) return;
    const { data: hit, error } = await supabase.rpc("naval_fire", { _game: game.id, _cell: cell });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["couple_games"] });
    const won = hit && myHits + 1 >= 17;
    if (won) toast.success("¡Hundiste toda su flota! 🏆");
    else toast(hit ? "💥 ¡Tocado! Vuelves a disparar" : "🌊 Agua");
    if (won || !hit)
      notifyPartner({
        toUserId: other,
        type: "juego",
        title: won ? "Tu pareja hundió tu flota" : "¡Te toca disparar!",
        message: "Batalla naval",
        link: "/juegos",
      }).catch(() => {});
  }

  const status = game.winner
    ? `🏆 ${nameOf(game.winner)} ganó`
    : !otherReady
      ? "Esperando a que tu pareja coloque sus barcos…"
      : canFire ? "Tu turno: dispara en sus aguas" : "Tu pareja está apuntando…";

  return (
    <section className="space-y-4 rounded-3xl border bg-card/70 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold">Batalla naval</p>
        <p className={cn("text-sm text-muted-foreground", canFire && "font-semibold text-primary")}>{status}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">Sus aguas <span className="text-muted-foreground">· aciertos {myHits}/17</span></p>
          <Grid
            render={(i) => (i in myShots ? (myShots[i] ? "💥" : "•") : "")}
            cellClass={(i) => cn(i in myShots && myShots[i] && "bg-primary/30", canFire && !(i in myShots) && "cursor-crosshair hover:bg-accent")}
            onClick={fire}
            disabled={!canFire}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Tus barcos <span className="text-muted-foreground">· te tocaron {hitsOnMe}/17</span></p>
          <Grid
            render={(i) => (i in theirShots ? (theirShots[i] ? "💥" : "•") : "")}
            cellClass={(i) => cn(mine.has(i) && "bg-primary/45", i in theirShots && theirShots[i] && "bg-destructive/50")}
            disabled
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Si aciertas, vuelves a disparar. Gana quien hunda los 5 barcos primero.</p>
    </section>
  );
}

function Grid({
  render,
  cellClass,
  onClick,
  disabled,
}: {
  render: (i: number) => string;
  cellClass: (i: number) => string | false | undefined;
  onClick?: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-10 gap-0.5 rounded-xl bg-secondary/60 p-1">
      {Array.from({ length: N * N }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onClick?.(i)}
          className={cn("flex aspect-square items-center justify-center rounded-[4px] bg-background/70 text-[11px] transition sm:text-sm", cellClass(i))}
        >
          {render(i)}
        </button>
      ))}
    </div>
  );
}

function Placement({ gameId, other, onDone }: { gameId: string; other: string; onDone: () => void }) {
  const [fleet, setFleet] = useState<number[][]>([]);
  const [vertical, setVertical] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const taken = new Set(fleet.flat());
  const next = fleet.length < SHIPS.length ? SHIPS[fleet.length] : null;
  const preview = next != null && hover != null ? shipCells(hover, next, vertical) : null;
  const previewOk = !!preview && preview.every((x) => !taken.has(x));

  function place(i: number) {
    if (next == null) return;
    const cells = shipCells(i, next, vertical);
    if (!cells || cells.some((x) => taken.has(x))) { toast.error("No cabe ahí"); return; }
    setFleet([...fleet, cells]);
  }

  async function confirm() {
    setBusy(true);
    const { error } = await supabase.rpc("naval_place", { _game: gameId, _cells: fleet.flat() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Flota lista ⚓");
    notifyPartner({ toUserId: other, type: "juego", title: "Tu pareja ya colocó sus barcos", message: "Batalla naval", link: "/juegos" }).catch(() => {});
    onDone();
  }

  return (
    <section className="space-y-4 rounded-3xl border bg-card/70 p-4 sm:p-6">
      <div>
        <p className="font-display text-lg font-semibold">Coloca tus barcos en secreto</p>
        <p className="text-sm text-muted-foreground">
          {next != null ? `Coloca: ${SHIP_NAMES[fleet.length]} (${next} casillas)` : "¡Flota completa! Confírmala para empezar."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setVertical((v) => !v)}>
          <RotateCw className="size-4" /> {vertical ? "Vertical" : "Horizontal"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setFleet(randomFleet())}><Shuffle className="size-4" /> Al azar</Button>
        <Button size="sm" variant="ghost" disabled={!fleet.length} onClick={() => setFleet(fleet.slice(0, -1))}><Undo2 className="size-4" /> Deshacer</Button>
      </div>
      <div className="mx-auto max-w-md" onMouseLeave={() => setHover(null)}>
        <div className="grid grid-cols-10 gap-0.5 rounded-xl bg-secondary/60 p-1">
          {Array.from({ length: N * N }, (_, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onClick={() => place(i)}
              className={cn(
                "aspect-square rounded-[4px] bg-background/70 transition",
                taken.has(i) && "bg-primary/60",
                preview?.includes(i) && (previewOk ? "bg-primary/30" : "bg-destructive/40"),
              )}
            />
          ))}
        </div>
      </div>
      <Button className="w-full" disabled={next != null || busy} onClick={confirm}>Confirmar flota</Button>
    </section>
  );
}
