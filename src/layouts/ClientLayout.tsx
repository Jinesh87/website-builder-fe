import { Image, LayoutDashboard, Globe, Settings, UserCog, Wallet } from "lucide-react";
import AppShell, { type ShellNavItem } from "./AppShell.tsx";

const CLIENT_NAV: ShellNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", end: true },
  { label: "My websites", icon: Globe, to: "/websites", activePrefixes: ["/websites"] },
  { label: "Media library", icon: Image, to: "/media" },
  { label: "Wallet", icon: Wallet, to: "/wallet" },
  { label: "Website settings", icon: Settings },
  { label: "Account settings", icon: UserCog, to: "/account" },
];

export default function ClientLayout() {
  return <AppShell tone="light" nav={CLIENT_NAV} roleLabel="Client" />;
}
