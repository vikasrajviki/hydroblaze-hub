import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AppRole = "admin" | "manager" | "employee" | "intern";

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; role: AppRole; full_name?: string }) => data)
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const email = data.email.trim().toLowerCase();
    if (!email) throw new Error("Email is required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: data.full_name ?? null, invited_role: data.role },
    });
    if (inviteErr) throw new Error(inviteErr.message);

    const userId = invited?.user?.id;
    if (userId) {
      // Replace any auto-assigned role with the invited role
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      const { error: insErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: data.role });
      if (insErr) throw new Error(insErr.message);
    }

    return { ok: true as const, userId };
  });
