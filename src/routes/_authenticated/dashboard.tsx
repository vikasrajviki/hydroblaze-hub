import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban, CheckSquare, Clock, TrendingUp, Plus, FileUp, Megaphone,
  Calendar, Activity, Bell, Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || "there";

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [projects, tasks, announcements, activity] = await Promise.all([
        supabase.from("projects").select("id, name, status, due_date, created_at"),
        supabase.from("tasks").select("id, title, status, due_date, created_at, updated_at"),
        supabase.from("announcements").select("id, title, body, created_at, is_pinned").order("created_at", { ascending: false }).limit(5),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      return {
        projects: projects.data ?? [],
        tasks: tasks.data ?? [],
        announcements: announcements.data ?? [],
        activity: activity.data ?? [],
      };
    },
  });

  const projects = stats?.projects ?? [];
  const tasks = stats?.tasks ?? [];
  const announcements = stats?.announcements ?? [];
  const activity = stats?.activity ?? [];

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;
  const dueTodayTasks = tasks.filter((t) => t.status !== "done" && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()).length;
  const monthlyCompletionRate = useMemo(() => {
    if (tasks.length === 0) return null;
    const done = tasks.filter((t) => t.status === "done").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const perfData = useMemo(() => {
    const months: { m: string; v: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en", { month: "short" });
      const count = tasks.filter((t) => {
        if (t.status !== "done" || !t.updated_at) return false;
        const dt = new Date(t.updated_at);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
      }).length;
      months.push({ m: label, v: count });
    }
    return months;
  }, [tasks]);

  const taskChartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    return days.map((_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (6 - i));
      const iso = d.toDateString();
      return {
        d: d.toLocaleDateString("en", { weekday: "short" }),
        done: tasks.filter((t) => t.status === "done" && t.updated_at && new Date(t.updated_at).toDateString() === iso).length,
        open: tasks.filter((t) => t.status !== "done" && t.created_at && new Date(t.created_at).toDateString() === iso).length,
      };
    });
  }, [tasks]);

  const deadlines = useMemo(() => {
    const now = Date.now();
    const items: { title: string; sub: string; due: string; priority: "high" | "med" | "low" }[] = [];
    for (const t of tasks) {
      if (t.status === "done" || !t.due_date) continue;
      const ts = new Date(t.due_date).getTime();
      const days = Math.round((ts - now) / 86400000);
      items.push({
        title: t.title, sub: "Task",
        due: days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `In ${days}d`,
        priority: days <= 1 ? "high" : days <= 4 ? "med" : "low",
      });
    }
    for (const p of projects) {
      if (!p.due_date || p.status === "completed" || p.status === "archived") continue;
      const ts = new Date(p.due_date).getTime();
      const days = Math.round((ts - now) / 86400000);
      items.push({
        title: p.name, sub: "Project",
        due: days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `In ${days}d`,
        priority: days <= 2 ? "high" : days <= 7 ? "med" : "low",
      });
    }
    return items.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
  }, [tasks, projects]);

  const hasAnyData = projects.length + tasks.length + announcements.length > 0;

  return (
    <PageShell>
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Live overview of your workspace."
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5"><Link to="/assets"><FileUp className="h-4 w-4" /> Upload</Link></Button>
            <Button asChild size="sm" className="gap-1.5 bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
              <Link to="/projects"><Plus className="h-4 w-4" /> New Project</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Projects" value={activeProjects} hint={`${projects.length} total`} icon={FolderKanban} accent="hydro" />
        <StatCard label="Pending Tasks" value={pendingTasks} hint={`${dueTodayTasks} due today`} icon={CheckSquare} accent="blaze" />
        <StatCard label="Announcements" value={announcements.length} hint="Recent posts" icon={Megaphone} />
        <StatCard label="Completion Rate" value={monthlyCompletionRate === null ? "—" : `${monthlyCompletionRate}%`} hint="Across all tasks" icon={TrendingUp} accent="hydro" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Tasks completed by month</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Live</Badge>
          </div>
          <div className="h-64">
            {tasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No task data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(197 100% 55%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(197 100% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(220 15% 15%)" />
                  <XAxis dataKey="m" stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="hsl(197 100% 55%)" strokeWidth={2} fill="url(#perfFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Task activity</h3>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
          <div className="h-64">
            {tasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskChartData}>
                  <CartesianGrid vertical={false} stroke="hsl(220 15% 15%)" />
                  <XAxis dataKey="d" stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="done" fill="hsl(197 100% 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="open" fill="hsl(16 100% 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Quick actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "New Project", icon: FolderKanban, to: "/projects" as const },
            { label: "Create Task", icon: CheckSquare, to: "/tasks" as const },
            { label: "Upload Document", icon: FileUp, to: "/documents" as const },
            { label: "Upload Asset", icon: Activity, to: "/assets" as const },
            { label: "Announcement", icon: Megaphone, to: "/announcements" as const },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="group flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-background/40 hover:bg-muted hover:border-hydro/40 text-sm transition-all">
              <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-hydro transition-colors" />
              <span className="font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <EmptyState
          icon={FolderKanban}
          title="Your workspace is empty"
          description="Get started by creating your first project, task, or announcement."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm" className="bg-gradient-hydro text-primary-foreground"><Link to="/projects"><Plus className="h-4 w-4 mr-1.5" /> New project</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/tasks">Create task</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/announcements">Post announcement</Link></Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Activity className="h-4 w-4 text-hydro" /> Recent activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">{(a.entity_type ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">
                        <span className="text-muted-foreground">{a.action} </span>
                        <span className="font-medium">{(a.meta as { name?: string; title?: string })?.name || (a.meta as { name?: string; title?: string })?.title || a.entity_type}</span>
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Calendar className="h-4 w-4 text-blaze" /> Upcoming deadlines</h3>
            {deadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            ) : (
              <ul className="space-y-3">
                {deadlines.map((d, i) => (
                  <li key={i} className="p-3 rounded-lg border border-border/60 bg-background/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.sub}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase shrink-0 ${d.priority === "high" ? "border-blaze/40 text-blaze" : d.priority === "med" ? "border-hydro/40 text-hydro" : "border-border text-muted-foreground"}`}>
                        {d.due}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Bell className="h-4 w-4 text-hydro" /> Announcements</h3>
            {announcements.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No announcements.{" "}
                <Link to="/announcements" className="text-hydro hover:underline">Post one</Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {announcements.map((n) => (
                  <li key={n.id} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {n.is_pinned && <Badge className="bg-blaze/15 text-blaze border-blaze/30 text-[10px]">Pinned</Badge>}
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <Link to="/team" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Users className="h-3 w-3" /> View team
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
