import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CalendarHeart,
  Heart,
  Images,
  Laugh,
  LogOut,
  NotebookPen,
  Settings,
  Sparkles,
  Stars,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profiles";
import { useSignedUrl } from "@/lib/media";
import { ThemeToggle } from "@/components/theme-toggle";
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
  { to: "/deseos", label: "Deseos", icon: Stars },
  { to: "/diario", label: "Diario", icon: Heart },
  { to: "/diversion", label: "Diversión", icon: Laugh },
] as const;

type NotificationRow = {
  id: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

function NotificationBell({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

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
    <Popover>
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
                <li key={n.id} className={cn("px-4 py-3", !n.is_read && "bg-accent/40")}>
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
                  </p>
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
            <ThemeToggle />
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

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
        <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-1.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex w-14 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-muted-foreground transition-colors",
                  pathname === item.to && "text-primary",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
