import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Landmark,
  Printer,
  Search,
  Sliders,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  adminPartnerApi,
  type PartnerAuditLogItem,
  type PartnerCommissionPolicy,
  type PartnerListResponse,
  type PartnerPayoutRequest,
  type PartnerProgramConfig,
  type PartnerStatus,
  type PartnerSummary,
  type PayoutRequestsListResponse,
} from "../../api/partner.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { announcePartnersChanged } from "../../hooks/use-pending-partner-count.ts";

type MainTab = "applications" | "payout-requests" | "commission" | "audit-log";
type StatusFilter = PartnerStatus | "ALL";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "SUSPENDED", label: "Suspended" },
];

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

function actionBadge(label: string, variant: "orange" | "slate" | "blue" | "emerald" | "rose") {
  const styles = {
    orange: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    slate: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    blue: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  }[variant];

  const dotStyles = {
    orange: "bg-amber-500",
    slate: "bg-slate-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles}`} />
      {label}
    </span>
  );
}

export default function PartnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Main Tabs: applications | payout-requests | commission | audit-log
  const rawMainTab = searchParams.get("tab")?.toLowerCase();
  const currentMainTab: MainTab =
    rawMainTab === "payout-requests" || rawMainTab === "commission" || rawMainTab === "audit-log"
      ? rawMainTab
      : "applications";

  // Status Filter for Applications tab
  const rawStatus = searchParams.get("status")?.toUpperCase();
  const currentStatusFilter: StatusFilter =
    rawStatus === "PENDING" ||
    rawStatus === "APPROVED" ||
    rawStatus === "REJECTED" ||
    rawStatus === "SUSPENDED"
      ? rawStatus
      : "ALL";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<PartnerListResponse | null>(null);
  const [auditLogsData, setAuditLogsData] = useState<PartnerAuditLogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Payout requests state
  const [payoutRequestsData, setPayoutRequestsData] = useState<PayoutRequestsListResponse | null>(null);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  // Settle modal state
  const [settlingRequest, setSettlingRequest] = useState<PartnerPayoutRequest | null>(null);
  const [settleMethod, setSettleMethod] = useState<"BANK_TRANSFER" | "UPI">("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isResolvingPayout, setIsResolvingPayout] = useState(false);

  // Reject payout modal state
  const [rejectingRequest, setRejectingRequest] = useState<PartnerPayoutRequest | null>(null);
  const [payoutRejectReason, setPayoutRejectReason] = useState("");
  const [isRejectingPayout, setIsRejectingPayout] = useState(false);

  // View invoice modal state
  const [viewingInvoice, setViewingInvoice] = useState<PartnerPayoutRequest | null>(null);

  // Approve modal
  const [approvingPartner, setApprovingPartner] = useState<PartnerSummary | null>(null);
  const [approveCommission, setApproveCommission] = useState(15);
  const [approvePolicy, setApprovePolicy] = useState<PartnerCommissionPolicy>("GLOBAL_DEFAULT");
  const [customCode, setCustomCode] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState<{
    partnerName: string;
    email: string;
    code: string;
    inviteLink?: string;
  } | null>(null);
  const [copiedSuccessLink, setCopiedSuccessLink] = useState(false);

  // Reject modal
  const [rejectingPartner, setRejectingPartner] = useState<PartnerSummary | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Suspend modal
  const [suspendingPartner, setSuspendingPartner] = useState<PartnerSummary | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Adjust Commission modal
  const [editingCommissionPartner, setEditingCommissionPartner] = useState<PartnerSummary | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(15);
  const [newCommissionPolicy, setNewCommissionPolicy] = useState<PartnerCommissionPolicy>("GLOBAL_DEFAULT");
  const [isCommissionActive, setIsCommissionActive] = useState(true);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Global Program Config
  const [programConfig, setProgramConfig] = useState<PartnerProgramConfig | null>(null);

  // Fetch partners list
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    adminPartnerApi
      .list({
        search: debouncedSearch,
        status: currentStatusFilter === "ALL" ? undefined : currentStatusFilter,
        page: 1,
        pageSize: 50,
      })
      .then((res) => {
        if (active) setData(res);
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
  }, [debouncedSearch, currentStatusFilter, refreshKey]);

  // Fetch audit logs
  useEffect(() => {
    let active = true;
    adminPartnerApi
      .listAuditLogs({
        search: debouncedSearch,
        page: 1,
        pageSize: 50,
      })
      .then((res) => {
        if (active && res.items) setAuditLogsData(res.items);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [debouncedSearch, refreshKey]);

  // Fetch global partner program config
  useEffect(() => {
    adminPartnerApi
      .getProgramConfig()
      .then(setProgramConfig)
      .catch(() => undefined);
  }, [refreshKey]);

  // Fetch payout requests list
  useEffect(() => {
    let active = true;
    setLoadingPayouts(true);
    adminPartnerApi
      .listPayoutRequests({
        status: payoutStatusFilter === "ALL" ? undefined : payoutStatusFilter,
        search: debouncedSearch,
        page: 1,
        pageSize: 50,
      })
      .then((res) => {
        if (active) setPayoutRequestsData(res);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadingPayouts(false);
      });

    return () => {
      active = false;
    };
  }, [payoutStatusFilter, debouncedSearch, refreshKey, currentMainTab]);

  function refresh() {
    setRefreshKey((k) => k + 1);
    announcePartnersChanged();
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
    if (!rejectingRequest) return;
    if (!payoutRejectReason.trim()) {
      alert("Please provide a reason for rejecting the payout request");
      return;
    }

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

  function handleMainTabChange(tab: MainTab) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  }

  function handleStatusFilterChange(filter: StatusFilter) {
    const next = new URLSearchParams(searchParams);
    if (filter === "ALL") {
      next.delete("status");
    } else {
      next.set("status", filter);
    }
    setSearchParams(next);
  }

  // Merged partners list
  const displayPartners: PartnerSummary[] = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  // Derived counts for tabs and KPI cards
  const counts = useMemo(() => {
    return {
      ALL: data?.counts?.ALL ?? 0,
      PENDING: data?.counts?.PENDING ?? 0,
      APPROVED: data?.counts?.APPROVED ?? 0,
      REJECTED: data?.counts?.REJECTED ?? 0,
      SUSPENDED: data?.counts?.SUSPENDED ?? 0,
      COMMISSIONS: data?.counts?.COMMISSIONS ?? 0,
      AUDIT_LOGS: data?.counts?.AUDIT_LOGS ?? (auditLogsData?.length ?? 0),
    };
  }, [data, auditLogsData]);

  // Commission partners list
  const commissionPartners = useMemo(() => {
    const base = (data?.items ?? []).filter(
      (p) => p.status === "APPROVED" || p.status === "SUSPENDED" || p.referralCode,
    );
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return base.filter(
        (p) =>
          p.companyName.toLowerCase().includes(q) ||
          (p.referralCode && p.referralCode.toLowerCase().includes(q)),
      );
    }
    return base;
  }, [data, debouncedSearch]);

  // Audit logs list
  const displayAuditLogs: PartnerAuditLogItem[] = useMemo(() => {
    return auditLogsData ?? [];
  }, [auditLogsData]);

  // Handle Approve
  async function submitApprove() {
    if (!approvingPartner) return;
    setIsApproving(true);
    try {
      let inviteLink: string | undefined = undefined;
      let generatedCode = customCode.trim() || approvingPartner.referralCode || "";
      const res = await adminPartnerApi.approve(approvingPartner.id, {
        commissionRate: approveCommission,
        commissionPolicy: approvePolicy,
        customReferralCode: customCode.trim() || undefined,
        temporaryPassword: approvePassword.trim() || undefined,
      });
      inviteLink = res.inviteLink;
      if (res.referralCode) generatedCode = res.referralCode;

      setApprovedSuccess({
        partnerName: approvingPartner.companyName,
        email: approvingPartner.email,
        code: generatedCode,
        inviteLink,
      });

      setApprovingPartner(null);
      setCustomCode("");
      setApprovePassword("");
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsApproving(false);
    }
  }

  // Handle Reject
  async function submitReject() {
    if (!rejectingPartner || !rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      if (!rejectingPartner.id.startsWith("demo-")) {
        await adminPartnerApi.reject(rejectingPartner.id, {
          reason: rejectReason.trim(),
        });
      }
      setRejectingPartner(null);
      setRejectReason("");
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  }

  // Handle Suspend
  async function submitSuspend() {
    if (!suspendingPartner || !suspendReason.trim()) return;
    setIsSuspending(true);
    try {
      if (!suspendingPartner.id.startsWith("demo-")) {
        await adminPartnerApi.suspend(suspendingPartner.id, {
          reason: suspendReason.trim(),
        });
      }
      setSuspendingPartner(null);
      setSuspendReason("");
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsSuspending(false);
    }
  }

  // Handle Update Commission
  async function submitUpdateCommission() {
    if (!editingCommissionPartner) return;
    setIsUpdatingCommission(true);
    try {
      if (!editingCommissionPartner.id.startsWith("demo-")) {
        await adminPartnerApi.updateCommission(editingCommissionPartner.id, {
          commissionRate: newCommissionRate,
          isCommissionActive,
          commissionPolicy: newCommissionPolicy,
        });
      }
      setEditingCommissionPartner(null);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsUpdatingCommission(false);
    }
  }

  const tabClass = (active: boolean) =>
    `-mb-px flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-all ${
      active
        ? "border-primary bg-surface font-semibold text-ink shadow-xs"
        : "border-transparent font-medium text-ink-muted hover:bg-surface/50 hover:text-ink"
    }`;

  return (
    <div className="px-6 py-8 sm:px-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title={
              currentMainTab === "applications"
                ? "Partner applications"
                : currentMainTab === "commission"
                ? "Commission settings"
                : "Audit log"
            }
            description={
              currentMainTab === "applications"
                ? "Review and manage inbound partner registrations and agency applications."
                : currentMainTab === "commission"
                ? "Manage partner commission rates, payout rules, and tracking eligibility."
                : "Complete history of partner reviews, status changes, and rate updates."
            }
          />
        </div>
        <a
          href="/partner"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-canvas transition-colors self-start sm:self-auto"
        >
          <span>View public page</span>
          <ExternalLink className="size-3.5 text-ink-muted" />
        </a>
      </div>

      {/* Main Tabs Navigation */}
      <div role="tablist" aria-label="Partner tabs" className="flex items-center gap-1 overflow-x-auto border-b border-line pb-px">
        <button
          type="button"
          role="tab"
          aria-selected={currentMainTab === "applications"}
          onClick={() => handleMainTabChange("applications")}
          className={tabClass(currentMainTab === "applications")}
        >
          <span>Applications</span>
          <span
            className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
              currentMainTab === "applications" ? "bg-ink text-white" : "bg-canvas text-ink-muted"
            }`}
          >
            {counts.ALL}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentMainTab === "payout-requests"}
          onClick={() => handleMainTabChange("payout-requests")}
          className={tabClass(currentMainTab === "payout-requests")}
        >
          <span>Payout requests</span>
          {(payoutRequestsData?.counts?.PENDING ?? 0) > 0 ? (
            <span className="min-w-5 rounded-full px-1.5 text-center text-xs leading-5 bg-amber-500 text-white font-bold">
              {payoutRequestsData?.counts?.PENDING}
            </span>
          ) : (
            <span
              className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
                currentMainTab === "payout-requests" ? "bg-ink text-white" : "bg-canvas text-ink-muted"
              }`}
            >
              {payoutRequestsData?.counts?.ALL ?? 0}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentMainTab === "commission"}
          onClick={() => handleMainTabChange("commission")}
          className={tabClass(currentMainTab === "commission")}
        >
          <span>Commission</span>
          <span
            className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
              currentMainTab === "commission" ? "bg-ink text-white" : "bg-canvas text-ink-muted"
            }`}
          >
            {counts.COMMISSIONS}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentMainTab === "audit-log"}
          onClick={() => handleMainTabChange("audit-log")}
          className={tabClass(currentMainTab === "audit-log")}
        >
          <span>Audit log</span>
          <span
            className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
              currentMainTab === "audit-log" ? "bg-ink text-white" : "bg-canvas text-ink-muted"
            }`}
          >
            {counts.AUDIT_LOGS}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: APPLICATIONS                                      */}
      {/* ======================================================== */}
      {currentMainTab === "applications" && (
        <div className="space-y-6">
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-amber-500 shadow-xs" />
                <span>Pending</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {counts.PENDING}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
                <span>Approved</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {counts.APPROVED}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-rose-500 shadow-xs" />
                <span>Rejected</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {counts.REJECTED}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-slate-400" />
                <span>Suspended</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {counts.SUSPENDED}
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, contact person or email"
                className="w-full rounded-lg border border-line bg-surface pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none shadow-xs transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-xs self-start sm:self-auto">
              {STATUS_FILTERS.map((f) => {
                const active = currentStatusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => handleStatusFilterChange(f.key)}
                    className={`rounded-md px-3 py-1 text-xs transition-colors cursor-pointer ${
                      active
                        ? "bg-ink font-semibold text-white shadow-xs"
                        : "text-ink-muted hover:text-ink hover:bg-canvas"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[58rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      REFERENCE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      COMPANY
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      CONTACT
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      TYPE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      SUBMITTED
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      APPROVED
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      CODE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      COMMISSION
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm text-ink">
                  {loading && !displayPartners.length ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-ink-muted">
                        <Spinner size="md" className="mx-auto" />
                      </td>
                    </tr>
                  ) : displayPartners.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-ink-muted">
                        No partner applications found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    displayPartners.map((partner) => {
                      const refId = formatPartnerReference(partner);
                      return (
                        <tr
                          key={partner.id}
                          onClick={() => navigate(`/admin/partners/${partner.id}`)}
                          className="hover:bg-canvas/60 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink">
                            {refId}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-ink group-hover:text-brand transition-colors">
                              {partner.companyName}
                            </div>
                            <div className="text-ink-muted text-xs mt-0.5">
                              {partner.city || "Kochi"}, {partner.state || "Kerala"}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-ink font-medium text-xs">
                              {partner.contactName}
                            </div>
                            <div className="text-ink-muted text-xs font-mono mt-0.5">
                              {partner.email}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-ink font-medium text-xs">
                              {partner.partnershipType}
                            </div>
                            <div className="text-ink-muted text-xs mt-0.5">
                              {partner.businessType}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-ink-body text-xs font-medium">
                            {formatDate(partner.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 text-ink-body text-xs">
                            {partner.approvedAt ? formatDate(partner.approvedAt) : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            {partner.referralCode ? (
                              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-brand-soft text-brand border border-brand/20 tracking-wider inline-block">
                                {partner.referralCode}
                              </span>
                            ) : (
                              <span className="text-ink-muted">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-ink text-xs">
                            {partner.status === "APPROVED" || partner.status === "SUSPENDED"
                              ? `${partner.commissionRate}%`
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5">{statusPill(partner.status)}</td>
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
      {/* TAB 2: PAYOUT REQUESTS                                   */}
      {/* ======================================================== */}
      {currentMainTab === "payout-requests" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-amber-500 shadow-xs" />
                <span>Pending Approval</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {payoutRequestsData?.counts?.PENDING ?? 0}
              </div>
              <p className="text-[11px] text-ink-muted">Awaiting manual admin payout</p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
                <span>Settled &amp; Paid</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {payoutRequestsData?.counts?.APPROVED ?? 0}
              </div>
              <p className="text-[11px] text-ink-muted">Disbursed via Bank / UPI</p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <span className="size-2 rounded-full bg-rose-500 shadow-xs" />
                <span>Rejected</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {payoutRequestsData?.counts?.REJECTED ?? 0}
              </div>
              <p className="text-[11px] text-ink-muted">Returned to partner balance</p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-sm text-ink-muted font-medium">
                <Wallet className="size-4 text-brand" />
                <span>Total Requests</span>
              </div>
              <div className="text-3xl font-bold text-ink tracking-tight">
                {payoutRequestsData?.counts?.ALL ?? 0}
              </div>
              <p className="text-[11px] text-ink-muted">All-time withdrawal requests</p>
            </div>
          </div>

          {/* Search Bar & Filter Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partner, email, or code..."
                className="w-full rounded-lg border border-line bg-surface pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none shadow-xs transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-xs self-start sm:self-auto">
              {(
                [
                  { key: "ALL", label: "All" },
                  { key: "PENDING", label: "Pending" },
                  { key: "APPROVED", label: "Settled" },
                  { key: "REJECTED", label: "Rejected" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setPayoutStatusFilter(f.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    payoutStatusFilter === f.key
                      ? "bg-brand text-white shadow-xs"
                      : "text-ink-muted hover:text-ink hover:bg-canvas"
                  }`}
                >
                  {f.label}
                  {f.key !== "ALL" && payoutRequestsData?.counts && (
                    <span className="ml-1.5 opacity-80">
                      ({payoutRequestsData.counts[f.key] ?? 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payout Requests Table */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[58rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      REQUEST &amp; DATE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      PARTNER
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      AMOUNT &amp; TDS
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      DESTINATION
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      STATUS
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm text-ink">
                  {loadingPayouts ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Spinner size="lg" className="mx-auto" />
                      </td>
                    </tr>
                  ) : !payoutRequestsData || payoutRequestsData.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-ink-muted">
                        No payout requests found.
                      </td>
                    </tr>
                  ) : (
                    payoutRequestsData.items.map((req) => {
                      const grossPaise = req.amountPaise;
                      const tdsPaise = Math.round(grossPaise * 0.05);
                      const netPaise = grossPaise - tdsPaise;

                      return (
                        <tr key={req.id} className="hover:bg-canvas/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-ink font-mono text-xs">
                              {req.formattedId}
                            </div>
                            <div className="text-ink-muted text-[11px] mt-0.5">
                              {formatDateTime(req.requestedAt)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Link
                              to={`/admin/partners/${req.partnerId}?tab=payouts`}
                              className="font-semibold text-ink hover:text-brand transition-colors block"
                            >
                              {req.partnerName || "Partner"}
                            </Link>
                            <div className="text-ink-muted text-xs flex items-center gap-2 mt-0.5">
                              {req.partnerReferralCode && (
                                <span className="px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-brand-soft text-brand">
                                  {req.partnerReferralCode}
                                </span>
                              )}
                              <span>{req.partnerEmail || req.partnerContact}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-ink text-sm">
                              ₹{(netPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-ink-muted text-[11px]">
                              Gross: ₹{(grossPaise / 100).toLocaleString("en-IN")} · TDS (5%): ₹{(tdsPaise / 100).toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {req.payoutMethod === "UPI" ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 mb-1">
                                  UPI
                                </span>
                                <div className="font-mono text-ink font-medium">{req.upiId || "—"}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20 mb-1">
                                  Bank Transfer
                                </span>
                                <div className="text-ink font-medium">
                                  {req.accountHolderName}
                                </div>
                                <div className="text-ink-muted font-mono text-[11px]">
                                  A/C: {req.bankAccountNumber || "—"} · IFSC: {req.ifscCode || "—"}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {req.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                Pending Approval
                              </span>
                            )}
                            {req.status === "APPROVED" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                  <span className="size-1.5 rounded-full bg-emerald-500" />
                                  Settled / Paid
                                </span>
                                {req.transactionReference && (
                                  <div className="text-ink-muted font-mono text-[11px] mt-1">
                                    Ref: {req.transactionReference}
                                  </div>
                                )}
                              </div>
                            )}
                            {req.status === "REJECTED" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 border border-rose-500/20">
                                  <span className="size-1.5 rounded-full bg-rose-500" />
                                  Rejected
                                </span>
                                {req.rejectionReason && (
                                  <div className="text-rose-600 text-[11px] mt-1 max-w-xs truncate" title={req.rejectionReason}>
                                    {req.rejectionReason}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {req.status === "PENDING" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSettlingRequest(req);
                                    setSettleMethod(req.payoutMethod || "BANK_TRANSFER");
                                    setTransactionRef("");
                                    setInvoiceNo(
                                      req.invoiceNumber ||
                                        `INV-PO-${new Date().getFullYear()}-${String(req.requestNumber).padStart(4, "0")}`
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
                                    setRejectingRequest(req);
                                    setPayoutRejectReason("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {req.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(req)}
                                className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                              >
                                <FileText className="size-3.5 text-brand" /> Invoice / Receipt
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
      {/* TAB 3: COMMISSION SETTINGS                               */}
      {/* ======================================================== */}
      {currentMainTab === "commission" && (
        <div className="space-y-6">
          {/* Global Commission Policy Notice with Link to Admin Settings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 text-xs text-ink-muted shadow-xs">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-brand shrink-0" />
              <span>
                <strong className="text-ink font-semibold">Global Platform Policy:</strong>{" "}
                {programConfig?.defaultCommissionRate ?? 15}% per transaction •{" "}
                {programConfig?.defaultCommissionPolicy === "EVERY_RENEWAL"
                  ? "Every renewal (Recurring)"
                  : "First payment only (One-Time)"}
              </span>
            </div>
            <Link
              to="/admin/settings?tab=referral"
              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline shrink-0"
            >
              Configure in Admin Settings →
            </Link>
          </div>

          {/* Blue Info Notice Banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-xs text-blue-900 leading-relaxed font-medium">
            Commission is calculated only on successfully paid customer transactions. Partners can't change their rate, code, or payout policy.
          </div>

          {/* Commission Table */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[55rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      PARTNER
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      CODE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      STATUS
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      COMMISSION
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      POLICY
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      ELIGIBLE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      LAST CHANGE
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap text-right">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm text-ink">
                  {commissionPartners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-ink-muted">
                        No partners with commission settings found.
                      </td>
                    </tr>
                  ) : (
                    commissionPartners.map((partner) => {
                      const refId = formatPartnerReference(partner);
                      return (
                        <tr
                          key={partner.id}
                          className="hover:bg-canvas/60 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              to={`/admin/partners/${partner.id}`}
                              className="font-semibold text-ink hover:text-brand transition-colors block"
                            >
                              {partner.companyName}
                            </Link>
                            <div className="text-ink-muted font-mono text-xs mt-0.5">
                              {refId}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-brand-soft text-brand border border-brand/20 tracking-wider inline-block">
                              {partner.referralCode || "PENDING"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">{statusPill(partner.status)}</td>
                          <td className="px-5 py-3.5 text-base font-bold text-ink">
                            {partner.commissionRate}%
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {partner.commissionPolicy === "FIRST_PAYMENT" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                                1st payment only
                              </span>
                            ) : partner.commissionPolicy === "EVERY_RENEWAL" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                Every renewal
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-canvas text-ink-muted border border-line"
                                title="Inherits platform global policy"
                              >
                                Global ({programConfig?.defaultCommissionPolicy === "EVERY_RENEWAL" ? "Renewal" : "1st pay"})
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {partner.isCommissionActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Eligible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-700 border border-slate-500/20">
                                <span className="size-1.5 rounded-full bg-slate-500" />
                                Not eligible
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-ink-body text-xs">
                            {partner.lastCommissionChange ||
                              (partner.approvedAt
                                ? `${formatDate(partner.approvedAt)} · Set to ${partner.commissionRate}%`
                                : "—")}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommissionPartner(partner);
                                setNewCommissionRate(partner.commissionRate);
                                setIsCommissionActive(partner.isCommissionActive);
                                setNewCommissionPolicy(partner.commissionPolicy ?? "GLOBAL_DEFAULT");
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
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
      {/* TAB 3: AUDIT LOG                                         */}
      {/* ======================================================== */}
      {currentMainTab === "audit-log" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[50rem]">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      DATE &amp; TIME
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      ACTION
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      DETAILS
                    </th>
                    <th className="px-5 py-3.5 text-xs font-medium text-ink-muted whitespace-nowrap">
                      BY
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm text-ink">
                  {displayAuditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-canvas/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {actionBadge(log.actionBadge.label, log.actionBadge.variant)}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-ink">
                        {log.details}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink-muted whitespace-nowrap font-medium">
                        {log.actorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* APPROVE APPLICATION MODAL                                */}
      {/* ======================================================== */}
      {approvingPartner && (
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
                Approve <strong>{approvingPartner.companyName}</strong>. This generates a referral code, grants dashboard access, and sends an automated welcome email.
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
                    value={approveCommission}
                    onChange={(e) => setApproveCommission(Number(e.target.value))}
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
                      approvePolicy === "GLOBAL_DEFAULT"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="approvePolicy"
                        value="GLOBAL_DEFAULT"
                        checked={approvePolicy === "GLOBAL_DEFAULT"}
                        onChange={() => setApprovePolicy("GLOBAL_DEFAULT")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          approvePolicy === "GLOBAL_DEFAULT"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {approvePolicy === "GLOBAL_DEFAULT" && (
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
                      approvePolicy === "FIRST_PAYMENT"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="approvePolicy"
                        value="FIRST_PAYMENT"
                        checked={approvePolicy === "FIRST_PAYMENT"}
                        onChange={() => setApprovePolicy("FIRST_PAYMENT")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          approvePolicy === "FIRST_PAYMENT"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {approvePolicy === "FIRST_PAYMENT" && (
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
                      approvePolicy === "EVERY_RENEWAL"
                        ? "border-brand bg-brand/5"
                        : "border-line bg-canvas/40 hover:bg-canvas"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="radio"
                        name="approvePolicy"
                        value="EVERY_RENEWAL"
                        checked={approvePolicy === "EVERY_RENEWAL"}
                        onChange={() => setApprovePolicy("EVERY_RENEWAL")}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          approvePolicy === "EVERY_RENEWAL"
                            ? "border-brand bg-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {approvePolicy === "EVERY_RENEWAL" && (
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

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Custom Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KWS-7Q4M (leave blank to auto-generate)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink font-mono placeholder:text-ink-muted focus:outline-none focus:border-brand shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Temporary Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate secure password"
                  value={approvePassword}
                  onChange={(e) => setApprovePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand shadow-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setApprovingPartner(null)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={submitApprove}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isApproving ? "Approving..." : "Confirm & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* APPROVAL SUCCESS MODAL                                   */}
      {/* ======================================================== */}
      {approvedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-5"
            style={{ colorScheme: "light" }}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Partner Approved Successfully!
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                <strong>{approvedSuccess.partnerName}</strong> has been approved. A welcome email with an account activation link has been sent to their email.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-line space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Account Email:</span>
                <span className="font-semibold text-ink font-mono">{approvedSuccess.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Referral Code:</span>
                <span className="font-semibold text-brand font-mono">{approvedSuccess.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Partner Dashboard:</span>
                <span className="font-semibold text-ink">/partner/dashboard</span>
              </div>
            </div>

            {approvedSuccess.inviteLink && (
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-ink">
                  Set-Password Activation Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={approvedSuccess.inviteLink}
                    className="flex-1 px-3 py-2 rounded-lg bg-surface border border-line text-xs font-mono text-ink select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!approvedSuccess.inviteLink) return;
                      navigator.clipboard.writeText(approvedSuccess.inviteLink);
                      setCopiedSuccessLink(true);
                      setTimeout(() => setCopiedSuccessLink(false), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-brand hover:bg-brand-strong text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {copiedSuccessLink ? "Copied!" : "Copy Link"}
                  </button>
                </div>
                <p className="text-[11px] text-ink-muted">
                  The partner can open this link to set their password and sign straight into the partner dashboard.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setApprovedSuccess(null)}
                className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {rejectingPartner && (
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
                Reject <strong>{rejectingPartner.companyName}</strong>. Please provide a reason to be recorded and sent via notification.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Business details could not be verified."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink placeholder:text-ink-muted focus:outline-none focus:border-rose-500 shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setRejectingPartner(null)}
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
      {/* SUSPEND MODAL                                            */}
      {/* ======================================================== */}
      {suspendingPartner && (
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
                Suspend <strong>{suspendingPartner.companyName}</strong>. Suspended partners cannot generate new referrals. Existing commission history remains intact.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">Suspension Reason</label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Multiple self-referrals detected in October."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink placeholder:text-ink-muted focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setSuspendingPartner(null)}
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
      {editingCommissionPartner && (
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
                Adjust commission rate and eligibility for <strong>{editingCommissionPartner.companyName}</strong>.
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
                onClick={() => setEditingCommissionPartner(null)}
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
                  Confirm manual disbursement for <strong>{settlingRequest.partnerName}</strong> ({settlingRequest.formattedId}).
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
              {/* Payment Method selector */}
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

              {/* Transaction Reference / UTR */}
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
                <p className="text-[11px] text-ink-muted mt-1">
                  Provide the bank or UPI transfer reference ID so the partner can reconcile payment.
                </p>
              </div>

              {/* Invoice Number */}
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

              {/* Admin Notes */}
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
                back into the partner&apos;s available commission balance.
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
                placeholder="Explain why this payout was rejected (e.g. incorrect bank account details, invalid IFSC code)..."
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
              {/* Header Box */}
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

              {/* Billed To / Partner details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                  <span className="font-semibold text-[11px] text-ink-muted uppercase tracking-wider block">
                    Beneficiary (Partner)
                  </span>
                  <div className="font-bold text-sm text-ink">{viewingInvoice.partnerName || "Partner"}</div>
                  {viewingInvoice.partnerReferralCode && (
                    <div className="text-xs text-ink-muted font-mono">
                      Partner Code: {viewingInvoice.partnerReferralCode}
                    </div>
                  )}
                  {viewingInvoice.partnerEmail && (
                    <div className="text-xs text-ink-muted">{viewingInvoice.partnerEmail}</div>
                  )}
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

              {/* Calculation Table */}
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
