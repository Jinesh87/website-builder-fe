import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import {
  Check,
  Copy,
  Lock,
  Mail,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { partnerApi, type PartnerDashboardData } from "../../api/partner.ts";
import { useAuth } from "../../auth/auth-context.ts";

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
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

type ReferralRow = {
  id: string;
  date: string;
  customer: string;
  plan: string;
  status: "Paid" | "Registered" | "Clicked";
  payment: number | null;
  commission: number | null;
  commissionStatus: "Pending" | "Approved" | "Paid" | "No payment yet";
};

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{
    partner?: PartnerDashboardData["partner"];
  }>();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [filterTab, setFilterTab] = useState<
    "All" | "Paid" | "Registered" | "Clicked"
  >("All");

  useEffect(() => {
    if (hash === "#referrals") {
      navigate("/partner/referrals", { replace: true });
    } else if (hash === "#commissions") {
      navigate("/partner/commissions", { replace: true });
    } else if (hash === "#marketing") {
      navigate("/partner/marketing", { replace: true });
    } else if (hash === "#profile") {
      navigate("/partner/profile", { replace: true });
    }
  }, [hash, navigate]);

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
        // Fallback gracefully to demo partner view matching the screenshot
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
        data?.partner?.referralCode ||
        outletCtx?.partner?.referralCode ||
        "",
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
      effectiveCommissionPolicy:
        data?.partner?.effectiveCommissionPolicy ??
        outletCtx?.partner?.effectiveCommissionPolicy ??
        "FIRST_PAYMENT",
    };
  }, [data, outletCtx, user]);

  const isSuspended = partnerInfo.status === "SUSPENDED";
  const firstName = partnerInfo.contactName.split(" ")[0] || "Partner";

  const brandOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://yourbrand.com";
  const referralUrl = `${brandOrigin}/r/${partnerInfo.referralCode}`;

  function handleCopyCode() {
    if (isSuspended || !partnerInfo.referralCode) return;
    navigator.clipboard.writeText(partnerInfo.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    if (isSuspended || !partnerInfo.referralCode) return;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function shareWhatsApp() {
    if (isSuspended || !partnerInfo.referralCode) return;
    const text = encodeURIComponent(
      `Check out this website builder: ${referralUrl} (Use referral code ${partnerInfo.referralCode} for exclusive benefits!)`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareEmail() {
    if (isSuspended || !partnerInfo.referralCode) return;
    const subject = encodeURIComponent(
      "Recommendation: Modern Website Builder Platform",
    );
    const body = encodeURIComponent(
      `Hi,\n\nI recommend checking out this web builder. You can sign up using my referral link:\n${referralUrl}\n\nReferral Code: ${partnerInfo.referralCode}\n\nBest regards,\n${partnerInfo.contactName}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  const realReferrals = useMemo<ReferralRow[]>(() => {
    if (!data?.referrals || data.referrals.length === 0) return [];
    return data.referrals.map((r) => {
      const isPaid =
        r.status === "CONVERTED" ||
        (r.totalSpentPaise && Number(r.totalSpentPaise) > 0);
      let commStatus: "Pending" | "Approved" | "Paid" | "No payment yet" =
        "No payment yet";
      if (r.commissionStatus === "PENDING") commStatus = "Pending";
      else if (r.commissionStatus === "APPROVED") commStatus = "Approved";
      else if (r.commissionStatus === "PAID") commStatus = "Paid";
      else if (isPaid) commStatus = "Approved";

      const payment = r.paymentAmountPaise
        ? r.paymentAmountPaise / 100
        : r.totalSpentPaise
          ? Number(r.totalSpentPaise) / 100
          : null;

      const commission = r.commissionAmountPaise
        ? r.commissionAmountPaise / 100
        : payment
          ? Math.round((payment * (partnerInfo.commissionRate || 15)) / 100)
          : null;

      return {
        id: r.id,
        date: formatDate(r.convertedAt || r.registeredAt),
        customer: r.customerName,
        plan: r.planName || (isPaid ? "Business" : "—"),
        status: isPaid ? "Paid" : "Registered",
        payment,
        commission,
        commissionStatus: commStatus,
      };
    });
  }, [data?.referrals, partnerInfo.commissionRate]);

  const filteredReferrals = useMemo(() => {
    if (filterTab === "All") return realReferrals;
    return realReferrals.filter((r) => r.status === filterTab);
  }, [realReferrals, filterTab]);

  const monthlyStats = useMemo(() => {
    const months: {
      month: string;
      monthIndex: number;
      year: number;
      paid: number;
      other: number;
      total: number;
    }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        paid: 0,
        other: 0,
        total: 0,
      });
    }

    if (data?.referrals) {
      for (const r of data.referrals) {
        const d = new Date(r.registeredAt);
        const match = months.find(
          (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear(),
        );
        if (match) {
          const isPaid =
            r.status === "CONVERTED" ||
            (r.totalSpentPaise && Number(r.totalSpentPaise) > 0);
          if (isPaid) match.paid += 1;
          else match.other += 1;
          match.total += 1;
        }
      }
    }

    return months;
  }, [data?.referrals]);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-ink-muted">
        <Spinner size="lg" aria-label="Loading partner dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-7xl mx-auto bg-canvas min-h-screen text-ink">
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
              is inactive and commission payouts are locked.
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
            PARTNER DASHBOARD
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Welcome back, {firstName}
          </h1>
        </div>

        <div>
          {isSuspended ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
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

      {/* Top 2 Cards: Referral Code & Link + Commission Rate & Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Blue/Indigo Gradient Referral Code & Link */}
        <div className="lg:col-span-7 rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-7 text-white shadow-sm relative overflow-hidden flex flex-col justify-between">
          {/* Subtle background glow circle */}
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-ed-2xs font-bold uppercase tracking-wider text-blue-200">
                YOUR REFERRAL CODE
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider text-white">
                {partnerInfo.referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={isSuspended}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {copiedCode ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy code
                  </>
                )}
              </button>
            </div>

            <div className="mt-5">
              <span className="font-mono text-ed-2xs font-bold uppercase tracking-wider text-blue-200 block mb-2">
                SHAREABLE REFERRAL LINK
              </span>
              <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-xl bg-black/20 border border-white/20 backdrop-blur-sm">
                <span className="text-xs font-mono text-blue-100 truncate flex-1">
                  {referralUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={isSuspended}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex items-center gap-1.5 text-xs text-blue-200">
            <Lock className="size-3.5" />
            <span>Your code is fixed and can't be changed.</span>
          </div>
        </div>

        {/* Right Card: Commission Rate & Quick Share */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <span className="font-mono text-ed-2xs font-bold uppercase tracking-wider text-ink-muted block mb-2">
              YOUR COMMISSION RATE
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-ink">
                {partnerInfo.commissionRate}%
              </span>
              <span className="text-xs sm:text-sm text-ink-muted font-medium">
                {partnerInfo.effectiveCommissionPolicy === "EVERY_RENEWAL"
                  ? "on every subscription renewal"
                  : "on customer's first payment"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
              <Lock className="size-3.5 text-ink-muted" />
              <span>
                Set by [Your Brand]. Contact support to discuss changes.
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-line flex items-center gap-3">
            <button
              type="button"
              onClick={shareWhatsApp}
              disabled={isSuspended}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <MessageCircle className="size-4 text-emerald-600" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={shareEmail}
              disabled={isSuspended}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Mail className="size-4 text-blue-600" />
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Referrals */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <p className="text-xs font-semibold text-ink-muted">
            Total referrals
          </p>
          <p className="text-3xl font-bold text-ink mt-1.5">
            {data?.stats?.totalReferrals ?? 0}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">
            Link clicks that signed up or started
          </p>
        </div>

        {/* KPI 2: Registered Customers */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <p className="text-xs font-semibold text-ink-muted">
            Registered customers
          </p>
          <p className="text-3xl font-bold text-ink mt-1.5">
            {data?.stats?.registeredCustomers ?? 0}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">Created an account</p>
        </div>

        {/* KPI 3: Successful Conversions */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <p className="text-xs font-semibold text-ink-muted">
            Successful conversions
          </p>
          <p className="text-3xl font-bold text-ink mt-1.5">
            {data?.stats?.successfulConversions ?? 0}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">
            {data?.stats?.totalReferrals && data.stats.totalReferrals > 0
              ? `${Math.round(((data.stats.successfulConversions ?? 0) / data.stats.totalReferrals) * 100)}% of referrals paid`
              : "0% of referrals paid"}
          </p>
        </div>

        {/* KPI 4: Total Earned Commission (Accent card) */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-5 shadow-xs">
          <p className="text-xs font-semibold text-blue-900">
            Total earned commission
          </p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1.5">
            {formatCurrency(Math.round((data?.stats?.totalEarnedPaise ?? 0) / 100))}
          </p>
          <p className="text-ed-2xs text-blue-700/80 mt-1">
            At {partnerInfo.commissionRate}% of paid transactions
          </p>
        </div>
      </div>

      {/* Row 2: 3 Commission Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <span className="size-2 rounded-full bg-amber-500" />
            Pending
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {formatCurrency(Math.round((data?.stats?.pendingCommissionPaise ?? 0) / 100))}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">
            In the 15-day refund window
          </p>
        </div>

        {/* Approved */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <span className="size-2 rounded-full bg-blue-500" />
            Approved
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {formatCurrency(Math.round((data?.stats?.approvedCommissionPaise ?? 0) / 100))}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">
            Will be paid on [10th of next month]
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" />
            Paid
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {formatCurrency(Math.round((data?.stats?.paidCommissionPaise ?? 0) / 100))}
          </p>
          <p className="text-ed-2xs text-ink-muted mt-1">
            Sent to your bank account
          </p>
        </div>
      </div>

      {/* Middle Row: Charts (Referrals by Month + Conversion Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Referrals by Month (Stacked Bar Chart) */}
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-ink">Referrals by month</h2>
            <span className="text-xs text-ink-muted">Last 6 months</span>
          </div>

          {/* Bar Chart Area */}
          <div className="h-56 flex items-end justify-between gap-4 px-2 sm:px-6 pt-6 pb-2 border-b border-line">
            {monthlyStats.map((stat) => {
              const maxVal = Math.max(1, ...monthlyStats.map((s) => s.total));
              const totalHeightPct = stat.total > 0 ? Math.round((stat.total / maxVal) * 100) : 4;
              const paidHeightPct = stat.total > 0 ? Math.round((stat.paid / stat.total) * 100) : 0;

              return (
                <div
                  key={stat.month}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-xs font-semibold text-ink group-hover:text-brand transition-colors">
                    {stat.total}
                  </span>
                  <div
                    style={{ height: `${totalHeightPct}%` }}
                    className="w-full max-w-9.5 rounded-t-md overflow-hidden flex flex-col justify-end bg-blue-100 transition-all group-hover:brightness-95"
                  >
                    <div
                      style={{ height: `${paidHeightPct}%` }}
                      className="w-full bg-[#2447C7] rounded-t-xs"
                    />
                  </div>
                  <span className="text-xs text-ink-muted mt-1 font-medium">
                    {stat.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-[#2447C7]" />
              <span className="font-medium text-ink">Paid customers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-blue-100 border border-blue-200" />
              <span>Other referrals</span>
            </div>
          </div>
        </div>

        {/* Right: Conversion Funnel */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink mb-6">Conversion</h2>

            <div className="space-y-5">
              {/* Referrals */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink font-medium">Referrals</span>
                  <span className="text-ink font-bold font-mono">
                    {data?.stats?.totalReferrals ?? 0}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{
                      width: (data?.stats?.totalReferrals ?? 0) > 0 ? "100%" : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Registered */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink font-medium">Registered</span>
                  <span className="text-ink font-bold font-mono">
                    {data?.stats?.registeredCustomers ?? 0}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{
                      width:
                        data?.stats?.totalReferrals && data.stats.totalReferrals > 0
                          ? `${Math.round(((data.stats.registeredCustomers ?? 0) / data.stats.totalReferrals) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Paid */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink font-medium">Paid</span>
                  <span className="text-ink font-bold font-mono">
                    {data?.stats?.successfulConversions ?? 0}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{
                      width:
                        data?.stats?.totalReferrals && data.stats.totalReferrals > 0
                          ? `${Math.round(((data.stats.successfulConversions ?? 0) / data.stats.totalReferrals) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-ink-muted leading-relaxed">
            Commission is earned only when a referred customer completes a
            payment.
          </p>
        </div>
      </div>

      {/* Referral History Table */}
      <div
        id="referrals"
        className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs"
      >
        {/* Table Header & Tabs */}
        <div className="p-5 sm:px-6 flex flex-wrap items-center justify-between gap-4 border-b border-line">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-ink">Referral history</h2>
            <Link
              to="/partner/referrals"
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
            >
              Open Referrals Tab &rarr;
            </Link>
          </div>

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
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas/50 border-b border-line text-ed-2xs font-mono uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3.5 font-semibold">DATE</th>
                <th className="px-5 py-3.5 font-semibold">CUSTOMER</th>
                <th className="px-5 py-3.5 font-semibold">PLAN</th>
                <th className="px-5 py-3.5 font-semibold">STATUS</th>
                <th className="px-5 py-3.5 font-semibold">PAYMENT</th>
                <th className="px-5 py-3.5 font-semibold">COMMISSION</th>
                <th className="px-5 py-3.5 font-semibold">COMMISSION STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-ink-muted">
                    No referrals recorded yet. Share your partner referral link or QR code to start tracking customers.
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-canvas/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-5 py-3.5 text-ink-body font-mono text-ed-2xs whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 text-ink font-semibold whitespace-nowrap">
                      {row.customer}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 text-ink-body whitespace-nowrap">
                      {row.plan}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {row.status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-ed-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      )}
                      {row.status === "Registered" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-ed-2xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Registered
                        </span>
                      )}
                      {row.status === "Clicked" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-ed-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                      {row.commissionStatus === "Approved" && (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Approved
                        </span>
                      )}
                      {row.commissionStatus === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
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
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
