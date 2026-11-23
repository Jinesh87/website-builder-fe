import { ClipboardList, Coins, Globe, Image, LayoutDashboard, ShoppingBag, UserCog } from "lucide-react";
import { useAuth } from "../auth/auth-context.ts";
import AppShell, { type ShellNavItem } from "./AppShell.tsx";

/** Shortcuts under Shop for clients whose shop is turned on; Products is the Shop page's default view. */
const SHOP_LINKS: ShellNavItem["children"] = [
  { label: "Products", to: "/shop?section=products", isDefault: true },
  { label: "Inventory", to: "/shop?section=inventory" },
  { label: "Orders", to: "/shop?section=orders" },
];

function clientNav(shopOn: boolean): ShellNavItem[] {
  return [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", end: true },
    { label: "My requirements", icon: ClipboardList, to: "/questionnaire" },
    { label: "My websites", icon: Globe, to: "/websites", activePrefixes: ["/websites"] },
    { label: "Shop", icon: ShoppingBag, to: "/shop", ...(shopOn ? { children: SHOP_LINKS, collapsible: true } : {}) },
    { label: "Media library", icon: Image, to: "/media" },
    { label: "Connects", icon: Coins, to: "/connects" },
    { label: "Account settings", icon: UserCog, to: "/account" },
  ];
}

export default function ClientLayout() {
  const { user } = useAuth();
  return <AppShell tone="light" nav={clientNav(Boolean(user?.client?.shopFeatureEnabled))} roleLabel="Client" />;
}
