import { useState } from "react";
import { ArrowLeft, ChevronRight, Code2, ExternalLink, Monitor, Redo2, ShieldCheck, Smartphone, Tablet, Undo2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import AppTooltip from "../../../components/ui/AppTooltip.tsx";
import DownloadCodeDialog from "../../../components/websites/DownloadCodeDialog.tsx";
import type { Device } from "../../../components/websites/DevicePreview.tsx";
import { useEditor } from "../editor-context.ts";
import { useBuilderPuck } from "../puck/puck-api.ts";
import AutosaveIndicator from "./AutosaveIndicator.tsx";
import { ToolButton } from "./ui.tsx";

const DEVICE_OPTIONS: { id: Device; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

function PublishState() {
  const { website } = useEditor();
  const [label, dot] =
    website.status === "PUBLISHED"
      ? website.hasUnpublishedChanges
        ? ["Unpublished changes", "bg-ed-warning"]
        : ["Published", "bg-ed-success"]
      : website.status === "UNPUBLISHED"
        ? ["Offline", "bg-ed-faint"]
        : ["Draft", "bg-ed-faint"];
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-ed-border px-2 text-ed-xs text-ed-muted">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

type TopBarProps = {
  backTo: string;
  onPublish: () => void;
};

export default function TopBar({ backTo, onPublish }: TopBarProps) {
  const { website, page, role, device, setDevice, autosave, aiLock } = useEditor();
  const history = useBuilderPuck((state) => state.history);
  const [downloadOpen, setDownloadOpen] = useState(false);

  async function openPreview() {
    const url = `/websites/${website.id}/preview`;
    if (autosave.status === "saved") {
      window.open(url, "_blank", "noopener");
      return;
    }
    // Open synchronously to avoid popup blockers, then navigate once the draft is saved.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    await autosave.flush();
    if (tab) tab.location.href = url;
  }

  return (
    <header className="z-(--z-ed-toolbar) flex h-12 shrink-0 items-center gap-2 border-b border-ed-border bg-ed-panel px-2">
      <AppTooltip content="Back to websites" placement="bottom">
        <Link
          to={backTo}
          aria-label="Back to websites"
          className="grid size-8 place-items-center rounded-ed text-ed-muted hover:bg-ed-hover hover:text-ed-text"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      </AppTooltip>
      <span className="h-5 w-px bg-ed-border" aria-hidden />

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1 text-ed-sm">
          <li className="hidden truncate text-ed-muted lg:block">{website.clientName}</li>
          <li className="hidden text-ed-faint lg:block" aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="max-w-48 truncate text-ed-muted">{website.name}</li>
          <li className="text-ed-faint" aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="max-w-40 truncate font-medium text-ed-text" aria-current="page">
            {page.name}
          </li>
        </ol>
      </nav>
      <PublishState />
      <AutosaveIndicator autosave={autosave} />

      <div className="mx-auto flex items-center gap-1">
        <ToolButton label="Undo" shortcut="⌘Z" onClick={history.back} disabled={!history.hasPast || aiLock !== null}>
          <Undo2 className="size-4" aria-hidden />
        </ToolButton>
        <ToolButton label="Redo" shortcut="⇧⌘Z" onClick={history.forward} disabled={!history.hasFuture || aiLock !== null}>
          <Redo2 className="size-4" aria-hidden />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-ed-border" aria-hidden />
        <div role="radiogroup" aria-label="Preview device" className="flex rounded-ed bg-ed-subtle p-0.5">
          {DEVICE_OPTIONS.map(({ id, label, icon: Icon }) => (
            <AppTooltip key={id} content={label} placement="bottom">
              <button
                type="button"
                role="radio"
                aria-checked={device === id}
                aria-label={label}
                onClick={() => setDevice(id)}
                className={`grid h-7 w-8 place-items-center rounded-ed-sm transition-colors ${
                  device === id ? "bg-ed-panel text-ed-text shadow-ed-xs" : "text-ed-muted hover:text-ed-text"
                }`}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            </AppTooltip>
          ))}
        </div>
      </div>

      <AppTooltip
        content={role === "SUPER_ADMIN" ? "Platform admin: can edit and publish any website" : "Owner: can edit and publish this website"}
        placement="bottom"
      >
        <span className="hidden items-center gap-1 text-ed-xs text-ed-muted xl:inline-flex cursor-default">
          {role === "SUPER_ADMIN" ? <ShieldCheck className="size-3.5" aria-hidden /> : <UserRound className="size-3.5" aria-hidden />}
          {role === "SUPER_ADMIN" ? "Admin" : "Owner"}
        </span>
      </AppTooltip>
      <AppTooltip content="Download code" placement="bottom">
        <button
          type="button"
          onClick={() => setDownloadOpen(true)}
          disabled={autosave.status === "conflict"}
          aria-label="Download code"
          className="grid size-8 place-items-center rounded-ed border border-ed-border text-ed-muted hover:bg-ed-hover hover:text-ed-text disabled:opacity-50"
        >
          <Code2 className="size-4" aria-hidden />
        </button>
      </AppTooltip>
      <button
        type="button"
        onClick={() => void openPreview()}
        className="inline-flex h-8 items-center gap-1.5 rounded-ed border border-ed-border px-2.5 text-ed-sm font-medium text-ed-text hover:bg-ed-hover"
      >
        <ExternalLink className="size-3.5" aria-hidden /> Preview
      </button>
      <button
        type="button"
        onClick={onPublish}
        disabled={autosave.status === "conflict" || aiLock !== null}
        title={aiLock ? "Apply or discard the AI changes before publishing" : undefined}
        className="inline-flex h-8 items-center rounded-ed bg-ed-accent px-3 text-ed-sm font-medium text-white shadow-ed-xs hover:bg-ed-accent-hover disabled:opacity-50"
      >
        Publish
      </button>
      <DownloadCodeDialog
        websiteId={website.id}
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        beforeExport={autosave.flush}
      />
    </header>
  );
}
