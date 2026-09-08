import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  BookOpen,
  CalendarHeart,
  Gift,
  Heart,
  Images,
  Laugh,
  LayoutGrid,
  LogOut,
  MapPin,
  NotebookPen,
  Settings,
  Sparkles,
  Stars,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profiles";
import { useSignedUrl } from "@/lib/media";
import { enablePush, pushSupported } from "@/lib/notify";
import { GlobalSearch } from "@/components/global-search";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/panel", label: "Panel", icon: Sparkles },
  { to: "/notas", label: "Notas", icon: NotebookPen },
  { to: "/galeria", label: "Galería", icon: Images },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/calendario", label: "Citas", icon: CalendarHeart },
  { to: "/cerca", label: "Ahora", icon: MapPin },
  { to: "/deseos", label: "Deseos", icon: Stars },
  { to: "/dedicatorias", label: "Dedicatorias", icon: Gift },
  { to: "/diario", label: "Diario", icon: Heart },
  { to: "/diversion", label: "Diversión", icon: Laugh },
  { to: "/libro", label: "Libro", icon: BookOpen },
] as const;

/** En el celular: 4 accesos fijos y el resto dentro de "Más". */
const MOBILE_PRIMARY = ["/panel", "/notas", "/galeria", "/cerca"] as const;

function PushBanner({ userId }: { userId: string }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!pushSupported() || Notification.permission !== "default") return;
    if (window.localStorage.getItem("push-banner-dismissed")) return;
    setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="border-b border-primary/30 bg-primary/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-xs">
        <BellRing className="size-4 text-primary" />
        <span className="flex-1">Activa los avisos para enterarte al instante de lo que haga tu pareja.</span>
        <Button
          size="sm"
          className="h-7 rounded-full px-3 text-xs"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await enablePush(userId).catch(() => false);
            setBusy(false);
            setShow(false);
            if (ok) toast.success("Listo: te avisaremos en este dispositivo");
            else toast.error("No se dio permiso para los avisos");
          }}
        >
          Activar
        </Button>
        <button
          className="text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
          onClick={() => {
            window.localStorage.setItem("push-banner-dismissed", "1");
            setShow(false);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

type NotificationRow = {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

/** Navega a la ruta interna de un aviso (con su ancla si la tiene). */
export function goToLink(navigate: ReturnType<typeof useNavigate>, link: string) {
  const url = new URL(link, window.location.origin);
  if (url.origin !== window.location.origin) return;
  navigate({ href: `${url.pathname}${url.search}${url.hash}` });
}

function NotificationBell({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, link, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function openNotification(n: NotificationRow) {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
    }
    setOpen(false);
    if (n.link) goToLink(navigate, n.link);
  }

  useEffect(() => {
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, userId]);

  const unread = data.filter((n) => !n.is_read).length;

  async function markAll() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full transition-transform hover:scale-110"
          aria-label="Notificaciones"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
              {unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-display text-sm font-semibold">Notificaciones</p>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {data.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Todo tranquilo por aquí.
            </p>
          ) : (
            <ul className="divide-y">
              {data.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openNotification(n)}
                    className={cn(
                      "block w-full px-4 py-3 text-left transition-colors hover:bg-accent/60",
                      !n.is_read && "bg-accent/40",
                    )}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("es", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {n.link && <span className="text-primary"> · Ver</span>}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useMyProfile(user?.id);
  const { data: avatar } = useSignedUrl(profile?.avatar_url);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hash = useRouterState({ select: (s) => s.location.hash });

  // Mantiene al día el aviso al celular en este dispositivo si ya estaba permitido.
  useEffect(() => {
    if (!user || !pushSupported() || Notification.permission !== "granted") return;
    enablePush(user.id).catch(() => {});
  }, [user]);

  // Lleva hasta el elemento exacto cuando el enlace trae un ancla (p. ej. un comentario).
  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
    return () => window.clearTimeout(id);
  }, [hash, pathname]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/panel" className="flex items-center gap-2">
            <Heart className="size-5 fill-primary text-primary" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Nuestro Espacio
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.to && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {mounted && user && <GlobalSearch />}
            {mounted && user && <NotificationBell userId={user.id} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="size-9 border border-border">
                    <AvatarImage src={avatar ?? undefined} alt={profile?.name ?? "Perfil"} />
                    <AvatarFallback className="bg-secondary text-xs">
                      {(profile?.name ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/ajustes">
                    <Settings className="mr-2 size-4" /> Ajustes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {mounted && user && <PushBanner userId={user.id} />}

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-16">{children}</main>

      <MobileNav pathname={pathname} />
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV.filter((n) => (MOBILE_PRIMARY as readonly string[]).includes(n.to));
  const secondary = NAV.filter((n) => !(MOBILE_PRIMARY as readonly string[]).includes(n.to));
  const moreActive = secondary.some((n) => n.to === pathname) || pathname === "/ajustes";

  const itemClass = (active: boolean) =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground transition-colors",
      active && "text-primary",
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch px-2 py-1">
        {primary.map((item) => (
          <li key={item.to} className="flex min-w-0 flex-1">
            <Link to={item.to} className={itemClass(pathname === item.to)}>
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  pathname === item.to && "bg-primary/15",
                )}
              >
                <item.icon className="size-5" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
        <li className="flex min-w-0 flex-1">
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button className={itemClass(moreActive)} aria-label="Más secciones">
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    moreActive && "bg-primary/15",
                  )}
                >
                  <LayoutGrid className="size-5" />
                </span>
                Más
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" sideOffset={10} className="w-64 p-2">
              <div className="grid grid-cols-3 gap-1">
                {[...secondary, { to: "/ajustes" as const, label: "Ajustes", icon: Settings }].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.to && "bg-accent text-primary",
                    )}
                  >
                    <item.icon className="size-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </li>
      </ul>
    </nav>
  );
}
