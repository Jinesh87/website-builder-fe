import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Handshake,
  Landmark,
  Printer,
  RotateCcw,
  Sliders,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  adminPartnerApi,
  type PartnerCommissionPolicy,
  type PartnerDetail,
  type PartnerPayoutRequest,
  type PartnerProgramConfig,
  type PartnerStatus,
  type PayoutMethod,
} from "../../api/partner.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import { announcePartnersChanged } from "../../hooks/use-pending-partner-count.ts";

export function formatPartnerReference(partner: { partnerNumber?: number; applicationId?: string }): string {
  if (partner.applicationId && partner.applicationId.startsWith("PA-")) {
    return partner.applicationId;
  }
  const num =
    partner.partnerNumber ??
    (partner.applicationId ? parseInt(partner.applicationId.replace(/\D/g, ""), 10) : 0);
  if (num > 0) {
    return `PA-2026-${String(num).padStart(5, "0")}`;
  }
  return partner.applicationId || "PA-2026-00001";
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins}`;
}

function statusPill(status: PartnerStatus) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 border border-rose-500/20">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-700 border border-slate-500/20">
          <span className="size-1.5 rounded-full bg-slate-500" />
          Suspended
        </span>
      );
  }
}

export default function PartnerProfileAdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  type TabKey = "profile" | "payouts" | "clients" | "audit";
  const rawTab = searchParams.get("tab") as TabKey;
  const currentTab: TabKey =
    rawTab === "payouts" || rawTab === "clients" || rawTab === "audit"
      ? rawTab
      : "profile";

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global Config
  const [programConfig, setProgramConfig] = useState<PartnerProgramConfig | null>(null);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Approve modal state
  const [isApprovingOpen, setIsApprovingOpen] = useState(false);
  const [approveCommission, setApproveCommission] = useState(15);
  const [approvePolicy, setApprovePolicy] = useState<PartnerCommissionPolicy>("GLOBAL_DEFAULT");
  const [customCode, setCustomCode] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal state
  const [isRejectingOpen, setIsRejectingOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Suspend modal state
  const [isSuspendingOpen, setIsSuspendingOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Adjust commission modal state
  const [isAdjustCommissionOpen, setIsAdjustCommissionOpen] = useState(false);
  const [newCommissionRate, setNewCommissionRate] = useState(15);
  const [newCommissionPolicy, setNewCommissionPolicy] = useState<PartnerCommissionPolicy>("GLOBAL_DEFAULT");
  const [isCommissionActive, setIsCommissionActive] = useState(true);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Payout actions
  const [settlingRequest, setSettlingRequest] = useState<PartnerPayoutRequest | null>(null);
  const [settleMethod, setSettleMethod] = useState<PayoutMethod>("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isResolvingPayout, setIsResolvingPayout] = useState(false);

  const [rejectingRequest, setRejectingRequest] = useState<PartnerPayoutRequest | null>(null);
  const [payoutRejectReason, setPayoutRejectReason] = useState("");
  const [isRejectingPayout, setIsRejectingPayout] = useState(false);

  const [viewingInvoice, setViewingInvoice] = useState<PartnerPayoutRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    adminPartnerApi
      .get(id)
      .then((res) => {
        if (active) {
          setPartner(res);
          setNewCommissionRate(res.commissionRate);
          setIsCommissionActive(res.isCommissionActive);
          setNewCommissionPolicy(res.commissionPolicy ?? "GLOBAL_DEFAULT");
          setApproveCommission(res.commissionRate || 15);
          setApprovePolicy(res.commissionPolicy ?? "GLOBAL_DEFAULT");
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  useEffect(() => {
    adminPartnerApi.getProgramConfig().then(setProgramConfig).catch(() => undefined);
  }, []);

  function refresh() {
    setRefreshKey((k) => k + 1);
    announcePartnersChanged();
  }

  function handleTabChange(tab: TabKey) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  }

  function handleCopy(text: string, fieldId: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function submitApprove() {
    if (!partner) return;
    setIsApproving(true);
    try {
      await adminPartnerApi.approve(partner.id, {
        commissionRate: approveCommission,
        commissionPolicy: approvePolicy,
        customReferralCode: customCode.trim() || undefined,
        temporaryPassword: approvePassword.trim() || undefined,
      });
      setIsApprovingOpen(false);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsApproving(false);
    }
  }

  async function submitReject() {
    if (!partner || !rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      await adminPartnerApi.reject(partner.id, { reason: rejectReason.trim() });
      setIsRejectingOpen(false);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  }

  async function submitSuspend() {
    if (!partner || !suspendReason.trim()) return;
    setIsSuspending(true);
    try {
      await adminPartnerApi.suspend(partner.id, { reason: suspendReason.trim() });
      setIsSuspendingOpen(false);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsSuspending(false);
    }
  }

  async function handleReactivate() {
    if (!partner) return;
    if (!confirm(`Reactivate ${partner.companyName}?`)) return;
    try {
      await adminPartnerApi.reactivate(partner.id);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  async function submitUpdateCommission() {
    if (!partner) return;
    setIsUpdatingCommission(true);
    try {
      await adminPartnerApi.updateCommission(partner.id, {
        commissionRate: newCommissionRate,
        commissionPolicy: newCommissionPolicy,
        isCommissionActive,
      });
      setIsAdjustCommissionOpen(false);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsUpdatingCommission(false);
    }
  }

  async function submitSettlePayout() {
    if (!settlingRequest) return;
    if (!transactionRef.trim()) {
      alert("Please enter a Transaction / UTR reference number");
      return;
    }
    setIsResolvingPayout(true);
    try {
      await adminPartnerApi.resolvePayoutRequest(settlingRequest.id, {
        status: "APPROVED",
        payoutMethod: settleMethod,
        transactionReference: transactionRef.trim(),
        invoiceNumber: invoiceNo.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      });
      setSettlingRequest(null);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsResolvingPayout(false);
    }
  }

  async function submitRejectPayout() {
    if (!rejectingRequest || !payoutRejectReason.trim()) return;
    setIsRejectingPayout(true);
    try {
      await adminPartnerApi.resolvePayoutRequest(rejectingRequest.id, {
        status: "REJECTED",
        rejectionReason: payoutRejectReason.trim(),
      });
      setRejectingRequest(null);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsRejectingPayout(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-8 sm:px-8 space-y-6">
        <div className="py-24 text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-xs text-ink-muted mt-3">Loading partner profile...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="px-6 py-8 sm:px-8 space-y-6">
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <div className="size-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-ink">{error || "Partner not found"}</h2>
          <button
            type="button"
            onClick={() => navigate("/admin/partners")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-line text-xs font-semibold text-ink hover:bg-canvas cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Back to Partners
          </button>
        </div>
      </div>
    );
  }

  const refId = formatPartnerReference(partner);
  const stats = partner.stats ?? {
    totalReferrals: partner.totalReferrals,
    convertedReferrals: partner.convertedReferrals,
    totalEarnedPaise: partner.totalCommissionPaise,
    approvedCommissionPaise: partner.totalCommissionPaise,
    paidCommissionPaise: 0,
    pendingPayoutRequestsPaise: 0,
    availableForWithdrawalPaise: partner.totalCommissionPaise,
  };

  return (
    <div className="px-6 py-8 sm:px-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/partners"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline mb-2 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Partners List</span>
          </Link>
          <PageHeader
            title="Partner profile"
            description="Manage partner account, banking details, manual payout disbursements, and referred conversions."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {partner.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => setIsApprovingOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Check className="size-3.5" /> Approve Partner
              </button>
              <button
                type="button"
                onClick={() => setIsRejectingOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-rose-50 text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {partner.status === "APPROVED" && (
            <>
              <button
                type="button"
                onClick={() => setIsAdjustCommissionOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Sliders className="size-3.5 text-brand" /> Adjust Commission
              </button>
              <button
                type="button"
                onClick={() => setIsSuspendingOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink-muted hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Ban className="size-3.5" /> Suspend
              </button>
            </>
          )}

          {partner.status === "SUSPENDED" && (
            <>
              <button
                type="button"
                onClick={handleReactivate}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <RotateCcw className="size-3.5" /> Reactivate Partner
              </button>
              <button
                type="button"
                onClick={() => setIsAdjustCommissionOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Sliders className="size-3.5 text-brand" /> Adjust Commission
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="p-6 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-ink tracking-tight">{partner.companyName}</h1>
              {statusPill(partner.status)}
            </div>
            <p className="text-xs text-ink-muted flex flex-wrap items-center gap-3 font-mono">
              <span>{refId}</span>
              <span>•</span>
              <span>Joined {formatDate(partner.createdAt)}</span>
              {partner.referralCode && (
                <>
                  <span>•</span>
                  <span className="text-brand font-bold">Code: {partner.referralCode}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-xs font-medium text-ink transition-colors"
              >
                <span>Website</span>
                <ExternalLink className="size-3 text-ink-muted" />
              </a>
            )}
            <span className="px-3 py-1.5 rounded-lg bg-brand-soft text-brand border border-brand/20 text-xs font-bold font-mono">
              {partner.commissionRate}% Commission
            </span>
          </div>
        </div>

        {/* 4 Financial Balances Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-line">
          <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
            <span className="text-[11px] text-ink-muted font-medium block">Available to Withdraw</span>
            <div className="text-2xl font-bold text-emerald-600">
              ₹{(stats.availableForWithdrawalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-ink-muted">Ready for partner payout</p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
            <span className="text-[11px] text-ink-muted font-medium block">Total Commission Earned</span>
            <div className="text-2xl font-bold text-ink">
              ₹{(stats.totalEarnedPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-ink-muted">From {stats.convertedReferrals} paying customers</p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
            <span className="text-[11px] text-ink-muted font-medium block">Total Paid Out</span>
            <div className="text-2xl font-bold text-ink">
              ₹{(stats.paidCommissionPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-ink-muted">Disbursed via Bank / UPI</p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
            <span className="text-[11px] text-ink-muted font-medium block">Pending Requests</span>
            <div className="text-2xl font-bold text-amber-600">
              ₹{(stats.pendingPayoutRequestsPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-ink-muted">Awaiting admin review</p>
          </div>
        </div>
      </div>

      {/* Profile Page Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-line pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange("profile")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === "profile"
              ? "bg-brand text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Building2 className="size-4" /> Profile &amp; Bank Details
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("payouts")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === "payouts"
              ? "bg-brand text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Wallet className="size-4" /> Payout Requests &amp; Receipts
          <span
            className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
              currentTab === "payouts" ? "bg-white text-brand" : "bg-canvas text-ink-muted"
            }`}
          >
            {partner.payoutRequests?.length ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("clients")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === "clients"
              ? "bg-brand text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Users className="size-4" /> Referred Clients &amp; Conversions
          <span
            className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
              currentTab === "clients" ? "bg-white text-brand" : "bg-canvas text-ink-muted"
            }`}
          >
            {partner.referrals?.length ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("audit")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === "audit"
              ? "bg-brand text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <FileText className="size-4" /> Activity &amp; Audit Log
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PROFILE & BANK DETAILS                            */}
      {/* ======================================================== */}
      {currentTab === "profile" && (
        <div className="space-y-6">
          {/* Rejection / Suspension Notice */}
          {partner.status === "REJECTED" && partner.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
              <div className="font-semibold uppercase tracking-wider text-[11px] text-rose-700">
                Application Rejection Reason
              </div>
              <p className="leading-relaxed">{partner.rejectionReason}</p>
            </div>
          )}
          {partner.status === "SUSPENDED" && partner.suspensionReason && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 space-y-1 text-xs">
              <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-700">
                Account Suspension Reason
              </div>
              <p className="leading-relaxed">{partner.suspensionReason}</p>
            </div>
          )}

          {/* Bank & UPI Payout Details Card */}
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                  <Landmark className="size-5 text-blue-700" />
                  Bank &amp; UPI Payout Details (For Manual Transfers)
                </h3>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  Use these details to disburse commission payments via Netbanking, NEFT, IMPS or UPI.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md self-start sm:self-auto">
                Click copy icon to copy directly into banking app
              </span>
            </div>

            {partner.bankDetails && (partner.bankDetails.bankAccountNumber || partner.bankDetails.upiId) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {/* Account Holder */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-1">
                  <span className="text-[11px] text-ink-muted font-medium block">Account Holder Name</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink text-sm truncate">{partner.bankDetails.accountHolderName || "—"}</strong>
                    {partner.bankDetails.accountHolderName && (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.bankDetails?.accountHolderName || "", "holder")}
                        className="p-1 rounded text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Copy Account Holder Name"
                      >
                        {copiedField === "holder" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bank A/C Number */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-1">
                  <span className="text-[11px] text-ink-muted font-medium block">Bank Account Number</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink font-mono text-sm tracking-wide truncate">
                      {partner.bankDetails.bankAccountNumber || "—"}
                    </strong>
                    {partner.bankDetails.bankAccountNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.bankDetails?.bankAccountNumber || "", "acno")}
                        className="p-1 rounded text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Copy Bank Account Number"
                      >
                        {copiedField === "acno" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-1">
                  <span className="text-[11px] text-ink-muted font-medium block">IFSC Code</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink font-mono text-sm uppercase truncate">
                      {partner.bankDetails.ifscCode || "—"}
                    </strong>
                    {partner.bankDetails.ifscCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.bankDetails?.ifscCode || "", "ifsc")}
                        className="p-1 rounded text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Copy IFSC Code"
                      >
                        {copiedField === "ifsc" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* UPI ID */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-1">
                  <span className="text-[11px] text-ink-muted font-medium block">UPI ID (Instant Transfer)</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-brand font-mono text-sm truncate">
                      {partner.bankDetails.upiId || "—"}
                    </strong>
                    {partner.bankDetails.upiId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.bankDetails?.upiId || "", "upi")}
                        className="p-1 rounded text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedField === "upi" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* PAN Number */}
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-xs space-y-1">
                  <span className="text-[11px] text-ink-muted font-medium block">PAN Number</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-ink font-mono text-sm uppercase truncate">
                      {partner.bankDetails.panNumber || "—"}
                    </strong>
                    {partner.bankDetails.panNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.bankDetails?.panNumber || "", "pan")}
                        className="p-1 rounded text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors cursor-pointer"
                        title="Copy PAN Number"
                      >
                        {copiedField === "pan" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-line text-xs text-ink-muted italic">
                Partner has not configured Bank Account or UPI payout details yet. Payouts cannot be requested until details are added.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5 border-b border-line pb-3">
                <Building2 className="size-4" /> Company &amp; Business Information
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-muted block text-[11px]">Business Type</span>
                  <strong className="text-ink">{partner.businessType}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Year Established</span>
                  <strong className="text-ink">{partner.yearEstablished}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Registration / Tax ID</span>
                  <strong className="text-ink">{partner.registrationNumber || "None"}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Website</span>
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline truncate block"
                    >
                      {partner.website}
                    </a>
                  ) : (
                    <span className="text-ink-muted italic">None</span>
                  )}
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">City &amp; State</span>
                  <strong className="text-ink">
                    {partner.city}, {partner.state}
                  </strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Country</span>
                  <strong className="text-ink">{partner.country}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-ink-muted block text-[11px]">Full Address</span>
                  <strong className="text-ink">{partner.businessAddress}</strong>
                </div>
              </div>
            </div>

            {/* Contact Person Information */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5 border-b border-line pb-3">
                <Users className="size-4" /> Contact Person Details
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-muted block text-[11px]">Contact Name</span>
                  <strong className="text-ink">{partner.contactName}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Designation</span>
                  <strong className="text-ink">{partner.designation}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-ink-muted block text-[11px]">Official Email</span>
                  <strong className="text-ink font-mono">{partner.email}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Phone</span>
                  <strong className="text-ink font-mono">{partner.phone}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px]">Alternative Phone</span>
                  <strong className="text-ink font-mono">{partner.alternatePhone || "None"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Details Card */}
          <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
            <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5 border-b border-line pb-3">
              <Handshake className="size-4" /> Partnership Program Agreement
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-ink-muted block text-[11px]">Partner Type</span>
                <strong className="text-ink">{partner.partnershipType}</strong>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Expected Monthly Referrals</span>
                <strong className="text-ink">{partner.expectedReferrals}</strong>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Referral Code</span>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-brand-soft text-brand border border-brand/20 inline-block mt-0.5">
                  {partner.referralCode || "PENDING"}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Commission Rate</span>
                <span className="text-base font-bold text-ink inline-block mt-0.5">
                  {partner.commissionRate}%
                </span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Commission Policy</span>
                <span className="inline-block mt-1 font-semibold text-ink">
                  {partner.commissionPolicy === "FIRST_PAYMENT"
                    ? "First payment only"
                    : partner.commissionPolicy === "EVERY_RENEWAL"
                    ? "Every renewal (Recurring)"
                    : `Global default (${programConfig?.defaultCommissionPolicy === "EVERY_RENEWAL" ? "Renewal" : "1st pay"})`}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block text-[11px]">Commission Status</span>
                <span className="inline-block mt-1">
                  {partner.isCommissionActive ? (
                    <span className="text-emerald-600 font-semibold">Active &amp; Earning</span>
                  ) : (
                    <span className="text-slate-500 font-semibold">Inactive</span>
                  )}
                </span>
              </div>
              <div className="col-span-1 sm:col-span-3 pt-2 border-t border-line">
                <span className="text-ink-muted block text-[11px] mb-1">Reason for applying:</span>
                <p className="p-3 rounded-xl bg-canvas border border-line text-ink leading-relaxed">
                  {partner.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PAYOUT REQUESTS & RECEIPTS                        */}
      {/* ======================================================== */}
      {currentTab === "payouts" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Withdrawal Requests &amp; Payment Receipts</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Every withdrawal request made by this partner with transaction reference vouchers.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-ink self-start sm:self-auto">
              {partner.payoutRequests?.length ?? 0} Total Requests
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[50rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">REQUEST # &amp; DATE</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">AMOUNT &amp; TDS</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">DESTINATION</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">STATUS</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {!partner.payoutRequests || partner.payoutRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-ink-muted">
                        No payout requests have been submitted by this partner yet.
                      </td>
                    </tr>
                  ) : (
                    partner.payoutRequests.map((pr) => {
                      const gross = pr.amountPaise;
                      const tds = Math.round(gross * 0.05);
                      const net = gross - tds;
                      return (
                        <tr key={pr.id} className="hover:bg-canvas/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-ink font-mono">{pr.formattedId}</div>
                            <div className="text-[11px] text-ink-muted mt-0.5">{formatDateTime(pr.requestedAt)}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-ink text-sm">
                              ₹{(net / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[11px] text-ink-muted mt-0.5">
                              Gross: ₹{(gross / 100).toLocaleString("en-IN")} · TDS (5%): ₹{(tds / 100).toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {pr.payoutMethod === "UPI" ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 mb-0.5">
                                  UPI
                                </span>
                                <div className="font-mono text-ink font-medium">{pr.upiId || "—"}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20 mb-0.5">
                                  Bank Transfer
                                </span>
                                <div className="text-ink font-medium">{pr.accountHolderName}</div>
                                <div className="text-ink-muted font-mono text-[11px]">
                                  A/C: {pr.bankAccountNumber} · IFSC: {pr.ifscCode}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {pr.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                Pending Approval
                              </span>
                            )}
                            {pr.status === "APPROVED" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                  <span className="size-1.5 rounded-full bg-emerald-500" />
                                  Settled / Paid
                                </span>
                                {pr.transactionReference && (
                                  <div className="text-[11px] font-mono text-ink-muted mt-1">
                                    Ref: {pr.transactionReference}
                                  </div>
                                )}
                              </div>
                            )}
                            {pr.status === "REJECTED" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 border border-rose-500/20">
                                  <span className="size-1.5 rounded-full bg-rose-500" />
                                  Rejected
                                </span>
                                {pr.rejectionReason && (
                                  <div className="text-rose-600 text-[11px] mt-1 max-w-xs truncate" title={pr.rejectionReason}>
                                    {pr.rejectionReason}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {pr.status === "PENDING" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSettlingRequest(pr);
                                    setSettleMethod(pr.payoutMethod || "BANK_TRANSFER");
                                    setTransactionRef("");
                                    setInvoiceNo(
                                      pr.invoiceNumber ||
                                        `INV-PO-${new Date().getFullYear()}-${String(pr.requestNumber).padStart(4, "0")}`
                                    );
                                    setAdminNotes("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check className="size-3.5" /> Approve &amp; Settle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingRequest(pr);
                                    setPayoutRejectReason("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {pr.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(pr)}
                                className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                              >
                                <FileText className="size-3.5 text-brand" /> Invoice / Statement
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REFERRED CLIENTS & CONVERSIONS                    */}
      {/* ======================================================== */}
      {currentTab === "clients" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Referred Customers &amp; Paying Clients</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Every customer who registered or converted via this partner&apos;s referral link.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-semibold">
                {stats.convertedReferrals} Converted / Paying
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-ink">
                {stats.totalReferrals} Total Referred
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[50rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">CLIENT</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">STATUS</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">PLAN / PAYMENT</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">COMMISSION GENERATED</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">REGISTERED</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">CONVERTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {!partner.referrals || partner.referrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-ink-muted">
                        No clients have registered using this partner&apos;s referral link yet.
                      </td>
                    </tr>
                  ) : (
                    partner.referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-ink text-sm">{r.customerName}</div>
                          <div className="text-ink-muted font-mono text-[11px] mt-0.5">{r.customerEmail}</div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {r.status === "CONVERTED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Converted (Paid)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-700 border border-slate-500/20">
                              <span className="size-1.5 rounded-full bg-slate-400" />
                              Registered
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {r.paymentAmountPaise ? (
                            <span className="font-bold text-ink text-sm">
                              ₹{(r.paymentAmountPaise / 100).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {r.commissionAmountPaise ? (
                            <span className="font-bold text-emerald-600 text-sm">
                              +₹{(r.commissionAmountPaise / 100).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-ink-muted whitespace-nowrap">
                          {formatDate(r.registeredAt)}
                        </td>
                        <td className="px-5 py-3.5 text-ink-muted whitespace-nowrap">
                          {formatDate(r.convertedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACTIVITY & AUDIT LOG                              */}
      {/* ======================================================== */}
      {currentTab === "audit" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Partner Activity &amp; Audit Trail</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Every event, status change, commission update, and payout recorded for this partner.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[50rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">DATE &amp; TIME</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">EVENT</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted">DETAILS</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">ACTOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs">
                  {!partner.activities || partner.activities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-ink-muted">
                        No activity recorded yet for this partner.
                      </td>
                    </tr>
                  ) : (
                    partner.activities.map((act) => (
                      <tr key={act.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-ink-muted whitespace-nowrap">
                          {formatDateTime(act.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium text-brand">
                          {act.kind}
                        </td>
                        <td className="px-5 py-3.5 text-ink leading-relaxed font-medium">
                          {act.body}
                        </td>
                        <td className="px-5 py-3.5 text-ink-muted whitespace-nowrap">
                          {act.actorName || "System"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* APPROVE PARTNER MODAL                                    */}
      {/* ======================================================== */}
      {isApprovingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Approve Partner Application
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Approve <strong>{partner.companyName}</strong>. This generates a referral code, dashboard access, and sends a welcome email.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Commission Rate (% per transaction)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={approveCommission}
                    onChange={(e) => setApproveCommission(Number(e.target.value))}
                    className="w-28 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-semibold focus:outline-none focus:border-brand shadow-xs"
                  />
                  <span className="text-ink-muted">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Custom Referral Code (Optional)</label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder={`Leave blank to auto-generate (e.g. ${partner.companyName.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase()}20)`}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink font-mono uppercase focus:outline-none focus:border-brand shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">Temporary Password (Optional)</label>
                <input
                  type="text"
                  value={approvePassword}
                  onChange={(e) => setApprovePassword(e.target.value)}
                  placeholder="Leave empty for auto-generated password"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink font-mono focus:outline-none focus:border-brand shadow-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsApprovingOpen(false)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={submitApprove}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isApproving ? "Approving..." : "Confirm & Send Welcome Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REJECT PARTNER MODAL                                     */}
      {/* ======================================================== */}
      {isRejectingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <XCircle className="size-5 text-rose-600" />
                Reject Partner Application
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Reject <strong>{partner.companyName}</strong>. Please provide a reason to be sent to the applicant.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Business details could not be verified."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink placeholder:text-ink-muted focus:outline-none focus:border-rose-500 shadow-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsRejectingOpen(false)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting || !rejectReason.trim()}
                onClick={submitReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUSPEND PARTNER MODAL                                    */}
      {/* ======================================================== */}
      {isSuspendingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-600" />
                Suspend Partner Account
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Suspend <strong>{partner.companyName}</strong>. Suspended partners cannot generate new referrals. Existing commission history remains intact.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">Suspension Reason</label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Multiple self-referrals detected."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink placeholder:text-ink-muted focus:outline-none focus:border-amber-500 shadow-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsSuspendingOpen(false)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSuspending || !suspendReason.trim()}
                onClick={submitSuspend}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isSuspending ? "Suspending..." : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADJUST COMMISSION MODAL                                  */}
      {/* ======================================================== */}
      {isAdjustCommissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <Sliders className="size-5 text-brand" />
                Update Commission Settings
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Adjust commission rate and policy for <strong>{partner.companyName}</strong>.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Commission Rate (% per customer payment)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-28 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-semibold focus:outline-none focus:border-brand shadow-xs"
                  />
                  <span className="text-ink-muted">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Commission Policy (When does this partner earn?)
                </label>
                <div className="space-y-1.5">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      newCommissionPolicy === "GLOBAL_DEFAULT"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="editCommissionPolicy"
                        value="GLOBAL_DEFAULT"
                        checked={newCommissionPolicy === "GLOBAL_DEFAULT"}
                        onChange={() => setNewCommissionPolicy("GLOBAL_DEFAULT")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          newCommissionPolicy === "GLOBAL_DEFAULT"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {newCommissionPolicy === "GLOBAL_DEFAULT" && (
                          <span className="size-2 rounded-full bg-brand" />
                        )}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-ink text-xs">Use Global Default</div>
                      <div className="text-[11px] text-ink-muted">
                        Inherits platform rule ({programConfig?.defaultCommissionPolicy === "EVERY_RENEWAL" ? "Every renewal" : "First payment only"}).
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      newCommissionPolicy === "FIRST_PAYMENT"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="editCommissionPolicy"
                        value="FIRST_PAYMENT"
                        checked={newCommissionPolicy === "FIRST_PAYMENT"}
                        onChange={() => setNewCommissionPolicy("FIRST_PAYMENT")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          newCommissionPolicy === "FIRST_PAYMENT"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {newCommissionPolicy === "FIRST_PAYMENT" && (
                          <span className="size-2 rounded-full bg-brand" />
                        )}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-ink text-xs">First Payment Only (One-Time)</div>
                      <div className="text-[11px] text-ink-muted">
                        Earns commission on customer&apos;s initial payment only.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      newCommissionPolicy === "EVERY_RENEWAL"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="editCommissionPolicy"
                        value="EVERY_RENEWAL"
                        checked={newCommissionPolicy === "EVERY_RENEWAL"}
                        onChange={() => setNewCommissionPolicy("EVERY_RENEWAL")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          newCommissionPolicy === "EVERY_RENEWAL"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {newCommissionPolicy === "EVERY_RENEWAL" && (
                          <span className="size-2 rounded-full bg-brand" />
                        )}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-ink text-xs">Every Subscription Renewal (Recurring)</div>
                      <div className="text-[11px] text-ink-muted">
                        Earns on initial payment and every recurring subscription renewal.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isCommissionActive"
                  checked={isCommissionActive}
                  onChange={(e) => setIsCommissionActive(e.target.checked)}
                  className="size-4 rounded text-brand border-slate-300 bg-white accent-brand focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isCommissionActive" className="text-ink font-medium cursor-pointer">
                  Commission Eligibility Active (can earn commission on payments)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setIsAdjustCommissionOpen(false)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingCommission}
                onClick={submitUpdateCommission}
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isUpdatingCommission ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SETTLE / APPROVE PAYOUT MODAL                            */}
      {/* ======================================================== */}
      {settlingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  Approve &amp; Settle Payout
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Confirm manual disbursement for <strong>{partner.companyName}</strong> ({settlingRequest.formattedId}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettlingRequest(null)}
                className="size-8 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Amount Summary */}
            <div className="p-4 rounded-xl bg-canvas border border-line space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Gross Requested Amount:</span>
                <span className="font-semibold text-ink">
                  ₹{(settlingRequest.amountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-ink-muted">
                <span>TDS Deduction (5% under Sec 194H):</span>
                <span>
                  - ₹{(Math.round(settlingRequest.amountPaise * 0.05) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-line text-sm font-bold">
                <span className="text-ink">Net Payable to Partner:</span>
                <span className="text-emerald-600">
                  ₹{((settlingRequest.amountPaise - Math.round(settlingRequest.amountPaise * 0.05)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Destination Info */}
            <div className="p-3 rounded-lg bg-surface border border-line text-xs space-y-1">
              <span className="font-semibold text-ink-muted uppercase tracking-wider text-[11px] block">
                Partner Payout Destination
              </span>
              {settlingRequest.payoutMethod === "UPI" ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">UPI ID:</span>
                  <span className="font-mono text-brand font-bold">{settlingRequest.upiId || "—"}</span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div><strong className="text-ink">{settlingRequest.accountHolderName}</strong></div>
                  <div className="text-ink-muted font-mono">
                    A/C: {settlingRequest.bankAccountNumber} · IFSC: {settlingRequest.ifscCode}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1.5">Payment Method Used</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMethod("BANK_TRANSFER")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      settleMethod === "BANK_TRANSFER"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line bg-surface text-ink-muted hover:text-ink"
                    }`}
                  >
                    <Landmark className="size-4" /> Bank Transfer (NEFT/IMPS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMethod("UPI")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      settleMethod === "UPI"
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line bg-surface text-ink-muted hover:text-ink"
                    }`}
                  >
                    <CreditCard className="size-4" /> UPI Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">
                  Transaction / UTR Reference ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UTR1234567890 or IMPS98765432"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Invoice / Receipt Number</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-PO-2026-0001"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Internal Notes / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional internal remarks regarding this settlement..."
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setSettlingRequest(null)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolvingPayout || !transactionRef.trim()}
                onClick={submitSettlePayout}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isResolvingPayout ? "Marking Settled..." : "Confirm & Mark Settled"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REJECT PAYOUT MODAL                                      */}
      {/* ======================================================== */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <XCircle className="size-5 text-rose-600" />
                Reject Payout Request
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Rejecting request <strong>{rejectingRequest.formattedId}</strong> will instantly return the amount of{" "}
                <strong className="text-ink">
                  ₹{(rejectingRequest.amountPaise / 100).toLocaleString("en-IN")}
                </strong>{" "}
                back into {partner.companyName}&apos;s available commission balance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={payoutRejectReason}
                onChange={(e) => setPayoutRejectReason(e.target.value)}
                placeholder="Explain why this payout was rejected..."
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-rose-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejectingPayout || !payoutRejectReason.trim()}
                onClick={submitRejectPayout}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isRejectingPayout ? "Rejecting..." : "Reject & Refund Balance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAYOUT INVOICE / STATEMENT MODAL                         */}
      {/* ======================================================== */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-6 max-h-[90vh] flex flex-col"
            style={{ colorScheme: "light" }}
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                  <FileText className="size-5 text-brand" />
                  Commission Payout Statement
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Official settlement voucher &amp; invoice receipt
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="size-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="size-8 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="p-4 rounded-xl bg-canvas border border-line flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-ink">Bytezora Technologies</div>
                  <div className="text-ink-muted text-xs">Partner Affiliate Network</div>
                  <div className="text-ink-muted text-[11px] mt-1">Official Commission Disbursement Receipt</div>
                </div>
                <div className="sm:text-right">
                  <div className="font-mono text-xs font-bold text-ink">
                    {viewingInvoice.invoiceNumber || `INV-PO-${viewingInvoice.formattedId}`}
                  </div>
                  <div className="text-ink-muted text-[11px] mt-0.5">
                    Settled on: {viewingInvoice.processedAt ? formatDate(viewingInvoice.processedAt) : formatDate(viewingInvoice.requestedAt)}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 mt-1.5">
                    <CheckCircle2 className="size-3" /> Paid &amp; Settled
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <span className="font-semibold text-[11px] text-ink-muted uppercase tracking-wider block">
                    Beneficiary (Partner)
                  </span>
                  <div className="font-bold text-sm text-ink">{partner.companyName}</div>
                  {partner.referralCode && (
                    <div className="text-xs text-ink-muted font-mono">
                      Partner Code: {partner.referralCode}
                    </div>
                  )}
                  <div className="text-xs text-ink-muted">{partner.email}</div>
                  <div className="text-xs text-ink-muted">{partner.phone}</div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <span className="font-semibold text-[11px] text-ink-muted uppercase tracking-wider block">
                    Payment Details
                  </span>
                  <div className="text-xs text-ink">
                    <strong>Method:</strong> {viewingInvoice.payoutMethod === "UPI" ? "UPI Transfer" : "Direct Bank Transfer"}
                  </div>
                  {viewingInvoice.transactionReference && (
                    <div className="text-xs text-ink font-mono">
                      <strong>UTR / Ref:</strong> {viewingInvoice.transactionReference}
                    </div>
                  )}
                  {viewingInvoice.payoutMethod === "UPI" ? (
                    <div className="text-xs text-ink-muted font-mono">UPI ID: {viewingInvoice.upiId}</div>
                  ) : (
                    <div className="text-xs text-ink-muted font-mono">
                      A/C: {viewingInvoice.bankAccountNumber} · IFSC: {viewingInvoice.ifscCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60">
                      <th className="px-4 py-3 text-xs font-medium text-ink-muted">Description</th>
                      <th className="px-4 py-3 text-xs font-medium text-ink-muted text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs">
                    <tr>
                      <td className="px-4 py-3 text-ink">
                        <div className="font-semibold">Affiliate Referral Commission</div>
                        <div className="text-ink-muted text-[11px]">Request Ref: {viewingInvoice.formattedId}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">
                        ₹{(viewingInvoice.amountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-canvas/30 text-ink-muted">
                      <td className="px-4 py-2.5">
                        TDS Deducted under Section 194H (5%)
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        - ₹{(Math.round(viewingInvoice.amountPaise * 0.05) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-emerald-500/5 font-bold text-sm">
                      <td className="px-4 py-3 text-ink">Net Amount Disbursed</td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        ₹{((viewingInvoice.amountPaise - Math.round(viewingInvoice.amountPaise * 0.05)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {viewingInvoice.adminNotes && (
                <div className="p-3 rounded-lg bg-canvas border border-line text-xs">
                  <span className="font-semibold text-ink-muted text-[11px] block uppercase tracking-wider mb-0.5">
                    Settlement Notes
                  </span>
                  <p className="text-ink">{viewingInvoice.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
