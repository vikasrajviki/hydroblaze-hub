import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/team")({ component: TeamPage });

type Member = { id: string; full_name: string | null; email: string | null; department: string | null; job_title: string | null; avatar_url: string | null; is_active: boolean; role: string; task_count: number };

function TeamPage() {
  const qc = useQueryClient();
  const { role: myRole } = useAuth();
  const isAdmin = myRole === "admin";

  const { data = [], isLoading } = useQuery<Member[]>({
    queryKey: ["team"],
    queryFn: async () => {
      const [profiles, roles, tasks] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("tasks").select("assignee_id, status"),
      ]);
      const roleMap = new Map<string, string>();
      (roles.data ?? []).forEach((r) => roleMap.set(r.user_id, r.role));
      const counts = new Map<string, number>();
      (tasks.data ?? []).forEach((t) => { if (t.assignee_id && t.status !== "done") counts.set(t.assignee_id, (counts.get(t.assignee_id) ?? 0) + 1); });
      return (profiles.data ?? []).map((p) => ({ ...p, role: roleMap.get(p.id) ?? "employee", task_count: counts.get(p.id) ?? 0 })) as Member[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as "admin" | "manager" | "employee" | "intern" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team"] }); toast.success("Role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader title="Team" description="All members of the HydroBlaze workspace." icon={<Users className="h-5 w-5" />} />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Invite members from Settings → Roles." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarFallback className="bg-gradient-hydro text-primary-foreground font-semibold">
                    {(m.full_name || m.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.full_name || m.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.job_title || "—"}{m.department ? ` · ${m.department}` : ""}</p>
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-hydro">
                    <Mail className="h-3 w-3" /> {m.email}
                  </a>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {isAdmin ? (
                  <Select value={m.role} onValueChange={(v) => updateRole.mutate({ userId: m.id, role: v })}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["admin", "manager", "employee", "intern"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="text-[10px] uppercase">{m.role}</Badge>
                )}
                <Badge variant="outline" className="text-[10px]">{m.task_count} open</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
