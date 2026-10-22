import { Globe, Layers, LayoutDashboard, Server, Settings, ShoppingBag, type LucideIcon } from "lucide-react";

export type ProjectTab = "overview" | "deployments" | "domains" | "hosting" | "shop" | "settings";

const TABS: { id: ProjectTab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "deployments", label: "Deployments", icon: Layers },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "hosting", label: "Hosting", icon: Server },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: Settings },
];

export function parseProjectTab(value: string | null, showShop = false): ProjectTab {
  const tab = TABS.find((item) => item.id === value)?.id ?? "overview";
  if (tab === "shop" && !showShop) return "overview";
  return tab;
}

export default function ProjectTabs({
  value,
  onChange,
  showShop,
}: {
  value: ProjectTab;
  onChange: (tab: ProjectTab) => void;
  showShop: boolean;
}) {
  const tabs = TABS.filter((tab) => tab.id !== "shop" || showShop);
  return (
    <div role="tablist" aria-label="Website sections" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`relative -mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
              active ? "border-ink font-medium text-ink" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
