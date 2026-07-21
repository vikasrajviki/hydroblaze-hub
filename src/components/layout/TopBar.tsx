import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Bell, Search, Settings, LogOut, User as UserIcon, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SearchResult = { id: string; type: string; title: string; sub?: string; to: string };

export function TopBar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile, role, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(15);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase.channel("notif-topbar").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, qc]);

  const unread = notifications.filter((n) => !n.read_at).length;

  const markAllRead = useMutation({
    mutationFn: async () => { const ids = notifications.filter((n) => !n.read_at).map((n) => n.id); if (ids.length === 0) return; const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { data: results = [] } = useQuery<SearchResult[]>({
    queryKey: ["global-search", q],
    enabled: q.trim().length >= 2,
    queryFn: async () => {
      const term = `%${q.trim()}%`;
      const [projects, tasks, clients, profiles, assets] = await Promise.all([
        supabase.from("projects").select("id, name, status").ilike("name", term).limit(5),
        supabase.from("tasks").select("id, title, status").ilike("title", term).limit(5),
        supabase.from("clients").select("id, company_name, contact_name").ilike("company_name", term).limit(5),
        supabase.from("profiles").select("id, full_name, email").ilike("full_name", term).limit(5),
        supabase.from("assets").select("id, name").ilike("name", term).limit(5),
      ]);
      const out: SearchResult[] = [];
      (projects.data ?? []).forEach((r) => out.push({ id: r.id, type: "Project", title: r.name, sub: r.status, to: "/projects" }));
      (tasks.data ?? []).forEach((r) => out.push({ id: r.id, type: "Task", title: r.title, sub: r.status, to: "/tasks" }));
      (clients.data ?? []).forEach((r) => out.push({ id: r.id, type: "Client", title: r.company_name, sub: r.contact_name ?? undefined, to: "/clients" }));
      (profiles.data ?? []).forEach((r) => out.push({ id: r.id, type: "Team", title: r.full_name ?? r.email ?? "", sub: r.email ?? undefined, to: "/team" }));
      (assets.data ?? []).forEach((r) => out.push({ id: r.id, type: "Asset", title: r.name, to: "/assets" }));
      return out;
    },
  });

  const initials = useMemo(() => (profile?.full_name || profile?.email || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(), [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className={`sticky top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border transition-all ${scrolled ? "glass-panel" : "bg-background"}`}>
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <Popover open={searchOpen && q.trim().length >= 2} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text" value={q} onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)}
                placeholder="Search projects, tasks, clients, team…"
                className="w-full h-9 pl-9 pr-16 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-hydro focus:border-hydro transition-all"
              />
              <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            {results.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">No matches for "{q}"</div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <button onClick={() => { navigate({ to: r.to }); setSearchOpen(false); setQ(""); }} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                      <Badge variant="secondary" className="text-[10px] uppercase shrink-0">{r.type}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        {r.sub && <p className="text-xs text-muted-foreground truncate">{r.sub}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blaze shadow-glow-blaze" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unread > 0 && <button onClick={() => markAllRead.mutate()} className="text-xs text-hydro hover:underline">Mark all read</button>}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={`p-3 border-b border-border last:border-0 ${!n.read_at ? "bg-muted/40" : ""}`}>
                    <Link to={(n.link as "/tasks") || "/dashboard"} className="block">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-hydro shrink-0" />}
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate({ to: "/settings" })}>
          <Settings className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-muted/60 transition-colors">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-gradient-hydro text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{profile?.full_name || profile?.email}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{role || "Employee"}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{profile?.full_name || "Signed in"}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">{profile?.email}</span>
                <Badge variant="secondary" className="mt-2 w-fit text-[10px] uppercase tracking-wider">{role || "Employee"}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><UserIcon className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive"><LogOut className="h-4 w-4 mr-2" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
