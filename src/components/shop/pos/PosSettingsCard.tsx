import { useState } from "react";
import { Label, Switch } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Store } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../../../api/auth.ts";
import { errorMessage } from "../../../api/http.ts";
import { websitesApi, type WebsiteDetail } from "../../../api/websites.ts";
import { useAuth } from "../../../auth/auth-context.ts";
import FormAlert from "../../ui/FormAlert.tsx";

/** Shop settings: turns the in-store POS till on or off for this website. */
export default function PosSettingsCard({
  website,
  onChange,
}: {
  website: WebsiteDetail;
  onChange: (website: WebsiteDetail) => void;
}) {
  const { setSessionUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(shopPosEnabled: boolean) {
    setSaving(true);
    setError(null);
    try {
      onChange(await websitesApi.update(website.id, { shopPosEnabled }));
      // The sidebar shows POS links from the session, so refresh it.
      const { user } = await authApi.me();
      setSessionUser(user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold text-ink">Point of sale (POS)</h2>
          <p className="mt-1 text-sm text-ink-body">
            Sell in store from a till screen: take cash, UPI, card or a Razorpay QR, print receipts and email GST
            invoices. In-store sales share stock and order numbers with your online shop.
          </p>
        </div>
        <Switch isSelected={website.shopPosEnabled} onChange={(on) => void toggle(on)} isDisabled={saving}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label className="text-sm text-ink">{website.shopPosEnabled ? "POS on" : "POS off"}</Label>
          </Switch.Content>
        </Switch>
      </div>
      {website.shopPosEnabled && (
        <Link to={`/shop/pos?website=${website.id}`} className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}>
          <Store className="size-4" aria-hidden /> Open till
        </Link>
      )}
      {error && (
        <div className="mt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
    </section>
  );
}
