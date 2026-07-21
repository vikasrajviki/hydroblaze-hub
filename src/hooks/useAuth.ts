import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  phone: string | null;
};

export type AppRole = "admin" | "manager" | "employee" | "intern";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async (u: User | null) => {
      if (!u) {
        if (mounted) { setProfile(null); setRole(null); }
        return;
      }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.id).limit(1).maybeSingle(),
      ]);
      if (!mounted) return;
      setProfile((p as Profile) ?? null);
      setRole(((r as { role: AppRole } | null)?.role) ?? "employee");
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
      load(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      load(session?.user ?? null);
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return { user, profile, role, loading };
}
