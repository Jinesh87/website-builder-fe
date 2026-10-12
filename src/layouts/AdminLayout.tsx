import {
  Globe,
  Image,
  LayoutTemplate,
  PanelsTopLeft,
  Rows3,
  Server,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import AppShell, { type ShellNavItem } from "./AppShell.tsx";
import AiSparklesIcon from "../components/icons/AiSparklesIcon.tsx";

const ADMIN_NAV: ShellNavItem[] = [
  { label: "Clients", icon: Users, to: "/admin", end: true, activePrefixes: ["/admin/clients"] },
  { label: "All websites", icon: Globe, to: "/admin/websites", activePrefixes: ["/websites/"] },
  { label: "AI Usage", icon: AiSparklesIcon, to: "/admin/ai-usage" },
  { label: "Transactions", icon: Wallet, to: "/admin/transactions" },
  { label: "Templates and themes", icon: LayoutTemplate },
  { label: "Headers and footers", icon: PanelsTopLeft },
  { label: "Reusable sections", icon: Rows3, to: "/admin/sections" },
  { label: "Domains", icon: Server },
  { label: "Media", icon: Image, to: "/admin/media" },
  { label: "Settings", icon: Settings, to: "/admin/settings", activePrefixes: ["/admin/settings"] },
];

export default function AdminLayout() {
  return <AppShell tone="dark" nav={ADMIN_NAV} roleLabel="Super Admin" caption="Super Admin" />;
}
