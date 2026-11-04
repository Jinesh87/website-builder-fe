import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  AlertCircle,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Handshake,
  RotateCcw,
  Search,
  Sliders,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  adminPartnerApi,
  type PartnerAuditLogItem,
  type PartnerCommissionPolicy,
  type PartnerDetail,
  type PartnerListResponse,
  type PartnerProgramConfig,
  type PartnerStatus,
  type PartnerSummary,
} from "../../api/partner.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { announcePartnersChanged } from "../../hooks/use-pending-partner-count.ts";

type MainTab = "applications" | "commission" | "audit-log";
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

  // Main Tabs: applications | commission | audit-log
  const rawMainTab = searchParams.get("tab")?.toLowerCase();
  const currentMainTab: MainTab =
    rawMainTab === "commission" || rawMainTab === "audit-log"
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

  // Modals state
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<PartnerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Fetch detail modal data
  useEffect(() => {
    if (!viewingId) {
      setDetailData(null);
      return;
    }

    setLoadingDetail(true);
    adminPartnerApi
      .get(viewingId)
      .then((res) => setDetailData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingDetail(false));
  }, [viewingId]);

  // Fetch global partner program config
  useEffect(() => {
    adminPartnerApi
      .getProgramConfig()
      .then(setProgramConfig)
      .catch(() => undefined);
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
    announcePartnersChanged();
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

  // Handle Reactivate
  async function handleReactivate(partner: PartnerSummary) {
    if (!confirm(`Reactivate partner account for ${partner.companyName}?`)) return;
    try {
      if (!partner.id.startsWith("demo-")) {
        await adminPartnerApi.reactivate(partner.id);
      }
      refresh();
    } catch (err) {
      alert(errorMessage(err));
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
                          onClick={() => setViewingId(partner.id)}
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
      {/* TAB 2: COMMISSION SETTINGS                               */}
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
                            <div className="font-semibold text-ink">
                              {partner.companyName}
                            </div>
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
      {/* PARTNER DETAIL MODAL / DRAWER                            */}
      {/* ======================================================== */}
      {viewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-surface border border-line shadow-2xl p-6 space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-ink">
                    {detailData?.companyName || "Partner Application"}
                  </h3>
                  {detailData && statusPill(detailData.status)}
                </div>
                <p className="text-xs text-ink-muted mt-1 font-mono">
                  Ref ID: {detailData ? formatPartnerReference(detailData) : ""} · Submitted{" "}
                  {detailData ? formatDate(detailData.createdAt) : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="size-8 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-20 text-center">
                <Spinner size="lg" className="mx-auto" />
              </div>
            ) : detailData ? (
              <div className="space-y-5 text-xs overflow-y-auto pr-1 flex-1">
                {/* Rejection / Suspension Notice Banner */}
                {detailData.status === "REJECTED" && detailData.rejectionReason && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                    <div className="font-semibold uppercase tracking-wider text-[11px] text-rose-700">
                      Rejection Reason
                    </div>
                    <p className="leading-relaxed">{detailData.rejectionReason}</p>
                  </div>
                )}
                {detailData.status === "SUSPENDED" && detailData.suspensionReason && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 space-y-1">
                    <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-700">
                      Suspension Reason
                    </div>
                    <p className="leading-relaxed">{detailData.suspensionReason}</p>
                  </div>
                )}

                {/* Company Details */}
                <div className="p-4 rounded-xl bg-canvas/70 border border-line space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="size-4" /> Company Details
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-ink-muted block text-[11px]">Business Type</span>
                      <strong className="text-ink">{detailData.businessType}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Established</span>
                      <strong className="text-ink">{detailData.yearEstablished}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Reg / Tax ID</span>
                      <strong className="text-ink">{detailData.registrationNumber || "None"}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Website</span>
                      {detailData.website ? (
                        <a
                          href={detailData.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline truncate block"
                        >
                          {detailData.website}
                        </a>
                      ) : (
                        <span className="text-ink-muted italic">None</span>
                      )}
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Location</span>
                      <strong className="text-ink">
                        {detailData.city}, {detailData.state}, {detailData.country}
                      </strong>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-ink-muted block text-[11px]">Full Address</span>
                      <strong className="text-ink">{detailData.businessAddress}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 rounded-xl bg-canvas/70 border border-line space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-4" /> Contact Information
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-ink-muted block text-[11px]">Contact Person</span>
                      <strong className="text-ink">{detailData.contactName}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Designation</span>
                      <strong className="text-ink">{detailData.designation}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Email</span>
                      <strong className="text-ink font-mono">{detailData.email}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Phone</span>
                      <strong className="text-ink font-mono">{detailData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Alternative Phone</span>
                      <strong className="text-ink font-mono">{detailData.alternatePhone || "None"}</strong>
                    </div>
                  </div>
                </div>

                {/* Partnership Details */}
                <div className="p-4 rounded-xl bg-canvas/70 border border-line space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Handshake className="size-4" /> Partnership Program Details
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-ink-muted block text-[11px]">Partner Type</span>
                        <strong className="text-ink">{detailData.partnershipType}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[11px]">Expected Monthly Referrals</span>
                        <strong className="text-ink">{detailData.expectedReferrals}</strong>
                      </div>
                    </div>
                    {detailData.referralCode && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line">
                        <div>
                          <span className="text-ink-muted block text-[11px]">Referral Code</span>
                          <span className="px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-brand-soft text-brand border border-brand/20 inline-block mt-0.5">
                            {detailData.referralCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-muted block text-[11px]">Commission Rate</span>
                          <span className="text-sm font-bold text-ink mt-0.5 inline-block">
                            {detailData.commissionRate}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-ink-muted block text-[11px] mb-1">Reason for applying</span>
                      <p className="p-2.5 rounded bg-surface border border-line text-ink leading-relaxed">
                        {detailData.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
              <div className="flex items-center gap-2">
                {detailData?.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setApprovingPartner(detailData);
                        setApproveCommission(detailData.commissionRate || 15);
                        setApprovePolicy(detailData.commissionPolicy ?? "GLOBAL_DEFAULT");
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="size-3.5" /> Approve Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingPartner(detailData)}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <X className="size-3.5" /> Reject
                    </button>
                  </>
                )}

                {detailData?.status === "APPROVED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommissionPartner(detailData);
                        setNewCommissionRate(detailData.commissionRate);
                        setIsCommissionActive(detailData.isCommissionActive);
                        setNewCommissionPolicy(detailData.commissionPolicy ?? "GLOBAL_DEFAULT");
                      }}
                      className="px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="size-3.5 text-brand" /> Adjust Commission
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuspendingPartner(detailData)}
                      className="px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-canvas text-ink-muted hover:text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Ban className="size-3.5" /> Suspend
                    </button>
                  </>
                )}

                {detailData?.status === "SUSPENDED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReactivate(detailData)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="size-3.5" /> Reactivate Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommissionPartner(detailData);
                        setNewCommissionRate(detailData.commissionRate);
                        setIsCommissionActive(detailData.isCommissionActive);
                        setNewCommissionPolicy(detailData.commissionPolicy ?? "GLOBAL_DEFAULT");
                      }}
                      className="px-3.5 py-2 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="size-3.5 text-brand" /> Adjust Commission
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
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
    </div>
  );
}
