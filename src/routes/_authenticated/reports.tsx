import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { FolderKanban, CheckSquare, Users, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({ component: ReportsPage });

const PALETTE = ["hsl(197 100% 55%)", "hsl(16 100% 55%)", "hsl(45 100% 55%)", "hsl(160 84% 39%)", "hsl(280 80% 60%)", "hsl(215 20% 55%)"];

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [projects, tasks, clients, invoices] = await Promise.all([
        supabase.from("projects").select("id, status"),
        supabase.from("tasks").select("id, status, priority"),
        supabase.from("clients").select("id"),
        supabase.from("invoices").select("id, status, amount"),
      ]);
      return { projects: projects.data ?? [], tasks: tasks.data ?? [], clients: clients.data ?? [], invoices: invoices.data ?? [] };
    },
  });

  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];
  const clients = data?.clients ?? [];
  const invoices = data?.invoices ?? [];

  const isEmpty = projects.length + tasks.length + clients.length + invoices.length === 0;

  const projectByStatus = Object.entries(projects.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const taskByPriority = Object.entries(tasks.reduce<Record<string, number>>((acc, t) => { const k = t.priority ?? "none"; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const invoiceRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
  const invoiceOutstanding = invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <PageShell>
      <PageHeader title="Reports" description="Live analytics from your workspace." icon={<BarChart3 className="h-5 w-5" />} />

      {isEmpty ? (
        <EmptyState icon={BarChart3} title="No data to report" description="Reports populate automatically once you have projects, tasks, clients, or invoices." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Projects" value={projects.length} icon={FolderKanban} accent="hydro" />
            <StatCard label="Tasks" value={tasks.length} hint={`${tasks.filter((t) => t.status === "done").length} done`} icon={CheckSquare} accent="blaze" />
            <StatCard label="Clients" value={clients.length} icon={Users} />
            <StatCard label="Revenue" value={`$${invoiceRevenue.toFixed(0)}`} hint={`$${invoiceOutstanding.toFixed(0)} outstanding`} icon={Receipt} accent="hydro" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-sm font-semibold mb-4">Projects by status</h3>
              <div className="h-64">
                {projectByStatus.length === 0 ? <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No projects</div> : (
                  <ResponsiveContainer>
                    <BarChart data={projectByStatus}>
                      <CartesianGrid vertical={false} stroke="hsl(220 15% 15%)" />
                      <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={11} />
                      <YAxis stroke="hsl(215 20% 55%)" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(197 100% 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-sm font-semibold mb-4">Tasks by priority</h3>
              <div className="h-64">
                {taskByPriority.length === 0 ? <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No tasks</div> : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={taskByPriority} dataKey="value" nameKey="name" outerRadius={80} label>
                        {taskByPriority.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ background: "hsl(220 20% 6%)", border: "1px solid hsl(220 15% 15%)", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
