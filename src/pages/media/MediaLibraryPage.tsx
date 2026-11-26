import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { mediaApi } from "../../api/media.ts";
import { useAuth } from "../../auth/auth-context.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import MediaClientGrid from "../../components/media/MediaClientGrid.tsx";
import MediaLibrary from "../../components/media/MediaLibrary.tsx";

/** Name of the client whose media is open; looked up when the page is opened straight from a link. */
function useClientName(clientId: string, known: { id: string; name: string } | null): string | null {
  const [fetched, setFetched] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    if (!clientId || known?.id === clientId) return;
    let cancelled = false;
    mediaApi
      .clients({ id: clientId })
      .then((list) => !cancelled && setFetched({ id: clientId, name: list.clients[0]?.name ?? "Client" }))
      .catch(() => !cancelled && setFetched({ id: clientId, name: "Client" }));
    return () => {
      cancelled = true;
    };
  }, [clientId, known]);
  if (known?.id === clientId) return known.name;
  return fetched?.id === clientId ? fetched.name : null;
}

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = isAdmin ? (searchParams.get("clientId") ?? "") : "";
  const [opened, setOpened] = useState<{ id: string; name: string } | null>(null);
  const clientName = useClientName(clientId, opened);

  if (!isAdmin) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <PageHeader title="Media library" description="Images, videos and documents for your websites. Add them to any page from the editor." />
        <div className="mt-6">
          <MediaLibrary />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title={clientId ? `Media · ${clientName ?? "…"}` : "Media"}
        description={
          clientId
            ? "This client's images, videos and documents. Upload or organise files for them here."
            : "Choose a client to see, upload or organise their files."
        }
        actions={
          clientId && (
            <Button variant="outline" onPress={() => setSearchParams({})}>
              <ChevronLeft className="size-4" aria-hidden /> All clients
            </Button>
          )
        }
      />
      <div className="mt-6">
        {clientId ? (
          <MediaLibrary key={clientId} clientId={clientId} requiresClient />
        ) : (
          <MediaClientGrid
            onOpen={(client) => {
              setOpened({ id: client.id, name: client.name });
              setSearchParams({ clientId: client.id });
            }}
          />
        )}
      </div>
    </div>
  );
}
