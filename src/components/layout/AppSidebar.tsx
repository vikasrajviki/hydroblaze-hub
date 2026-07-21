import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { moduleGroups } from "@/lib/modules";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border h-14 flex items-center justify-center px-3">
        <Logo showText={!collapsed} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {moduleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "group relative h-9 gap-3 rounded-lg text-sm font-medium transition-all",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground",
                          item.status === "soon" && "opacity-60",
                        )}
                      >
                        <Link to={item.url}>
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-hydro shadow-glow-hydro" />
                          )}
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active ? "text-hydro" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.title}</span>
                          )}
                          {!collapsed && item.status === "soon" && (
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 border border-border rounded px-1 py-0.5">
                              Soon
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
