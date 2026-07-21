import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Upload, Trash2, Download, Search, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assets")({ component: AssetsPage });

type Asset = { id: string; name: string; storage_path: string; mime: string | null; size: number | null; folder: string; tags: string[]; uploaded_by: string; created_at: string };

function AssetsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => { const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false }); if (error) throw error; return (data ?? []) as Asset[]; },
  });

  const remove = useMutation({
    mutationFn: async (a: Asset) => {
      await supabase.storage.from("assets").remove([a.storage_path]);
      const { error } = await supabase.from("assets").delete().eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => { const { error } = await supabase.from("assets").update({ name }).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Renamed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      for (const file of Array.from(files)) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const up = await supabase.storage.from("assets").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        const { error } = await supabase.from("assets").insert({
          name: file.name, storage_path: path, mime: file.type, size: file.size, uploaded_by: user.id,
        });
        if (error) throw error;
      }
      toast.success(`${files.length} file(s) uploaded`);
      qc.invalidateQueries({ queryKey: ["assets"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const download = async (a: Asset) => {
    const { data, error } = await supabase.storage.from("assets").createSignedUrl(a.storage_path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const filtered = data.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <PageShell>
      <PageHeader
        title="Assets" description="Upload and organize brand media." icon={<ImageIcon className="h-5 w-5" />}
        actions={
          <label className="inline-flex">
            <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            <Button size="sm" asChild className="bg-gradient-hydro text-primary-foreground cursor-pointer">
              <span><Upload className="h-4 w-4 mr-1.5" /> {uploading ? "Uploading…" : "Upload"}</span>
            </Button>
          </label>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search assets…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No assets yet" description="Upload your first files to build the asset library." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="Try a different search." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} onDelete={() => remove.mutate(a)} onDownload={() => download(a)} onRename={(n) => rename.mutate({ id: a.id, name: n })} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function AssetCard({ asset, onDelete, onDownload, onRename }: { asset: Asset; onDelete: () => void; onDownload: () => void; onRename: (n: string) => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImage = asset.mime?.startsWith("image/");

  useState(() => {
    if (!isImage) return;
    supabase.storage.from("assets").createSignedUrl(asset.storage_path, 3600).then(({ data }) => data && setPreviewUrl(data.signedUrl));
  });

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-card">
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{asset.name}</p>
        <p className="text-[10px] text-muted-foreground uppercase">{asset.mime ?? "file"} · {asset.size ? `${Math.round(asset.size / 1024)} KB` : ""}</p>
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDownload}><Download className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { const n = prompt("Rename to:", asset.name); if (n) onRename(n); }}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-blaze" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
