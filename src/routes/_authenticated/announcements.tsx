import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Pin, PinOff, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/announcements")({
  component: AnnouncementsPage,
});

type Announcement = { id: string; title: string; body: string; is_pinned: boolean; created_at: string; author_id: string };

function AnnouncementsPage() {
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const canManage = role === "admin" || role === "manager";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const { data = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Announcement[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("announcements").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePin = useMutation({
    mutationFn: async (a: Announcement) => { const { error } = await supabase.from("announcements").update({ is_pinned: !a.is_pinned }).eq("id", a.id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader
        title="Announcements"
        description="Share news and updates with the team."
        icon={<Megaphone className="h-5 w-5" />}
        actions={
          canManage && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New announcement</Button>
              </DialogTrigger>
              <EditDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); }} />
            </Dialog>
          )
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description={canManage ? "Post the first update for your team." : "Check back later for updates from your team."}
          action={canManage && <Button size="sm" onClick={() => setOpen(true)} className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New announcement</Button>}
        />
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {a.is_pinned && <Badge className="bg-blaze/15 text-blaze border-blaze/30 text-[10px]">Pinned</Badge>}
                    <h3 className="font-semibold">{a.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                {(canManage || a.author_id === user?.id) && (
                  <div className="flex items-center gap-1">
                    {canManage && (
                      <Button size="icon" variant="ghost" onClick={() => togglePin.mutate(a)} className="h-7 w-7">
                        {a.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }} className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(a.id)} className="h-7 w-7 hover:text-blaze"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function EditDialog({ editing, onDone }: { editing: Announcement | null; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: editing?.title ?? "", body: editing?.body ?? "", is_pinned: editing?.is_pinned ?? false });

  const save = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      if (editing) {
        const { error } = await supabase.from("announcements").update({ title: form.title, body: form.body, is_pinned: form.is_pinned }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert({ title: form.title, body: form.body, is_pinned: form.is_pinned, author_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success(editing ? "Updated" : "Posted"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>{editing ? "Edit announcement" : "New announcement"}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
        <div><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Body *</Label><Textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} /> Pin to top</label>
        <DialogFooter>
          <Button type="submit" disabled={save.isPending} className="bg-gradient-hydro text-primary-foreground">{save.isPending ? "Saving…" : editing ? "Save changes" : "Post"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
