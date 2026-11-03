import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchField, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Handshake,
  Plus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  adminPartnerApi,
  type PartnerDetail,
  type PartnerListResponse,
  type PartnerStatus,
  type PartnerSummary,
} from "../../api/partner.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import TablePagination from "../../components/ui/TablePagination.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";

type Tab = PartnerStatus | "ALL";

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "SUSPENDED", label: "Suspended" },
];

const TH =
  "px-4 py-3 text-xs font-medium text-ink-muted whitespace-nowrap first:pl-5 last:pr-5 border-b border-line bg-canvas/60";
const TD =
  "px-4 py-3.5 text-sm text-ink align-middle first:pl-5 last:pr-5 border-b border-line";

const tabClass = (active: boolean) =>
  `-mb-px flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-all ${
    active
      ? "border-primary bg-surface font-semibold text-ink shadow-xs"
      : "border-transparent font-medium text-ink-muted hover:bg-surface/50 hover:text-ink"
  }`;

function statusBadge(status: PartnerStatus) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 whitespace-nowrap">
          <Clock className="size-3" /> Pending
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
          <CheckCircle2 className="size-3" /> Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 whitespace-nowrap">
          <XCircle className="size-3" /> Rejected
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 whitespace-nowrap">
          <Ban className="size-3" /> Suspended
        </span>
      );
  }
}

