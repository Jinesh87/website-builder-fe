import { Globe, Layers, LayoutDashboard, Server, Settings, type LucideIcon } from "lucide-react";

export type ProjectTab = "overview" | "deployments" | "domains" | "hosting" | "settings";

const TABS: { id: ProjectTab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "deployments", label: "Deployments", icon: Layers },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "hosting", label: "Hosting", icon: Server },
  { id: "settings", label: "Settings", icon: Settings },
];

export function parseProjectTab(value: string | null): ProjectTab {
  return TABS.find((tab) => tab.id === value)?.id ?? "overview";
}

export default function ProjectTabs({ value, onChange }: { value: ProjectTab; onChange: (tab: ProjectTab) => void }) {
  return (
    <div role="tablist" aria-label="Website sections" className="flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map(({ id, label, icon: Icon }) => {
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
