import type { ComponentType, ReactNode } from "react";
import { Files, Images, Layers, LayoutTemplate, Plus, type LucideProps } from "lucide-react";
import AppTooltip from "../../../components/ui/AppTooltip.tsx";
import { AiSparklesIcon } from "../../../components/icons/AiSparklesIcon.tsx";
import { useEditor, type LeftPanelId } from "../editor-context.ts";
import AddPanel from "./panels/AddPanel.tsx";
import AssetsPanel from "./panels/AssetsPanel.tsx";
import LayersPanel from "./panels/LayersPanel.tsx";
import PagesPanel from "./panels/PagesPanel.tsx";
import TemplatesPanel from "./panels/TemplatesPanel.tsx";

const PANELS: { id: LeftPanelId; label: string; icon: ComponentType<LucideProps>; render: ComponentType }[] = [
  { id: "add", label: "Add sections", icon: Plus, render: AddPanel },
  { id: "pages", label: "Pages", icon: Files, render: PagesPanel },
  { id: "layers", label: "Layers", icon: Layers, render: LayersPanel },
  { id: "assets", label: "Assets", icon: Images, render: AssetsPanel },
  { id: "templates", label: "Templates", icon: LayoutTemplate, render: TemplatesPanel },
];

function RailButton({
  label,
  active,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <AppTooltip content={label} placement="right" offset={8}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={`relative grid size-9 place-items-center rounded-ed transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          active ? "bg-ed-accent-soft text-ed-accent" : "text-ed-muted hover:bg-ed-hover hover:text-ed-text"
        }`}
      >
        {children}
      </button>
    </AppTooltip>
  );
}

export default function LeftRail() {
  const { leftPanel, setLeftPanel, aiOpen, setAiOpen, aiLock } = useEditor();
  const active = PANELS.find((panel) => panel.id === leftPanel);
  const Panel = active?.render;

  return (
    <div className="z-(--z-ed-panel) flex h-full min-h-0 shrink-0 select-none">
      <nav aria-label="Editor tools" className="flex h-full min-h-0 w-13 shrink-0 flex-col items-center gap-1 border-r border-ed-border bg-ed-panel py-2 overflow-y-auto overscroll-contain">
        {PANELS.map(({ id, label, icon: Icon }) => (
          <RailButton key={id} label={label} active={leftPanel === id} onClick={() => setLeftPanel(leftPanel === id ? null : id)}>
            <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
          </RailButton>
        ))}
        <span className="my-1 h-px w-6 shrink-0 bg-ed-border" aria-hidden />
        <RailButton label="AI assistant" active={aiOpen} disabled={aiLock !== null} onClick={() => setAiOpen(!aiOpen)}>
          <AiSparklesIcon className="size-4.5" variant="glossy" aria-hidden />
        </RailButton>
      </nav>
      {active && Panel && (
        <aside
          aria-label={active.label}
          className={`relative flex h-full min-h-0 ${leftPanel === "add" ? "w-96" : "w-72"} shrink-0 flex-col border-r border-ed-border bg-ed-panel overflow-hidden transition-[width] duration-150`}
        >
          <div inert={aiLock !== null} className={`flex min-h-0 flex-1 flex-col ${aiLock ? "opacity-40" : ""}`}>
            <Panel />
          </div>
          {aiLock && (
            <p role="status" className="absolute inset-x-3 top-3 rounded-ed border border-ed-border bg-ed-panel px-3 py-2 text-ed-xs text-ed-text shadow-ed-pop">
              {aiLock === "thinking"
                ? "AI is thinking. Editing unlocks when it replies."
                : aiLock === "building"
                  ? "AI is building. Editing unlocks when it finishes."
                  : "Apply or discard the AI changes to keep editing."}
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
