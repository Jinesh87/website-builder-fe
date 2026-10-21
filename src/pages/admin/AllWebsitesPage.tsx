import { buttonVariants } from "@heroui/styles";
import { Globe, Plus, Users, type LucideIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ClientsOverviewView from "../../components/admin/websites/ClientsOverviewView.tsx";
import WebsitesListView from "../../components/admin/websites/WebsitesListView.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";

type View = "clients" | "websites";

const VIEWS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "clients", label: "By client", icon: Users },
  { id: "websites", label: "All websites", icon: Globe },
];

export default function AllWebsitesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  // Links filtered to one client (e.g. from AI usage) open the website list.
  const view: View = searchParams.get("view") === "websites" || clientId ? "websites" : "clients";
  const createHref = clientId ? `/websites/new?clientId=${encodeURIComponent(clientId)}` : "/websites/new";

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="All websites"
        description={
          view === "clients"
            ? "Every client with their websites, hosting and payments."
            : "Every website across all clients."
        }
        actions={
          <Link to={createHref} className={buttonVariants()}>
            <Plus className="size-4" aria-hidden /> Create website for a client
          </Link>
        }
      />

      <div role="tablist" aria-label="View" className="mt-6 inline-flex rounded-lg border border-line bg-surface p-0.5">
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSearchParams(id === "clients" ? {} : { view: id })}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                active ? "bg-ink font-medium text-white shadow-xs" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      {view === "clients" ? <ClientsOverviewView /> : <WebsitesListView />}
    </div>
  );
}
