import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { ChevronDown, Search, ShieldAlert } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { partnerApi, type PartnerDashboardData } from "../../api/partner.ts";
import { useAuth } from "../../auth/auth-context.ts";

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function formatDate(iso: string): string {
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

export type ReferralItem = {
  id: string;
  date: string;
  customer: string;
  source: string;
  plan: string;
  status: "Paid" | "Registered" | "Clicked";
  payment: number | null;
  commission: number | null;
  commissionStatus: "Pending" | "Approved" | "Paid" | "No payment yet";
};

export default function PartnerReferralsPage() {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{
    partner?: PartnerDashboardData["partner"];
  }>();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<
    "All" | "Paid" | "Registered" | "Clicked"
  >("All");
  const [planFilter, setPlanFilter] = useState<string>("All");

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
        // Fallback to sample demo data
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
      contactName:
        data?.partner?.contactName ||
        outletCtx?.partner?.contactName ||
        user?.fullName ||
        "Partner",
      companyName:
        data?.partner?.companyName ||
        outletCtx?.partner?.companyName ||
        "Your Company",
      referralCode:
        data?.partner?.referralCode || outletCtx?.partner?.referralCode || "",
      commissionRate:
        data?.partner?.commissionRate ??
        outletCtx?.partner?.commissionRate ??
        15,
      status: data?.partner?.status || outletCtx?.partner?.status || "APPROVED",
      suspensionReason:
        data?.partner?.suspensionReason ||
        outletCtx?.partner?.suspensionReason ||
        null,
      isCommissionActive:
        data?.partner?.isCommissionActive ??
        outletCtx?.partner?.isCommissionActive ??
        true,
    };
  }, [data, outletCtx, user]);

  const isSuspended = partnerInfo.status === "SUSPENDED";

  // Map real backend referrals
  const allReferrals = useMemo<ReferralItem[]>(() => {
    if (!data?.referrals || data.referrals.length === 0) {
      return [];
    }

    return data.referrals.map((r, index) => {
      const isPaid =
        r.status === "CONVERTED" ||
        r.status === "PAID" ||
        (r.totalSpentPaise && r.totalSpentPaise > 0);
      const status: "Paid" | "Registered" | "Clicked" = isPaid
        ? "Paid"
        : r.status === "CLICKED"
          ? "Clicked"
          : "Registered";

      let commStatus: "Pending" | "Approved" | "Paid" | "No payment yet" =
        "No payment yet";
      if (r.commissionStatus === "PENDING") commStatus = "Pending";
      else if (r.commissionStatus === "APPROVED") commStatus = "Approved";
      else if (r.commissionStatus === "PAID") commStatus = "Paid";
      else if (isPaid) commStatus = "Approved";

      const payment = r.paymentAmountPaise
        ? r.paymentAmountPaise / 100
        : r.totalSpentPaise
          ? r.totalSpentPaise / 100
          : null;

      const commission = r.commissionAmountPaise
        ? r.commissionAmountPaise / 100
        : payment
          ? Math.round((payment * (partnerInfo.commissionRate || 15)) / 100)
          : null;

      return {
        id: r.id || `real-ref-${index}`,
        date: formatDate(r.convertedAt || r.registeredAt),
        customer: r.customerName || "Customer",
        source: r.source || "Referral link",
        plan: r.planName || (isPaid ? "Business" : "—"),
        status,
        payment,
        commission,
        commissionStatus: commStatus,
      };
    });
  }, [data?.referrals, partnerInfo.commissionRate]);

  // Compute stat counts from live data
  const stats = useMemo(() => {
    const clickedCount = allReferrals.filter(
      (r) => r.status === "Clicked",
    ).length;
    const registeredCount = allReferrals.filter(
      (r) => r.status === "Registered" || r.status === "Paid",
    ).length;
    const paidCount = allReferrals.filter((r) => r.status === "Paid").length;
    const totalCount = allReferrals.length;

    return {
      clickedOnly: clickedCount,
      registered: data?.stats?.registeredCustomers ?? registeredCount,
      paidCustomers: data?.stats?.successfulConversions ?? paidCount,
      conversionRate:
        data?.stats?.totalReferrals && data.stats.totalReferrals > 0
          ? Math.round(
              (data.stats.successfulConversions / data.stats.totalReferrals) *
                100,
            )
          : totalCount > 0
            ? Math.round((paidCount / totalCount) * 100)
            : 0,
    };
  }, [allReferrals, data?.stats]);

  // Filter by search query, status tab, and plan dropdown
  const filteredList = useMemo(() => {
    return allReferrals.filter((item) => {
      // Status filter
      if (filterTab !== "All" && item.status !== filterTab) {
        return false;
      }

      // Plan filter
      if (planFilter !== "All") {
        if (!item.plan.toLowerCase().includes(planFilter.toLowerCase())) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCustomer = item.customer.toLowerCase().includes(q);
        const matchPlan = item.plan.toLowerCase().includes(q);
        const matchSource = item.source.toLowerCase().includes(q);
        if (!matchCustomer && !matchPlan && !matchSource) {
          return false;
        }
      }

      return true;
    });
  }, [allReferrals, filterTab, planFilter, searchQuery]);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-ink-muted">
        <Spinner size="lg" aria-label="Loading referrals..." />
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
              Your partner account is temporarily suspended. Referral tracking
              and commission payouts are inactive.
              {partnerInfo.suspensionReason && (
                <span className="block mt-1 font-mono text-amber-900 font-semibold">
                  Reason: {partnerInfo.suspensionReason}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-ink-muted">
            PARTNER / REFERRALS
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Referrals
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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clicked only */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted">Clicked only</p>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {stats.clickedOnly}
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">
            Visited, not signed up yet
          </p>
        </div>

        {/* Card 2: Registered */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted">Registered</p>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {stats.registered}
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">Created an account</p>
        </div>

        {/* Card 3: Paid customers */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted">
              Paid customers
            </p>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {stats.paidCustomers}
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">Commission earned</p>
        </div>

        {/* Card 4: Conversion rate (Accent Card) */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-900">
              Conversion rate
            </p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1.5">
              {stats.conversionRate}%
            </p>
          </div>
          <p className="text-ed-2xs text-blue-700/80 mt-2">
            Referrals that paid
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name"
            className="w-full rounded-xl bg-surface border border-line pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Right: Status Tabs and Plan Select */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-line">
            {(["All", "Paid", "Registered", "Clicked"] as const).map((tab) => {
              const active = filterTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-brand text-white shadow-xs"
                      : "text-ink-muted hover:text-ink hover:bg-surface"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Plan Dropdown */}
          <div className="relative">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="appearance-none rounded-xl bg-surface border border-line pl-3.5 pr-8 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="All">All plans</option>
              <option value="Starter">Starter</option>
              <option value="Business">Business</option>
              <option value="Pro">Pro</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/60 border-b border-line text-ed-2xs font-mono uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3.5 font-semibold">DATE</th>
                <th className="px-5 py-3.5 font-semibold">CUSTOMER</th>
                <th className="px-5 py-3.5 font-semibold">SOURCE</th>
                <th className="px-5 py-3.5 font-semibold">PLAN</th>
                <th className="px-5 py-3.5 font-semibold">STATUS</th>
                <th className="px-5 py-3.5 font-semibold">PAYMENT</th>
                <th className="px-5 py-3.5 font-semibold">COMMISSION</th>
                <th className="px-5 py-3.5 font-semibold">COMMISSION STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-ink-muted"
                  >
                    No referrals found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-canvas/50 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-5 py-3.5 text-ink-body font-mono text-ed-2xs whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 text-ink font-semibold whitespace-nowrap">
                      {row.customer}
                    </td>

                    {/* Source */}
                    <td className="px-5 py-3.5 text-ink-muted whitespace-nowrap">
                      {row.source}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 text-ink-body whitespace-nowrap">
                      {row.plan}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {row.status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      )}
                      {row.status === "Registered" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Registered
                        </span>
                      )}
                      {row.status === "Clicked" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="size-1.5 rounded-full bg-slate-400" />
                          Clicked
                        </span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-3.5 text-ink font-mono whitespace-nowrap font-medium">
                      {row.payment !== null ? formatCurrency(row.payment) : "—"}
                    </td>

                    {/* Commission */}
                    <td className="px-5 py-3.5 text-ink font-semibold font-mono whitespace-nowrap">
                      {row.commission !== null
                        ? formatCurrency(row.commission)
                        : "—"}
                    </td>

                    {/* Commission Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {row.commissionStatus === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                      {row.commissionStatus === "Approved" && (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Approved
                        </span>
                      )}
                      {row.commissionStatus === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      )}
                      {row.commissionStatus === "No payment yet" && (
                        <span className="text-ink-muted font-normal">
                          No payment yet
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2 Informational Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left Card: How referrals are counted */}
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-line p-6 shadow-xs">
          <h2 className="text-sm font-bold text-ink mb-4">
            How referrals are counted
          </h2>
          <ul className="space-y-2.5 text-xs text-ink-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold shrink-0 mt-0.5">→</span>
              <span>
                A referral is linked to you when a customer signs up within [60]
                days of clicking your link, or enters your code at checkout.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold shrink-0 mt-0.5">→</span>
              <span>
                Each customer can be linked to only one partner. The first valid
                link or code wins.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold shrink-0 mt-0.5">→</span>
              <span>
                Your own purchases and accounts don't count as referrals.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold shrink-0 mt-0.5">→</span>
              <span>
                Commission is added only after the customer's payment is
                successful.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Card: Status meanings */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line p-6 shadow-xs">
          <h2 className="text-sm font-bold text-ink mb-4">Status meanings</h2>
          <div className="space-y-3.5 text-xs text-ink-muted">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Clicked
              </span>
              <span>Visited using your link, no account yet</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Registered
              </span>
              <span>Created an account, no payment yet</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-ed-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Paid
              </span>
              <span>Bought a plan, commission earned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