export default function PartnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("status")?.toUpperCase();
  const currentTab: Tab =
    rawTab === "PENDING" ||
    rawTab === "APPROVED" ||
    rawTab === "REJECTED" ||
    rawTab === "SUSPENDED"
      ? rawTab
      : "ALL";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<PartnerListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<PartnerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Approve modal
  const [approvingPartner, setApprovingPartner] =
    useState<PartnerSummary | null>(null);
  const [approveCommission, setApproveCommission] = useState(15);
  const [customCode, setCustomCode] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal
  const [rejectingPartner, setRejectingPartner] =
    useState<PartnerSummary | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Suspend modal
  const [suspendingPartner, setSuspendingPartner] =
    useState<PartnerSummary | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  // Commission modal
  const [editingCommissionPartner, setEditingCommissionPartner] =
    useState<PartnerSummary | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(15);
  const [isCommissionActive, setIsCommissionActive] = useState(true);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Load partners list
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    adminPartnerApi
      .list({
        search: debouncedSearch,
        status: currentTab === "ALL" ? undefined : currentTab,
        page,
        pageSize,
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
  }, [debouncedSearch, currentTab, page, pageSize, refreshKey]);

  // Load detail modal data
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

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleTabChange(tab: Tab) {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (tab === "ALL") {
      next.delete("status");
    } else {
      next.set("status", tab);
    }
    setSearchParams(next);
  }

  // Handle Approve
  async function submitApprove() {
    if (!approvingPartner) return;
    setIsApproving(true);
    try {
      await adminPartnerApi.approve(approvingPartner.id, {
        commissionRate: approveCommission,
        customReferralCode: customCode.trim() || undefined,
        temporaryPassword: approvePassword.trim() || undefined,
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
      await adminPartnerApi.reject(rejectingPartner.id, {
        reason: rejectReason.trim(),
      });
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
      await adminPartnerApi.suspend(suspendingPartner.id, {
        reason: suspendReason.trim(),
      });
      setSuspendingPartner(null);
      setSuspendReason("");
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsSuspending(false);
    }
  }

  // Handle Reactivate (commented out for client presentation)
  /*
  async function handleReactivate(partner: PartnerSummary) {
    if (!confirm(`Reactivate partner ${partner.companyName}?`)) return;
    try {
      await adminPartnerApi.reactivate(partner.id);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    }
  }
  */

  // Handle Update Commission
  async function submitCommissionUpdate() {
    if (!editingCommissionPartner) return;
    setIsUpdatingCommission(true);
    try {
      await adminPartnerApi.updateCommission(editingCommissionPartner.id, {
        commissionRate: newCommissionRate,
        isCommissionActive,
      });
      setEditingCommissionPartner(null);
      refresh();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setIsUpdatingCommission(false);
    }
  }

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Partner Management"
        description="Review partner applications submitted through the public partner form."
        actions={
          <a
            href="/partner"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" aria-hidden /> Open public partner page
          </a>
        }
      />

      <div
        role="tablist"
        aria-label="Filter by status"
        className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-line pb-px"
      >
        {TABS.map(({ key, label }) => {
          const active = currentTab === key;
          const count = data?.counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleTabChange(key)}
              className={tabClass(active)}
            >
              {label}
              <span
                className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
                  active ? "bg-ink text-white" : "bg-canvas text-ink-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SearchField
          aria-label="Search partners"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full max-w-sm"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search ID (e.g. PART-1), company, code, email or phone" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {/* Main Table Section */}
      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data && loading ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading partners" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">
            Failed to load partners: {error}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Handshake className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {debouncedSearch
                ? "No partners match this search"
                : "No partner applications found"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              {debouncedSearch
                ? `No partners match "${debouncedSearch}".`
                : "Partner applications will appear here when submitted."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[10%]`}>
                    ID
                  </th>
                  <th scope="col" className={`${TH} w-[30%]`}>
                    Company &amp; Contact
                  </th>
                  <th scope="col" className={`${TH} w-[20%]`}>
                    Business Type
                  </th>
                  {/* Client Presentation: Hidden complex columns to keep dashboard simple
                  <th scope="col" className={`${TH} w-[12%]`}>Referral Code</th>
                  <th scope="col" className={`${TH} w-[11%]`}>Commission %</th>
                  <th scope="col" className={`${TH} w-[12%]`}>Stats</th>
                  */}
                  <th scope="col" className={`${TH} w-[14%]`}>
                    Status
                  </th>
                  <th scope="col" className={`${TH} w-[13%]`}>
                    Applied Date
                  </th>
                  <th scope="col" className={`${TH} w-[13%] text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.items.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-canvas/40 transition-colors"
                  >
                    <td className={`${TD} whitespace-nowrap`}>
                      <span className="font-mono text-xs font-semibold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded inline-block">
                        {partner.applicationId}
                      </span>
                    </td>
                    <td className={TD}>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-ink leading-tight">
                          {partner.companyName}
                        </div>
                        <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
                          <span>{partner.contactName}</span>
                          <span>·</span>
                          <a
                            href={`mailto:${partner.email}`}
                            className="hover:text-brand hover:underline"
                          >
                            {partner.email}
                          </a>
                          <span>·</span>
                          <a
                            href={`tel:${partner.phone}`}
                            className="hover:text-brand hover:underline font-mono"
                          >
                            {partner.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className={TD}>
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded bg-canvas border border-line text-xs font-medium text-ink">
                          {partner.businessType}
                        </span>
                      </div>
                    </td>

                    {/* Client Presentation: Commented out referral code, commission % and conversion stats
                    <td className={TD}>
                      {partner.referralCode ? (
                        <span className="font-mono text-xs font-semibold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded inline-block">
                          {partner.referralCode}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted italic">Not generated</span>
                      )}
                    </td>

                    <td className={TD}>
                      <div>
                        <div className="font-semibold text-ink flex items-center gap-1">
                          {partner.commissionRate}%
                          {!partner.isCommissionActive && (
                            <span className="text-[10px] text-red-500 font-normal">(Paused)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommissionPartner(partner);
                            setNewCommissionRate(partner.commissionRate);
                            setIsCommissionActive(partner.isCommissionActive);
                          }}
                          className="text-[11px] text-brand hover:underline cursor-pointer inline-flex items-center gap-1 mt-0.5"
                        >
                          <Sliders className="size-3" /> Adjust
                        </button>
                      </div>
                    </td>
                    */}

                    <td className={TD}>{statusBadge(partner.status)}</td>

                    {/*
                    <td className={TD}>
                      <div className="text-xs space-y-0.5 text-ink-muted">
                        <div>
                          Referrals: <strong className="text-ink font-semibold">{partner.totalReferrals}</strong>
                        </div>
                        <div>
                          Converted:{" "}
                          <strong className="text-emerald-600 font-semibold">
                            {partner.convertedReferrals}
                          </strong>
                        </div>
                        {partner.totalCommissionPaise > 0 && (
                          <div className="text-[11px] text-brand font-medium">
                            ₹{(partner.totalCommissionPaise / 100).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    */}

                    <td
                      className={`${TD} whitespace-nowrap text-xs text-ink-muted`}
                    >
                      {new Date(partner.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className={`${TD} text-right`}>
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingId(partner.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-brand/30 bg-brand/5 hover:bg-brand/10 text-xs font-semibold text-brand inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="size-3.5" /> View Details
                        </button>

                        {/* Action buttons commented out for client presentation
                        {partner.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setApprovingPartner(partner);
                                setApproveCommission(partner.commissionRate || 15);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Check className="size-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingPartner(partner);
                                setRejectReason("");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            >
                              <X className="size-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {partner.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSuspendingPartner(partner);
                              setSuspendReason("");
                            }}
                            className="px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Ban className="size-3.5" /> Suspend
                          </button>
                        )}

                        {partner.status === "SUSPENDED" && (
                          <button
                            type="button"
                            onClick={() => handleReactivate(partner)}
                            className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-900/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-3.5" /> Reactivate
                          </button>
                        )}
                        */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && data.total > 0 && (
        <div className="mt-4">
          <TablePagination
            page={page}
            total={data.total}
            pageSize={pageSize}
            itemLabel="partners"
            isDisabled={loading}
            onPageChange={setPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* DETAIL MODAL / DRAWER */}
      {viewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-surface border border-ed-border shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-ed-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-ink">
                    {detailData?.companyName || "Partner Application"}
                  </h3>
                  {detailData && statusBadge(detailData.status)}
                </div>
                <p className="text-xs text-ink-muted mt-1 font-mono">
                  Ref ID: {detailData?.applicationId} · Applied on{" "}
                  {detailData &&
                    new Date(detailData.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="size-8 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas flex items-center justify-center cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-20 text-center">
                <Spinner size="lg" />
              </div>
            ) : detailData ? (
              <div className="space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-1">
                {/* Status Bar / Rejection or Suspension Banner */}
                {detailData.status === "REJECTED" && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-1">
                    <div className="font-semibold text-xs uppercase tracking-wider">
                      Rejection Reason
                    </div>
                    <p className="text-xs leading-relaxed">
                      {detailData.rejectionReason}
                    </p>
                  </div>
                )}
                {detailData.status === "SUSPENDED" && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-1">
                    <div className="font-semibold text-xs uppercase tracking-wider">
                      Suspension Reason
                    </div>
                    <p className="text-xs leading-relaxed">
                      {detailData.suspensionReason}
                    </p>
                  </div>
                )}

                {/* Grid 1: Company Details */}
                <div className="p-4 rounded-xl bg-canvas/60 border border-ed-border space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="size-4" /> Company Details
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-ink-muted block">
                        Business Type
                      </span>
                      <strong className="text-ink">
                        {detailData.businessType}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Established</span>
                      <strong className="text-ink">
                        {detailData.yearEstablished}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Reg / Tax ID</span>
                      <strong className="text-ink">
                        {detailData.registrationNumber || "None"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Website</span>
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
                      <span className="text-ink-muted block">Location</span>
                      <strong className="text-ink">
                        {detailData.city}, {detailData.state},{" "}
                        {detailData.country}
                      </strong>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-ink-muted block">Full Address</span>
                      <strong className="text-ink">
                        {detailData.businessAddress}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Grid 2: Contact Details */}
                <div className="p-4 rounded-xl bg-canvas/60 border border-ed-border space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-4" /> Contact Information
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-ink-muted block">
                        Contact Person
                      </span>
                      <strong className="text-ink">
                        {detailData.contactName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Designation</span>
                      <strong className="text-ink">
                        {detailData.designation}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Email</span>
                      <strong className="text-ink">{detailData.email}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Phone</span>
                      <strong className="text-ink">{detailData.phone}</strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">
                        Alternative Phone
                      </span>
                      <strong className="text-ink">
                        {detailData.alternatePhone || "None"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Grid 3: Partnership Program Details */}
                <div className="p-4 rounded-xl bg-canvas/60 border border-ed-border space-y-3">
                  <div className="font-semibold text-xs text-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Handshake className="size-4" /> Partnership &amp; Marketing
                    Plan
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-ink-muted block">
                        Expected Monthly Referrals
                      </span>
                      <strong className="text-ink">
                        {detailData.expectedReferrals}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block mb-1">
                        Target Categories
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {detailData.targetCategories.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-surface border border-ed-border text-[11px] text-ink"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-ink-muted block mb-1">
                        Marketing Channels
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {detailData.marketingChannels.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-surface border border-ed-border text-[11px] text-ink"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-ink-muted block mb-1">
                        Reason for joining
                      </span>
                      <p className="p-2.5 rounded bg-surface border border-ed-border text-ink leading-relaxed">
                        {detailData.reason}
                      </p>
                    </div>
                    <div>
                      <span className="text-ink-muted block">
                        Prior Referral Experience:
                      </span>
                      <strong className="text-ink">
                        {detailData.previousExperience ? "Yes" : "No"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Grid 4: Audit & Activity Log */}
                <div className="p-4 rounded-xl bg-canvas/60 border border-ed-border space-y-3">
                  <div className="font-semibold text-xs text-ink-muted uppercase tracking-wider">
                    Activity &amp; Change Log
                  </div>
                  <div className="space-y-2">
                    {detailData.activities.map((act) => (
                      <div
                        key={act.id}
                        className="text-xs p-2 rounded bg-surface border border-ed-border flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="font-medium text-ink">
                            {act.body}
                          </span>
                          {act.actorName && (
                            <span className="text-ink-muted ml-2 text-[11px]">
                              by {act.actorName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-muted whitespace-nowrap">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-4 border-t border-ed-border">
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="px-4 py-2 rounded-lg border border-ed-border text-xs font-semibold text-ink hover:bg-canvas"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approvingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-ed-border shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink">
                Approve Partner Application
              </h3>
              <p className="text-xs text-ink-muted">
                Approve <strong>{approvingPartner.companyName}</strong>. This
                generates a referral code, grants dashboard access, and sends
                the approval email.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Commission Percentage (%){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={approveCommission}
                    onChange={(e) =>
                      setApproveCommission(Number(e.target.value))
                    }
                    className="w-32 px-3 py-2 rounded-lg bg-canvas border border-ed-border text-ink font-semibold focus:outline-none focus:border-brand"
                  />
                  <span className="text-ink-muted">
                    % per referred customer payment
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Custom Referral Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generated code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-ed-border text-ink font-mono focus:outline-none focus:border-brand uppercase"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  Example: <code>ABC-7Q4M</code>. If blank, a unique code is
                  created based on the company name.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Initial Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate (e.g. Partner@XYZ987)"
                  value={approvePassword}
                  onChange={(e) => setApprovePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-ed-border text-ink font-mono focus:outline-none focus:border-brand"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  The partner can use this password to log in at{" "}
                  <code>/login</code> and view their &ldquo;Partnership&rdquo;
                  tab.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 text-brand text-[11px] leading-relaxed">
                An automatic email with their login credentials, referral code,
                commission rate, and dashboard link will be sent to{" "}
                <strong>{approvingPartner.email}</strong>.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApprovingPartner(null)}
                className="px-4 py-2 rounded-lg border border-ed-border text-xs font-semibold text-ink hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving || approveCommission <= 0}
                onClick={submitApprove}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs"
              >
                {isApproving ? "Approving..." : "Confirm & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-ed-border shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink">
                Reject Partner Application
              </h3>
              <p className="text-xs text-ink-muted">
                Reject <strong>{rejectingPartner.companyName}</strong>. Please
                provide a reason to be included in the notification email.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Does not meet minimum customer portfolio requirements at this time..."
                className="w-full p-3 rounded-lg bg-canvas border border-ed-border text-ink focus:outline-none focus:border-red-500 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPartner(null)}
                className="px-4 py-2 rounded-lg border border-ed-border text-xs font-semibold text-ink hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting || !rejectReason.trim()}
                onClick={submitReject}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs"
              >
                {isRejecting ? "Rejecting..." : "Confirm & Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {suspendingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-ed-border shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink">
                Suspend Partner Account
              </h3>
              <p className="text-xs text-ink-muted">
                Suspend <strong>{suspendingPartner.companyName}</strong>.
                Suspended partners cannot generate new referrals. Existing
                referral and commission history remains intact.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-ink">
                Suspension Reason
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Inactivity, violation of partner terms, or under review..."
                className="w-full p-3 rounded-lg bg-canvas border border-ed-border text-ink focus:outline-none focus:border-amber-500 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingPartner(null)}
                className="px-4 py-2 rounded-lg border border-ed-border text-xs font-semibold text-ink hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSuspending || !suspendReason.trim()}
                onClick={submitSuspend}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs"
              >
                {isSuspending ? "Suspending..." : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST COMMISSION MODAL */}
      {editingCommissionPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-ed-border shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink">
                Update Commission Settings
              </h3>
              <p className="text-xs text-ink-muted">
                Adjust commission rate and eligibility for{" "}
                <strong>{editingCommissionPartner.companyName}</strong>.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Commission Percentage (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={newCommissionRate}
                    onChange={(e) =>
                      setNewCommissionRate(Number(e.target.value))
                    }
                    className="w-32 px-3 py-2 rounded-lg bg-canvas border border-ed-border text-ink font-semibold focus:outline-none focus:border-brand"
                  />
                  <span className="text-ink-muted">% per payment</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isCommissionActive"
                  checked={isCommissionActive}
                  onChange={(e) => setIsCommissionActive(e.target.checked)}
                  className="size-4 rounded text-brand focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isCommissionActive"
                  className="text-ink font-medium cursor-pointer"
                >
                  Commission Eligibility Active (can earn commission on
                  payments)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingCommissionPartner(null)}
                className="px-4 py-2 rounded-lg border border-ed-border text-xs font-semibold text-ink hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingCommission}
                onClick={submitCommissionUpdate}
                className="px-5 py-2 rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-50 text-xs font-semibold text-white shadow-xs"
              >
                {isUpdatingCommission ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
