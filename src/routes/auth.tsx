import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HydroBlaze Media Portal" },
      { name: "description", content: "Sign in to the HydroBlaze Media employee portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };


  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (!result.redirected) {
      navigate({ to: "/dashboard", replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-hydro/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blaze/20 blur-[120px] pointer-events-none" />

      {/* Left side: branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10">
        <Logo />
        <div className="space-y-6 max-w-md">
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05]">
            The <span className="text-gradient-brand">operations OS</span><br />for modern media teams.
          </h1>
          <p className="text-lg text-muted-foreground">
            Projects, clients, content calendars, assets and reports — all inside one premium workspace built for HydroBlaze Media.
          </p>
          <div className="flex gap-2 pt-4">
            <div className="h-1 w-12 rounded-full bg-gradient-hydro" />
            <div className="h-1 w-8 rounded-full bg-gradient-blaze" />
            <div className="h-1 w-4 rounded-full bg-muted" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HydroBlaze Media. Internal use only.</p>
      </div>

      {/* Right side: form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
          <div className="glass-panel rounded-2xl p-8 shadow-elevated">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to continue to your workspace.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full h-11 gap-3 bg-background/50 border-border hover:bg-muted"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="you@hydroblaze.media"
                    className="h-11 pl-10 bg-background/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                  <button type="button" className="text-xs text-hydro hover:text-hydro-glow transition-colors"
                    onClick={() => toast.info("Ask an admin to reset your password")}>
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    placeholder="••••••••" className="h-11 pl-10 bg-background/50" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me on this device
              </label>

              <Button type="submit" disabled={busy}
                className="w-full h-11 bg-gradient-hydro hover:shadow-glow-hydro transition-all font-semibold text-primary-foreground">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    Sign in
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Access is invite-only. Contact your admin for an invitation.
            </p>

          </div>
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
