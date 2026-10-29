import {
  CalendarClock,
  Globe,
  Image,
  Inbox,
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
import { useNewEnquiryCount } from "../hooks/use-new-enquiry-count.ts";

function adminNav(newEnquiries: number): ShellNavItem[] {
  return [
    { label: "Clients", icon: Users, to: "/admin", end: true, activePrefixes: ["/admin/clients"] },
    { label: "Enquiries", icon: Inbox, to: "/admin/enquiries", badge: newEnquiries },
    { label: "All websites", icon: Globe, to: "/admin/websites", activePrefixes: ["/websites/"] },
    { label: "AI Usage", icon: AiSparklesIcon, to: "/admin/ai-usage" },
    { label: "Transactions", icon: Wallet, to: "/admin/transactions" },
    { label: "Hosting", icon: CalendarClock, to: "/admin/hosting" },
    { label: "Templates", icon: LayoutTemplate, to: "/admin/templates" },
    { label: "Headers and footers", icon: PanelsTopLeft },
    { label: "Reusable sections", icon: Rows3, to: "/admin/sections" },
    { label: "Domains", icon: Server },
    { label: "Media", icon: Image, to: "/admin/media" },
    { label: "Settings", icon: Settings, to: "/admin/settings", activePrefixes: ["/admin/settings"] },
  ];
}

export default function AdminLayout() {
  const newEnquiries = useNewEnquiryCount();
  return <AppShell tone="dark" nav={adminNav(newEnquiries)} roleLabel="Super Admin" caption="Super Admin" />;
}
