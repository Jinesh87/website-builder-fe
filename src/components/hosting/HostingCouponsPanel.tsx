import { useEffect, useState } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Plus, SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminHostingApi,
  type HostingCoupon,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";
import CouponFormModal from "./CouponFormModal.tsx";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

const IST = "Asia/Kolkata";

function formatDiscount(coupon: HostingCoupon): string {
  if (coupon.discountType === "PERCENT") return `${coupon.discountValue}% off`;
  return `${formatPaise(coupon.discountValue)} off`;
}

function formatExpiryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: IST });
}

export default function HostingCouponsPanel() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<HostingCoupon[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listFeedback, setListFeedback] = useState<Feedback>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<HostingCoupon | null>(null);

  function reload() {
    return adminHostingApi
      .coupons()
      .then(setCoupons)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }

  useEffect(() => {
    void reload();
  }, []);

  async function toggleActive(coupon: HostingCoupon) {
    setListFeedback(null);
    try {
      const updated = await adminHostingApi.updateCoupon(coupon.id, { active: !coupon.active });
      setCoupons((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
    } catch (err) {
      setListFeedback({ status: "danger", message: errorMessage(err) });
    }
  }

  if (loadError) return <FormAlert status="danger">{loadError}</FormAlert>;
  if (!coupons) {
    return (
      <div className="grid place-items-center py-12">
        <Spinner aria-label="Loading coupons" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"}
        </p>
        <Button onPress={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Create coupon
        </Button>
      </div>

      {listFeedback && <FormAlert status={listFeedback.status}>{listFeedback.message}</FormAlert>}

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        {coupons.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-base font-semibold text-ink">No coupons yet</p>
            <p className="mt-1 text-sm text-ink-muted">Create a code clients can apply at hosting checkout.</p>
            <Button className="mt-4" onPress={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Create coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                  <th className="px-4 py-2.5 font-medium">Uses</th>
                  <th className="px-4 py-2.5 font-medium">Expires</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="cursor-pointer hover:bg-canvas/40"
                    onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-ink">{coupon.code}</td>
                    <td className="px-4 py-2.5 text-ink">{formatDiscount(coupon)}</td>
                    <td className="px-4 py-2.5 text-ink-body">
                      {coupon.usedCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-2.5 text-ink-body">
                      {coupon.expiresAt ? formatExpiryDate(coupon.expiresAt) : "Never"}
                    </td>
                    <td className="px-4 py-2.5">
                      {coupon.active ? (
                        <Chip color="success" size="sm">
                          Active
                        </Chip>
                      ) : (
                        <Chip size="sm">Off</Chip>
                      )}
                    </td>
                    <td className="px-4 py-2.5" onClick={(event) => event.stopPropagation()}>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onPress={() => setEditing(coupon)}>
                          <SquarePen className="size-3.5" aria-hidden />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onPress={() => void toggleActive(coupon)}>
                          {coupon.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CouponFormModal
        isOpen={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={(coupon) => {
          setListFeedback({ status: "success", message: `Coupon ${coupon.code} created.` });
          void reload();
        }}
      />

      <CouponFormModal
        isOpen={Boolean(editing)}
        mode="edit"
        coupon={editing}
        onClose={() => setEditing(null)}
        onSaved={(coupon) => {
          setCoupons((current) => current?.map((row) => (row.id === coupon.id ? coupon : row)) ?? null);
          setListFeedback({ status: "success", message: `Coupon ${coupon.code} updated.` });
        }}
      />
    </div>
  );
}
