import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Search, Settings, LogOut, User as UserIcon, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function TopBar() {
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (profile?.full_name || profile?.email || "U")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header
      className={`sticky top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border transition-all ${
        scrolled ? "glass-panel" : "bg-background"
      }`}
    >
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, files…"
            className="w-full h-9 pl-9 pr-16 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-hydro focus:border-hydro transition-all"
          />
          <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blaze shadow-glow-blaze" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: "/settings" })}>
          <Settings className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-muted/60 transition-colors">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-gradient-hydro text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                  {profile?.full_name || profile?.email}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {role || "Employee"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{profile?.full_name || "Signed in"}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {profile?.email}
                </span>
                <Badge variant="secondary" className="mt-2 w-fit text-[10px] uppercase tracking-wider">
                  {role || "Employee"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <UserIcon className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
