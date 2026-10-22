import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AlertTriangle, RotateCw } from "lucide-react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { websitesApi, type SavedSection, type ThemeOption, type WebsiteDetail } from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import type { CreatedState } from "../../pages/websites/CreateWebsitePage.tsx";
import EditorErrorBoundary from "./shell/EditorErrorBoundary.tsx";
import EditorSkeleton from "./shell/EditorSkeleton.tsx";
import GenerationProgress from "./shell/GenerationProgress.tsx";

/** Puck and the editor shell load only when someone opens the editor. */
const EditorApp = lazy(() => import("./EditorApp.tsx"));

type Loaded = { website: WebsiteDetail; themes: ThemeOption[]; savedSections: SavedSection[] };
type LoadState = { status: "loading" } | { status: "error"; message: string; notFound: boolean } | { status: "ready"; data: Loaded };

export default function BuilderRoute() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CLIENT";
  const backTo = role === "SUPER_ADMIN" ? "/admin/websites" : "/websites";
  const justCreated = (location.state as CreatedState | null)?.created === true;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    Promise.all([
      websitesApi.get(id),
      websitesApi.themes().catch((): ThemeOption[] => []),
      websitesApi.savedSections(id).catch((): SavedSection[] => []),
    ])
      .then(([website, themes, savedSections]) => {
        if (cancelled) return;
        if (website.draft.pages.length === 0) {
          setState({ status: "error", message: "This website has no pages to edit.", notFound: false });
          return;
        }
        setState({ status: "ready", data: { website, themes, savedSections } });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const notFound = error instanceof ApiError && (error.status === 404 || error.status === 403);
        setState({
          status: "error",
          message: notFound ? "This website doesn't exist or you don't have access to it." : errorMessage(error),
          notFound,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  if (state.status === "loading") return <EditorSkeleton />;

  const generation = state.status === "ready" ? state.data.website.generation : null;
  if (state.status === "ready" && generation && generation.status !== "SUCCEEDED") {
    return (
      <GenerationProgress
        websiteId={state.data.website.id}
        websiteName={state.data.website.name}
        initial={generation}
        backTo={backTo}
        onReady={reload}
      />
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="ed-root grid min-h-dvh place-items-center bg-ed-app p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <span className="grid size-10 place-items-center rounded-ed-lg bg-ed-danger-soft text-ed-danger">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <h1 className="text-base font-semibold text-ed-text">{state.notFound ? "Website not found" : "Couldn't open the editor"}</h1>
          <p className="text-ed-sm text-ed-muted">{state.message}</p>
          <div className="flex gap-2">
            {!state.notFound && (
              <button
                type="button"
                onClick={reload}
                className="flex h-8 items-center gap-1.5 rounded-ed bg-ed-accent px-3 text-ed-sm font-medium text-white hover:bg-ed-accent-hover"
              >
                <RotateCw className="size-3.5" aria-hidden /> Try again
              </button>
            )}
            <Link to={backTo} className="flex h-8 items-center rounded-ed border border-ed-border px-3 text-ed-sm text-ed-text hover:bg-ed-hover">
              Back to websites
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorErrorBoundary backTo={backTo}>
      <Suspense fallback={<EditorSkeleton />}>
        <EditorApp
          key={state.data.website.id}
          website={state.data.website}
          themes={state.data.themes}
          savedSections={state.data.savedSections}
          role={role}
          backTo={state.data.website.isTemplateStudio ? "/admin/templates" : backTo}
          justCreated={justCreated}
        />
      </Suspense>
    </EditorErrorBoundary>
  );
}
