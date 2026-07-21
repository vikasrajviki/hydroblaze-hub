import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Users, Plug } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, role } = useAuth();

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage company profile, theme, notifications, roles and integrations."
        icon={<SettingsIcon className="h-5 w-5" />}
      />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5 mr-1.5" /> Profile</TabsTrigger>
          <TabsTrigger value="company"><Palette className="h-3.5 w-3.5 mr-1.5" /> Company</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="roles"><Users className="h-3.5 w-3.5 mr-1.5" /> Roles</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-3.5 w-3.5 mr-1.5" /> Security</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-3.5 w-3.5 mr-1.5" /> Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>Update your personal information and how the team sees you.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input defaultValue={profile?.full_name ?? ""} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input defaultValue={profile?.email ?? ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input defaultValue={profile?.department ?? ""} placeholder="e.g. Design" />
              </div>
              <div className="space-y-1.5">
                <Label>Job title</Label>
                <Input defaultValue={profile?.job_title ?? ""} placeholder="e.g. Senior Designer" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input defaultValue={profile?.phone ?? ""} placeholder="+1 …" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <div><Badge className="bg-hydro/15 text-hydro border-hydro/30 uppercase">{role ?? "employee"}</Badge></div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button className="bg-gradient-hydro text-primary-foreground hover:shadow-glow-hydro">Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Company profile</CardTitle><CardDescription>Public identity for HydroBlaze Media.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue="HydroBlaze Media" /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input placeholder="https://" /></div>
              <div className="space-y-1.5"><Label>Support email</Label><Input placeholder="ops@hydroblaze.media" /></div>
              <div className="space-y-1.5"><Label>Timezone</Label><Input defaultValue="Auto (browser)" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Choose what you want to be pinged about.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {["Project assignments", "Task comments", "Approvals awaiting me", "Announcements", "Weekly summary"].map((n) => (
                <div key={n} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                  <span className="text-sm">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Roles & permissions</CardTitle><CardDescription>Modular permission system. Extend as your team grows.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Admin", desc: "Full access to every module and setting." },
                { name: "Manager", desc: "Manage projects, tasks, clients and reports." },
                { name: "Employee", desc: "Contribute to projects and tasks." },
                { name: "Intern", desc: "Read-only access with contribution rights." },
              ].map((r) => (
                <div key={r.name} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.name}</span>
                    <Badge variant="secondary" className="uppercase text-[10px]">{r.name}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle><CardDescription>Password and account security.</CardDescription></CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
              <div className="space-y-1.5"><Label>Confirm password</Label><Input type="password" /></div>
              <Button className="bg-gradient-hydro text-primary-foreground">Update password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Integrations</CardTitle><CardDescription>Connect external tools to your workspace.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Google Drive", desc: "Sync uploaded documents.", status: "Connect" },
                { name: "Slack", desc: "Push notifications to channels.", status: "Coming soon" },
                { name: "Stripe", desc: "Sync invoices and payments.", status: "Coming soon" },
                { name: "GitHub", desc: "Link engineering repos to projects.", status: "Coming soon" },
              ].map((i) => (
                <div key={i.name} className="p-4 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.desc}</p>
                  </div>
                  <Button size="sm" variant="outline">{i.status}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
