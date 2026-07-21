import { createFileRoute } from "@tanstack/react-router";
import {
  FolderKanban, CheckSquare, Clock, TrendingUp, Plus, FileUp, Megaphone,
  Calendar, Users, DollarSign, Activity, Bell,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const perfData = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 58 }, { m: "Mar", v: 51 },
  { m: "Apr", v: 74 }, { m: "May", v: 82 }, { m: "Jun", v: 91 },
  { m: "Jul", v: 88 }, { m: "Aug", v: 96 },
];
const taskData = [
  { d: "Mon", done: 12, open: 8 }, { d: "Tue", done: 18, open: 6 },
  { d: "Wed", done: 15, open: 11 }, { d: "Thu", done: 22, open: 5 },
  { d: "Fri", done: 28, open: 9 }, { d: "Sat", done: 8, open: 3 },
  { d: "Sun", done: 4, open: 2 },
];

const activity = [
  { who: "SM", what: "closed", target: "Brand refresh — Aurora Coffee", time: "2m ago", tone: "hydro" },
  { who: "JK", what: "uploaded", target: "12 assets to Q3 Campaign", time: "18m ago", tone: "blaze" },
  { who: "RA", what: "commented on", target: "Homepage hero variations", time: "1h ago", tone: "hydro" },
  { who: "NP", what: "approved", target: "Influencer contract v3", time: "3h ago", tone: "neutral" },
  { who: "LI", what: "scheduled", target: "IG reel for Nova launch", time: "5h ago", tone: "blaze" },
];

const deadlines = [
  { title: "Aurora Coffee — brand book", client: "Aurora", due: "Tomorrow", priority: "high" },
  { title: "Nova launch teaser edit", client: "Nova Labs", due: "In 2 days", priority: "high" },
  { title: "Monthly performance report", client: "Internal", due: "Fri", priority: "med" },
  { title: "Client onboarding — Helix", client: "Helix", due: "Next Mon", priority: "low" },
];

const notifications = [
  { title: "New comment from Ravi on Nova launch", time: "12m" },
  { title: "Invoice #1043 marked as paid", time: "1h" },
  { title: "Sasha requested asset review", time: "3h" },
  { title: "Announcement pinned by admin", time: "1d" },
];

function Dashboard() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || "there";

  return (
    <PageShell>
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Here's what's happening across HydroBlaze Media today."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><FileUp className="h-4 w-4" /> Upload</Button>
            <Button size="sm" className="gap-1.5 bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Projects" value={24} delta={12} hint="4 launching this week" icon={FolderKanban} accent="hydro" />
        <StatCard label="Pending Tasks" value={68} delta={-8} hint="18 due today" icon={CheckSquare} accent="blaze" />
        <StatCard label="Pending Approvals" value={7} hint="3 client, 4 internal" icon={Clock} />
        <StatCard label="Monthly Performance" value="94%" delta={6} hint="vs. last month" icon={TrendingUp} accent="hydro" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Monthly Performance</h3>
              <p className="text-xs text-muted-foreground">Delivery velocity across all projects</p>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Last 8 months</Badge>
          </div>
          <div className="h-64">
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
                <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="hsl(197 100% 55%)" strokeWidth={2} fill="url(#perfFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Task Completion</h3>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid vertical={false} stroke="hsl(220 15% 15%)" />
                <XAxis dataKey="d" stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="done" fill="hsl(197 100% 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="open" fill="hsl(16 100% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Quick actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "New Project", icon: FolderKanban },
            { label: "Create Task", icon: CheckSquare },
            { label: "Upload Document", icon: FileUp },
            { label: "Upload Asset", icon: Activity },
            { label: "Announcement", icon: Megaphone },
          ].map((a) => (
            <button key={a.label} className="group flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-background/40 hover:bg-muted hover:border-hydro/40 text-sm transition-all">
              <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-hydro transition-colors" />
              <span className="font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Three-column: activity, deadlines, notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-hydro" /> Recent activity</h3>
          </div>
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className={`text-[10px] font-semibold ${a.tone === "hydro" ? "bg-gradient-hydro text-primary-foreground" : a.tone === "blaze" ? "bg-gradient-blaze text-primary-foreground" : "bg-muted"}`}>
                    {a.who}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium">{a.who}</span>
                    <span className="text-muted-foreground"> {a.what} </span>
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-blaze" /> Upcoming deadlines</h3>
          </div>
          <ul className="space-y-3">
            {deadlines.map((d, i) => (
              <li key={i} className="p-3 rounded-lg border border-border/60 bg-background/40 hover:border-border transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.client}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase shrink-0 ${
                      d.priority === "high" ? "border-blaze/40 text-blaze" :
                      d.priority === "med" ? "border-hydro/40 text-hydro" : "border-border text-muted-foreground"
                    }`}
                  >
                    {d.due}
                  </Badge>
                </div>
                <Progress value={d.priority === "high" ? 80 : d.priority === "med" ? 55 : 30} className="mt-2 h-1" />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-hydro" /> Notifications</h3>
            <Badge className="bg-blaze/15 text-blaze border-blaze/30">{notifications.length} new</Badge>
          </div>
          <ul className="space-y-2">
            {notifications.map((n, i) => (
              <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-hydro shadow-glow-hydro shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{n.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{n.time} ago</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold flex items-center gap-2 mb-2"><Users className="h-3 w-3 text-muted-foreground" /> Next meeting</h4>
            <div className="p-3 rounded-lg bg-gradient-to-br from-hydro/10 to-blaze/10 border border-hydro/20">
              <p className="text-sm font-medium">Q3 Campaign Kickoff</p>
              <p className="text-xs text-muted-foreground">Today · 3:00 PM · with Aurora Coffee</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
