import { useEffect, useState } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { ArrowLeft, SquarePen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  adminHostingApi,
  type HostingCoupon,
  type HostingCouponRedemption,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import CouponFormModal from "../../components/hosting/CouponFormModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";

const IST = "Asia/Kolkata";

function formatDiscount(coupon: HostingCoupon): string {
  if (coupon.discountType === "PERCENT") return `${coupon.discountValue}% off`;
  return `${formatPaise(coupon.discountValue)} off`;
}

function formatExpiryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: IST });
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function CouponDetailPage() {
  const { couponId = "" } = useParams();
  const [coupon, setCoupon] = useState<HostingCoupon | null>(null);
  const [redemptions, setRedemptions] = useState<HostingCouponRedemption[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "danger"; message: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([adminHostingApi.coupons(), adminHostingApi.couponRedemptions(couponId)])
      .then(([coupons, rows]) => {
        if (cancelled) return;
        const found = coupons.find((row) => row.id === couponId) ?? null;
        if (!found) {
          setError("Coupon not found.");
          setCoupon(null);
          setRedemptions(null);
          return;
        }
        setCoupon(found);
        setRedemptions(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [couponId]);

  async function toggleActive() {
    if (!coupon) return;
    setFeedback(null);
    try {
      const updated = await adminHostingApi.updateCoupon(coupon.id, { active: !coupon.active });
      setCoupon(updated);
      setFeedback({
        status: "success",
        message: updated.active ? "Coupon activated." : "Coupon deactivated.",
      });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center px-6 py-8">
        <Spinner aria-label="Loading coupon usage" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <Link to="/admin/coupons" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
          <ArrowLeft className="size-4" aria-hidden />
          Back to coupons
        </Link>
        <div className="mt-6">
          <FormAlert status="danger">{error ?? "Coupon not found."}</FormAlert>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8">
      <Link to="/admin/coupons" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Back to coupons
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={coupon.code}
          description={`${formatDiscount(coupon)} · ${coupon.usedCount}${
            coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""
          } uses · Expires ${coupon.expiresAt ? formatExpiryDate(coupon.expiresAt) : "never"}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {coupon.active ? (
            <Chip color="success" size="sm">
              Active
            </Chip>
          ) : (
            <Chip size="sm">Off</Chip>
          )}
          <Button size="sm" variant="outline" onPress={() => setEditOpen(true)}>
            <SquarePen className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onPress={() => void toggleActive()}>
            {coupon.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="mt-4">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Usage</h2>
          <p className="text-xs text-ink-muted">
            {redemptions?.length ?? 0}{" "}
            {(redemptions?.length ?? 0) === 1 ? "redemption" : "redemptions"}
          </p>
        </div>

        {!redemptions || redemptions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No usage yet</p>
            <p className="mt-1 text-sm text-ink-muted">No one has applied this coupon at checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Who</th>
                  <th className="px-4 py-2.5 font-medium">Website</th>
                  <th className="px-4 py-2.5 text-right font-medium">List</th>
                  <th className="px-4 py-2.5 text-right font-medium">Discount</th>
                  <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {redemptions.map((row) => (
                  <tr key={row.id} className="hover:bg-canvas/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-body">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-2.5 text-ink">{row.client.businessName}</td>
                    <td className="px-4 py-2.5 text-ink-body">
                      {row.user ? [row.user.fullName, row.user.email].filter(Boolean).join(" · ") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-body">
                      {row.website ? `${row.website.name} (${row.website.subdomain})` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-ink-body">{formatPaise(row.listAmountPaise)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">−{formatPaise(row.discountPaise)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink">
                      {formatPaise(row.finalAmountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CouponFormModal
        isOpen={editOpen}
        mode="edit"
        coupon={coupon}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setCoupon(updated);
          setFeedback({ status: "success", message: `Coupon ${updated.code} updated.` });
        }}
      />
    </div>
  );
}
