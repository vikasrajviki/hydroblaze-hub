import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Plus, Calendar, Trash2, Circle, CheckCircle2, Clock } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

type TaskStatus = "todo" | "in_progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

const priorityColor: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-hydro/15 text-hydro border-hydro/30",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  urgent: "bg-blaze/15 text-blaze border-blaze/30",
};

const statusIcon = (s: TaskStatus) => {
  if (s === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (s === "in_progress" || s === "review") return <Clock className="h-4 w-4 text-hydro" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

function TasksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks").select("*, projects(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader
        title="Tasks"
        description="Everything your team is working on."
        icon={<CheckSquare className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
                <Plus className="h-4 w-4 mr-1.5" /> New task
              </Button>
            </DialogTrigger>
            <NewTaskDialog onDone={() => setOpen(false)} />
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No tasks yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first task to get things moving.</p>
          <Button onClick={() => setOpen(true)} size="sm" className="mt-4 bg-gradient-hydro text-primary-foreground">
            <Plus className="h-4 w-4 mr-1.5" /> New task
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          {tasks.map((t) => (
            <div key={t.id} className="group flex items-center gap-3 p-3 border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors">
              <button onClick={() => updateStatus.mutate({
                id: t.id,
                status: t.status === "done" ? "todo" : "done",
              })} className="shrink-0">
                {statusIcon(t.status as TaskStatus)}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {t.title}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {t.projects?.name && <span>{t.projects.name}</span>}
                  {t.due_date && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <Select value={t.status} onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v as TaskStatus })}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className={priorityColor[t.priority as TaskPriority]}>{t.priority}</Badge>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(t.id)}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-blaze">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function NewTaskDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", project_id: "",
    status: "todo" as TaskStatus, priority: "medium" as TaskPriority, due_date: "",
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "select"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name").order("name");
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const payload = {
        title: form.title,
        description: form.description || null,
        project_id: form.project_id || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        created_by: user.id,
      };
      const { error } = await supabase.from("tasks").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
        <div><Label>Title *</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div><Label>Description</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Project</Label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Due date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending} className="bg-gradient-hydro text-primary-foreground">
            {create.isPending ? "Saving…" : "Create task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
