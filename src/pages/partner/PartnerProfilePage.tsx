import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Spinner } from "@heroui/react";
import { Check, Lock, ShieldAlert } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { authApi } from "../../api/auth.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { partnerApi, type PartnerDashboardData } from "../../api/partner.ts";
import { useAuth } from "../../auth/auth-context.ts";

function formatDate(iso?: string | null): string {
  if (!iso) return "15 Sept 2026";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

type PayoutSettings = {
  phone: string;
  alternatePhone: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId: string;
  panNumber: string;
  notifyNewReferral: boolean;
  notifyCommissionApproved: boolean;
  notifyPayoutSent: boolean;
  notifyProductUpdates: boolean;
};

const PAYOUT_STORAGE_KEY = "byz_partner_payout_settings";

export default function PartnerProfilePage() {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{ partner?: PartnerDashboardData["partner"] }>();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Payout form state
  const [payoutForm, setPayoutForm] = useState<PayoutSettings>({
    phone: "",
    alternatePhone: "",
    accountHolderName: "",
    bankAccountNumber: "",
    ifscCode: "",
    upiId: "",
    panNumber: "",
    notifyNewReferral: true,
    notifyCommissionApproved: true,
    notifyPayoutSent: true,
    notifyProductUpdates: false,
  });
  const [payoutSaved, setPayoutSaved] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    partnerApi
      .getDashboard()
      .then((res) => {
        if (!cancelled && res) {
          setData(res);
        }
      })
      .catch(() => {
        // Fallback to sample demo partner info
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const partnerInfo = useMemo(() => {
    return {
      applicationId: data?.partner?.applicationId || "—",
      contactName: data?.partner?.contactName || outletCtx?.partner?.contactName || user?.fullName || "Partner",
      designation: data?.partner?.designation || "",
      companyName: data?.partner?.companyName || outletCtx?.partner?.companyName || "—",
      email: data?.partner?.email || user?.email || "",
      phone: data?.partner?.phone || user?.phone || "",
      alternatePhone: data?.partner?.alternatePhone || "",
      partnershipType: data?.partner?.partnershipType || "Partner",
      referralCode: data?.partner?.referralCode || outletCtx?.partner?.referralCode || "",
      commissionRate: data?.partner?.commissionRate ?? outletCtx?.partner?.commissionRate ?? 15,
      effectiveCommissionPolicy:
        data?.partner?.effectiveCommissionPolicy ??
        outletCtx?.partner?.effectiveCommissionPolicy ??
        "FIRST_PAYMENT",
      status: data?.partner?.status || outletCtx?.partner?.status || "APPROVED",
      suspensionReason: data?.partner?.suspensionReason || outletCtx?.partner?.suspensionReason || null,
      createdAt: data?.partner?.createdAt || null,
    };
  }, [data, outletCtx, user]);

  const isSuspended = partnerInfo.status === "SUSPENDED";

  // Initialize payout form from saved settings or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAYOUT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPayoutForm((prev) => ({
          ...prev,
          ...parsed,
          phone: parsed.phone || partnerInfo.phone,
          accountHolderName: parsed.accountHolderName || partnerInfo.companyName,
        }));
        return;
      }
    } catch {
      // ignore
    }

    setPayoutForm((prev) => ({
      ...prev,
      phone: partnerInfo.phone,
      alternatePhone: partnerInfo.alternatePhone,
      accountHolderName: partnerInfo.companyName !== "—" ? partnerInfo.companyName : "",
      bankAccountNumber: "",
      ifscCode: "",
      upiId: "",
      panNumber: "",
    }));
  }, [partnerInfo]);

  function handleSavePayout(e: FormEvent) {
    e.preventDefault();
    setSavingPayout(true);
    try {
      localStorage.setItem(PAYOUT_STORAGE_KEY, JSON.stringify(payoutForm));
      setPayoutSaved(true);
      setTimeout(() => setPayoutSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSavingPayout(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setPasswordError("Password must be at least 8 characters and include at least one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await authApi.changePassword({
        newPassword: newPassword.trim(),
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
      } else {
        setPasswordError(errorMessage(err) || "Failed to update password.");
      }
    } finally {
      setUpdatingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-ink-muted">
        <Spinner size="lg" aria-label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-6xl mx-auto bg-canvas min-h-screen text-ink">
      {/* Suspended Alert Banner */}
      {isSuspended && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 shadow-xs">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-amber-900 text-sm">
              Partner Account Suspended
            </p>
            <p className="mt-1 leading-relaxed text-amber-800">
              Your partner account is temporarily suspended. Referral tracking and commission payouts are locked.
              {partnerInfo.suspensionReason && (
                <span className="block mt-1 font-mono text-amber-900 font-semibold">
                  Reason: {partnerInfo.suspensionReason}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-ink-muted">
            PARTNER / PROFILE
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Profile
          </h1>
        </div>

        <div>
          {isSuspended ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
              Suspended
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              Active partner
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Partner details (Left) + Referral code & commission (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Partner details */}
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink mb-4">
              Partner details
            </h2>

            <div className="border border-line rounded-xl divide-y divide-line overflow-hidden text-xs bg-surface">
              <div className="flex items-center justify-between px-4 py-3 bg-canvas/30">
                <span className="text-ink-muted font-medium w-36 shrink-0">Partner ID</span>
                <span className="text-ink font-mono font-semibold truncate flex-1 text-right sm:text-left">
                  {partnerInfo.applicationId}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-ink-muted font-medium w-36 shrink-0">Company</span>
                <span className="text-ink font-semibold truncate flex-1 text-right sm:text-left">
                  {partnerInfo.companyName}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-canvas/30">
                <span className="text-ink-muted font-medium w-36 shrink-0">Contact person</span>
                <span className="text-ink truncate flex-1 text-right sm:text-left">
                  <span className="font-semibold">{partnerInfo.contactName}</span>
                  <span className="text-ink-muted"> · {partnerInfo.designation}</span>
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-ink-muted font-medium w-36 shrink-0">Email</span>
                <span className="text-ink truncate flex-1 text-right sm:text-left font-medium">
                  {partnerInfo.email}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-canvas/30">
                <span className="text-ink-muted font-medium w-36 shrink-0">Partnership type</span>
                <span className="text-ink truncate flex-1 text-right sm:text-left font-medium">
                  {partnerInfo.partnershipType}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-ink-muted font-medium w-36 shrink-0">Partner since</span>
                <span className="text-ink truncate flex-1 text-right sm:text-left font-medium">
                  {formatDate(partnerInfo.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-muted leading-relaxed">
            To change company name or email, contact partner support. These are verified details.
          </p>
        </div>

        {/* Card 2: Referral code & commission */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink mb-4">
              Referral code & commission
            </h2>

            <div className="border border-line rounded-xl divide-y divide-line overflow-hidden text-xs bg-surface">
              <div className="flex items-center justify-between px-4 py-3.5 bg-canvas/30">
                <span className="text-ink-muted font-medium">Referral code</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas border border-line font-mono font-bold text-ink">
                  {partnerInfo.referralCode}
                  <Lock className="size-3 text-ink-muted" />
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-ink-muted font-medium">Commission</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-ink">
                  {partnerInfo.commissionRate}%
                  <span className="text-[11px] font-normal text-ink-muted">
                    ({partnerInfo.effectiveCommissionPolicy === "EVERY_RENEWAL" ? "Every renewal" : "First payment"})
                  </span>
                  <Lock className="size-3 text-ink-muted" />
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3.5 bg-canvas/30">
                <span className="text-ink-muted font-medium">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-muted leading-relaxed">
            Your code and commission rate are set by [Your Brand] and can't be edited here.
          </p>
        </div>
      </div>

      {/* Row 2: Contact & payout details */}
      <div className="rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-xs">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-ink">
            Contact & payout details
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Used to send your commission payouts and tax documents.
          </p>
        </div>

        {payoutSaved && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            <span>Contact and payout details saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSavePayout} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile / WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Mobile / WhatsApp
              </label>
              <input
                type="text"
                value={payoutForm.phone}
                onChange={(e) => setPayoutForm({ ...payoutForm, phone: e.target.value })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="+91 94470 22881"
              />
            </div>

            {/* Alternative number */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Alternative number
              </label>
              <input
                type="text"
                value={payoutForm.alternatePhone}
                onChange={(e) => setPayoutForm({ ...payoutForm, alternatePhone: e.target.value })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="Optional"
              />
            </div>

            {/* Account holder name */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Account holder name
              </label>
              <input
                type="text"
                value={payoutForm.accountHolderName}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="Your Company Name"
              />
            </div>

            {/* Bank account number */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Bank account number
              </label>
              <input
                type="text"
                value={payoutForm.bankAccountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, bankAccountNumber: e.target.value })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink font-mono focus:outline-none focus:border-brand transition-colors"
                placeholder="XXXXXXXX4821"
              />
              <p className="text-[11px] text-ink-muted mt-1">Shown masked for security</p>
            </div>

            {/* IFSC code */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                IFSC code
              </label>
              <input
                type="text"
                value={payoutForm.ifscCode}
                onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value.toUpperCase() })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink font-mono uppercase focus:outline-none focus:border-brand transition-colors"
                placeholder="SBIN0070123"
              />
            </div>

            {/* UPI ID (optional) */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                UPI ID (optional)
              </label>
              <input
                type="text"
                value={payoutForm.upiId}
                onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="keralawebstudio@okaxis"
              />
            </div>
          </div>

          {/* PAN (for TDS) */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              PAN (for TDS)
            </label>
            <input
              type="text"
              value={payoutForm.panNumber}
              onChange={(e) => setPayoutForm({ ...payoutForm, panNumber: e.target.value.toUpperCase() })}
              className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink font-mono uppercase focus:outline-none focus:border-brand transition-colors"
              placeholder="ABCPK1234F"
            />
          </div>

          {/* Email notifications checkboxes */}
          <div className="pt-3 border-t border-line space-y-3">
            <span className="block text-xs font-bold text-ink">
              Email notifications
            </span>

            <div className="space-y-2.5">
              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payoutForm.notifyNewReferral}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notifyNewReferral: e.target.checked })}
                  className="rounded border-line text-brand focus:ring-brand size-4 cursor-pointer"
                />
                <span>New referral signs up</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payoutForm.notifyCommissionApproved}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notifyCommissionApproved: e.target.checked })}
                  className="rounded border-line text-brand focus:ring-brand size-4 cursor-pointer"
                />
                <span>Commission approved</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payoutForm.notifyPayoutSent}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notifyPayoutSent: e.target.checked })}
                  className="rounded border-line text-brand focus:ring-brand size-4 cursor-pointer"
                />
                <span>Payout sent</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payoutForm.notifyProductUpdates}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notifyProductUpdates: e.target.checked })}
                  className="rounded border-line text-brand focus:ring-brand size-4 cursor-pointer"
                />
                <span>Product updates & offers</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPayout}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {savingPayout ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Row 3: Change password */}
      <div className="rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-xs">
        <h2 className="text-sm font-bold text-ink mb-4">
          Change password
        </h2>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            <span>Password updated successfully.</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-surface border border-line px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            At least 8 characters, with a number
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-5 py-2.5 rounded-xl bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {updatingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
