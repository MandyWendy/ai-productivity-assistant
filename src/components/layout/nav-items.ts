import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  CheckSquare,
  Mail,
  NotebookPen,
  Brain,
  Search,
  MessageCircle,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/applications", label: "Applications", icon: Briefcase },
      { to: "/interviews", label: "Interviews", icon: CalendarDays },
      { to: "/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
  {
    title: "AI Workspace",
    items: [
      { to: "/ai/email", label: "Smart Email", icon: Mail },
      { to: "/ai/notes", label: "Meeting Notes", icon: NotebookPen },
      { to: "/ai/planner", label: "Task Planner", icon: Brain },
      { to: "/ai/research", label: "Research Assistant", icon: Search },
      { to: "/ai/chat", label: "AI Chat", icon: MessageCircle },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/profile", label: "Profile", icon: User },
    ],
  },
];
