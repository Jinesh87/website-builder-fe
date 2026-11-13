import { FileCode2, MousePointerClick } from "lucide-react";
import { Link } from "react-router-dom";
import { AiSparklesIcon } from "../icons/AiSparklesIcon.tsx";

export default function BuilderChoices() {
  return (
    <div className="mx-auto mt-7 grid max-w-3xl gap-4 sm:grid-cols-3">
      <Link
        to="/websites/new"
        className="rounded-lg border border-line p-5 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
      >
        <MousePointerClick className="size-5 text-brand" aria-hidden />
        <p className="mt-3 font-medium text-ink">Manual builder</p>
        <p className="mt-1 text-sm text-ink-body">Pick a template and edit every section yourself.</p>
        <p className="mt-3 text-sm font-medium text-brand">Start building →</p>
      </Link>
      <Link
        to="/websites/new?builder=ai"
        className="rounded-lg border border-line p-5 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
      >
        <AiSparklesIcon className="size-6" variant="glossy" glow aria-hidden />
        <p className="mt-3 font-medium text-ink">AI builder</p>
        <p className="mt-1 text-sm text-ink-body">Describe your business and get a ready-to-edit first draft.</p>
        <p className="mt-3 text-sm font-medium text-brand">Describe it →</p>
      </Link>
      <Link
        to="/websites/new?builder=import"
        className="rounded-lg border border-line p-5 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
      >
        <FileCode2 className="size-5 text-brand" aria-hidden />
        <p className="mt-3 font-medium text-ink">Import HTML</p>
        <p className="mt-1 text-sm text-ink-body">
          Upload marked HTML; we save each block as a component that matches your look.
        </p>
        <p className="mt-3 text-sm font-medium text-brand">Upload →</p>
      </Link>
    </div>
  );
}
