import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Mail, Phone, Globe, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/clients")({
  component: ClientsPage,
});

type ClientStatus = "lead" | "active" | "inactive" | "churned";

const statusColor: Record<ClientStatus, string> = {
  lead: "bg-hydro/15 text-hydro border-hydro/30",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  churned: "bg-blaze/15 text-blaze border-blaze/30",
};

function ClientsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); toast.success("Client deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader
        title="Clients"
        description="Every client HydroBlaze Media works with."
        icon={<Users className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-hydro hover:shadow-glow-hydro text-primary-foreground">
                <Plus className="h-4 w-4 mr-1.5" /> New client
              </Button>
            </DialogTrigger>
            <NewClientDialog onDone={() => setOpen(false)} />
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : clients.length === 0 ? (
        <EmptyState onNew={() => setOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c.id} className="group relative rounded-xl border border-border bg-card p-4 shadow-card hover:border-hydro/40 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{c.company_name}</h3>
                  {c.contact_name && <p className="text-xs text-muted-foreground mt-0.5">{c.contact_name}</p>}
                </div>
                <Badge variant="outline" className={statusColor[c.status as ClientStatus]}>{c.status}</Badge>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                {c.website && <div className="flex items-center gap-1.5"><Globe className="h-3 w-3" />{c.website}</div>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)}
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

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-semibold">No clients yet</h3>
      <p className="text-sm text-muted-foreground mt-1">Add your first client to get started.</p>
      <Button onClick={onNew} size="sm" className="mt-4 bg-gradient-hydro text-primary-foreground">
        <Plus className="h-4 w-4 mr-1.5" /> New client
      </Button>
    </div>
  );
}

function NewClientDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "", phone: "", website: "",
    status: "lead" as ClientStatus, notes: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("clients").insert({ ...form, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client added");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
        <div><Label>Company name *</Label>
          <Input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Contact name</Label>
            <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ClientStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div><Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div><Label>Website</Label>
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <div><Label>Notes</Label>
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending} className="bg-gradient-hydro text-primary-foreground">
            {create.isPending ? "Saving…" : "Create client"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
