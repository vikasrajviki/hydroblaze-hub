import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/content")({ component: ContentPage });

type CStatus = "idea" | "draft" | "review" | "approved" | "scheduled" | "published";
type CItem = { id: string; title: string; description: string | null; platform: string | null; status: CStatus; publish_at: string | null; assigned_to: string | null; created_by: string };

const statusColor: Record<CStatus, string> = {
  idea: "bg-muted text-muted-foreground border-border",
  draft: "bg-hydro/15 text-hydro border-hydro/30",
  review: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  scheduled: "bg-blaze/15 text-blaze border-blaze/30",
  published: "bg-muted/40 text-muted-foreground border-border",
};

function ContentPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const { data = [] } = useQuery<CItem[]>({
    queryKey: ["content"],
    queryFn: async () => { const { data, error } = await supabase.from("content_items").select("*").order("publish_at", { ascending: true, nullsFirst: false }); if (error) throw error; return (data ?? []) as CItem[]; },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("content_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["content"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const monthDays = useMemo(() => {
    const first = new Date(cursor); first.setDate(1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, CItem[]>();
    for (const c of data) {
      if (!c.publish_at) continue;
      const key = new Date(c.publish_at).toDateString();
      const arr = map.get(key) ?? []; arr.push(c); map.set(key, arr);
    }
    return map;
  }, [data]);

  return (
    <PageShell>
      <PageHeader
        title="Content Calendar" description="Plan and schedule content across platforms."
        icon={<Calendar className="h-5 w-5" />}
        actions={
          <>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setView("month")} className={`px-3 h-8 text-xs ${view === "month" ? "bg-muted" : ""}`}>Month</button>
              <button onClick={() => setView("list")} className={`px-3 h-8 text-xs ${view === "list" ? "bg-muted" : ""}`}>List</button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm" className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New content</Button></DialogTrigger>
              <NewContentDialog onDone={() => setOpen(false)} />
            </Dialog>
          </>
        }
      />

      {data.length === 0 ? (
        <EmptyState icon={Calendar} title="No content planned" description="Plan your first piece of content." action={<Button size="sm" onClick={() => setOpen(true)} className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New content</Button>} />
      ) : view === "list" ? (
        <div className="space-y-2">
          {data.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{c.title}</p>
                  <Badge variant="outline" className={statusColor[c.status]}>{c.status}</Badge>
                  {c.platform && <Badge variant="secondary" className="text-[10px]">{c.platform}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.publish_at ? new Date(c.publish_at).toLocaleString() : "Unscheduled"}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)} className="h-7 w-7 hover:text-blaze"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold">{cursor.toLocaleString("en", { month: "long", year: "numeric" })}</h3>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" className="h-8" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</Button>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-[10px] uppercase text-muted-foreground border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="p-2 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const items = byDay.get(d.toDateString()) ?? [];
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`min-h-[92px] border-r border-b border-border p-1.5 ${!inMonth ? "opacity-40" : ""}`}>
                  <div className={`text-[11px] font-medium ${isToday ? "text-hydro" : ""}`}>{d.getDate()}</div>
                  <div className="space-y-1 mt-1">
                    {items.slice(0, 3).map((c) => (
                      <div key={c.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${statusColor[c.status]}`}>{c.title}</div>
                    ))}
                    {items.length > 3 && <div className="text-[10px] text-muted-foreground">+{items.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
}

function NewContentDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", platform: "", status: "idea" as CStatus, publish_at: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("content_items").insert({
        title: form.title, description: form.description || null, platform: form.platform || null,
        status: form.status, publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["content"] }); toast.success("Content created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New content</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
        <div><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Platform</Label><Input placeholder="Instagram, LinkedIn…" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} /></div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["idea", "draft", "review", "approved", "scheduled", "published"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Publish date</Label><Input type="datetime-local" value={form.publish_at} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} /></div>
        <DialogFooter><Button type="submit" disabled={create.isPending} className="bg-gradient-hydro text-primary-foreground">{create.isPending ? "Saving…" : "Create"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
