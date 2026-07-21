import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});

type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived";

const statusColor: Record<ProjectStatus, string> = {
  planning: "bg-hydro/15 text-hydro border-hydro/30",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  completed: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted/40 text-muted-foreground border-border",
};

function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*, clients(company_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Project deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader
        title="Projects"
        description="All active and past HydroBlaze Media projects."
        icon={<FolderKanban className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
                <Plus className="h-4 w-4 mr-1.5" /> New project
              </Button>
            </DialogTrigger>
            <NewProjectDialog onDone={() => setOpen(false)} />
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FolderKanban className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first project to organize work.</p>
          <Button onClick={() => setOpen(true)} size="sm" className="mt-4 bg-gradient-hydro text-primary-foreground">
            <Plus className="h-4 w-4 mr-1.5" /> New project
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group relative rounded-xl border border-border bg-card p-4 shadow-card hover:border-hydro/40 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {p.clients?.company_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{p.clients.company_name}</p>
                  )}
                </div>
                <Badge variant="outline" className={statusColor[p.status as ProjectStatus]}>
                  {p.status.replace("_", " ")}
                </Badge>
              </div>
              {p.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.description}</p>}
              {p.due_date && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Due {new Date(p.due_date).toLocaleDateString()}
                </div>
              )}
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(p.id)}
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-blaze">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function NewProjectDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", description: "", client_id: "", status: "planning" as ProjectStatus,
    start_date: "", due_date: "",
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "select"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, company_name").order("company_name");
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const payload = {
        name: form.name,
        description: form.description || null,
        client_id: form.client_id || null,
        status: form.status,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        created_by: user.id,
      };
      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
        <div><Label>Project name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div><Label>Description</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Client</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Start date</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div><Label>Due date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending} className="bg-gradient-hydro text-primary-foreground">
            {create.isPending ? "Saving…" : "Create project"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
