import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, UserSquare2,
  CalendarDays, Image as ImageIcon, FileText, Receipt, BarChart3,
  Megaphone, Settings, Sparkles, MessageSquare, Briefcase, Wallet,
  UserPlus, TrendingUp, PiggyBank, Package, LifeBuoy, Bot,
  Globe, Timer, Workflow, Plug, type LucideIcon,
} from "lucide-react";

export type ModuleItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  status?: "live" | "soon";
};

export type ModuleGroup = {
  label: string;
  items: ModuleItem[];
};

export const moduleGroups: ModuleGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, status: "live" },
      { title: "Projects", url: "/projects", icon: FolderKanban, status: "live" },
      { title: "Tasks", url: "/tasks", icon: CheckSquare, status: "live" },
      { title: "Clients", url: "/clients", icon: Users, status: "live" },
      { title: "Team", url: "/team", icon: UserSquare2, status: "live" },
    ],
  },
  {
    label: "Content & Operations",
    items: [
      { title: "Content Calendar", url: "/content", icon: CalendarDays, status: "live" },
      { title: "Assets", url: "/assets", icon: ImageIcon, status: "live" },
      { title: "Documents", url: "/documents", icon: FileText, status: "live" },
      { title: "Invoices", url: "/invoices", icon: Receipt, status: "live" },
      { title: "Reports", url: "/reports", icon: BarChart3, status: "live" },
      { title: "Announcements", url: "/announcements", icon: Megaphone, status: "live" },
    ],
  },
  {
    label: "Coming Soon",
    items: [
      { title: "CRM", url: "/crm", icon: Briefcase, status: "soon" },
      { title: "Sales Pipeline", url: "/sales", icon: TrendingUp, status: "soon" },
      { title: "HR", url: "/hr", icon: UserPlus, status: "soon" },
      { title: "Payroll", url: "/payroll", icon: Wallet, status: "soon" },
      { title: "Recruitment", url: "/recruitment", icon: UserPlus, status: "soon" },
      { title: "Finance", url: "/finance", icon: PiggyBank, status: "soon" },
      { title: "Inventory", url: "/inventory", icon: Package, status: "soon" },
      { title: "Support Tickets", url: "/support", icon: LifeBuoy, status: "soon" },
      { title: "AI Assistant", url: "/ai", icon: Bot, status: "soon" },
      { title: "Chat", url: "/chat", icon: MessageSquare, status: "soon" },
      { title: "Client Portal", url: "/client-portal", icon: Globe, status: "soon" },
      { title: "Time Tracking", url: "/time", icon: Timer, status: "soon" },
      { title: "Workflow Automation", url: "/workflows", icon: Workflow, status: "soon" },
      { title: "Integrations", url: "/integrations", icon: Plug, status: "soon" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/settings", icon: Settings, status: "live" },
    ],
  },
];

export const brandIcon = Sparkles;
