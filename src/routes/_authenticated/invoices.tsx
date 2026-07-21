import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus, Trash2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/invoices")({ component: InvoicesPage });

type InvStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";
type Invoice = { id: string; number: string; amount: number; currency: string; status: InvStatus; issued_at: string; due_at: string | null; client_id: string | null; notes: string | null; clients?: { company_name: string } | null };

const statusColor: Record<InvStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-blaze/15 text-blaze border-blaze/30",
  cancelled: "bg-muted/40 text-muted-foreground border-border",
};

function InvoicesPage() {
  const qc = useQueryClient();
  const { role } = useAuth();
  const canManage = role === "admin" || role === "manager";
  const [open, setOpen] = useState(false);

  const { data = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*, clients(company_name)").order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
    enabled: canManage,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvStatus }) => { const { error } = await supabase.from("invoices").update({ status }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("invoices").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canManage) {
    return <PageShell><PageHeader title="Invoices" icon={<Receipt className="h-5 w-5" />} /><EmptyState icon={Receipt} title="Restricted" description="Only managers and admins can access invoices." /></PageShell>;
  }

  return (
    <PageShell>
      <PageHeader
        title="Invoices" description="Track and manage client invoices."
        icon={<Receipt className="h-5 w-5" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New invoice</Button></DialogTrigger>
            <NewInvoiceDialog onDone={() => setOpen(false)} />
          </Dialog>
        }
      />
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices yet" description="Create your first invoice." action={<Button size="sm" onClick={() => setOpen(true)} className="bg-gradient-hydro text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" /> New invoice</Button>} />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Number</th><th className="text-left p-3">Client</th>
                <th className="text-right p-3">Amount</th><th className="text-left p-3">Issued</th>
                <th className="text-left p-3">Due</th><th className="text-left p-3">Status</th><th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  <td className="p-3 font-medium">{inv.number}</td>
                  <td className="p-3 text-muted-foreground">{inv.clients?.company_name ?? "—"}</td>
                  <td className="p-3 text-right tabular-nums">{inv.currency} {Number(inv.amount).toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString()}</td>
                  <td className="p-3 text-muted-foreground">{inv.due_at ? new Date(inv.due_at).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <Select value={inv.status} onValueChange={(v) => setStatus.mutate({ id: inv.id, status: v as InvStatus })}>
                      <SelectTrigger className={`h-7 w-32 text-xs ${statusColor[inv.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["draft", "pending", "paid", "overdue", "cancelled"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(inv.id)} className="h-7 w-7 hover:text-blaze"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}

function NewInvoiceDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ number: `INV-${Date.now().toString().slice(-6)}`, amount: "0", currency: "USD", status: "draft" as InvStatus, client_id: "", issued_at: new Date().toISOString().slice(0, 10), due_at: "", notes: "" });
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "select"], queryFn: async () => { const { data } = await supabase.from("clients").select("id, company_name").order("company_name"); return data ?? []; } });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("invoices").insert({
        number: form.number, amount: Number(form.amount), currency: form.currency, status: form.status,
        client_id: form.client_id || null, issued_at: form.issued_at, due_at: form.due_at || null,
        notes: form.notes || null, created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("Invoice created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Number *</Label><Input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
          <div><Label>Client</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Amount *</Label><Input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          <div><Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as InvStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["draft", "pending", "paid", "overdue", "cancelled"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Issued</Label><Input type="date" value={form.issued_at} onChange={(e) => setForm({ ...form, issued_at: e.target.value })} /></div>
          <div><Label>Due</Label><Input type="date" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></div>
        </div>
        <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <DialogFooter><Button type="submit" disabled={create.isPending} className="bg-gradient-hydro text-primary-foreground">{create.isPending ? "Saving…" : "Create"}</Button></DialogFooter>
      </form>
      <Badge className="hidden">{/* keep import */}</Badge>
    </DialogContent>
  );
}
