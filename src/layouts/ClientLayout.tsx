import { ClipboardList, Coins, Globe, Image, LayoutDashboard, ShoppingBag, UserCog } from "lucide-react";
import { useAuth } from "../auth/auth-context.ts";
import AppShell, { type ShellNavChild, type ShellNavItem } from "./AppShell.tsx";

/** Shortcuts under Shop for clients whose shop is turned on; Products is the Shop page's default view. */
const SHOP_LINKS: ShellNavChild[] = [
  { label: "Products", to: "/shop?section=products", isDefault: true },
  { label: "Inventory", to: "/shop?section=inventory" },
  { label: "Orders", to: "/shop?section=orders" },
];

/** Shown once a shop has the POS till turned on in its settings. */
const POS_LINKS: ShellNavChild[] = [
  { label: "POS", to: "/shop/pos" },
  { label: "POS sales", to: "/shop/pos/sales" },
];

function clientNav(shopOn: boolean, posOn: boolean): ShellNavItem[] {
  const shopLinks = posOn ? [...SHOP_LINKS, ...POS_LINKS] : SHOP_LINKS;
  return [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", end: true },
    { label: "My requirements", icon: ClipboardList, to: "/questionnaire" },
    { label: "My websites", icon: Globe, to: "/websites", activePrefixes: ["/websites"] },
    { label: "Shop", icon: ShoppingBag, to: "/shop", ...(shopOn ? { children: shopLinks, collapsible: true } : {}) },
    { label: "Media library", icon: Image, to: "/media" },
    { label: "Connects", icon: Coins, to: "/connects" },
    { label: "Account settings", icon: UserCog, to: "/account" },
  ];
}

export default function ClientLayout() {
  const { user } = useAuth();
  return <AppShell tone="light" nav={clientNav(Boolean(user?.client?.shopFeatureEnabled), Boolean(user?.client?.posEnabled))} roleLabel="Client" />;
}
