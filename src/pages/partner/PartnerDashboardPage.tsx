import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import {
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  HelpCircle,
  Link as LinkIcon,
  MessageCircle,
  Percent,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { partnerApi, type PartnerDashboardData } from "../../api/partner.ts";
import { errorMessage } from "../../api/http.ts";
import PageHeader from "../../components/app/PageHeader.tsx";

function formatCurrency(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function PartnerDashboardPage() {
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"referrals" | "commissions" | "guide">("referrals");

  useEffect(() => {
    partnerApi
      .getDashboard()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(errorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code: string) {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyLink(url: string) {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner size="lg" aria-label="Loading partner dashboard..." />
      </div>
    );
  }

  // If user is not yet an approved partner (e.g. visiting before admin approval)
  if (!data || error) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Partner Dashboard"
          description="View your referral performance, track customer conversions, and monitor commission payouts."
        />
        <div className="rounded-xl border border-ed-border bg-surface p-10 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-ink">Partner Account Pending or Not Found</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {error ||
              "Your partner application is either currently under review or you haven't applied yet. Once Platform Admin approves your account, your referral link, code, and earnings will appear here."}
          </p>
          <div className="pt-2">
            <a
              href="/partner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-colors"
            >
              Apply to Become a Partner <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { partner, stats, referrals, commissions } = data;

  // If application is pending review, show submitted application details simply for client presentation
  if (partner.status === "PENDING") {
    return (
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <PageHeader
          title="Partner Dashboard"
          description={`Welcome, ${partner.contactName} (${partner.companyName}). Your partner application details are displayed below.`}
          actions={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Clock className="size-3.5" />
              Application Under Review
            </span>
          }
        />

        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-brand uppercase tracking-wider">
                Application Reference
              </span>
              <div className="text-xl font-mono font-bold text-ink flex items-center gap-2">
                {partner.applicationId || "Application Received"}
                {partner.applicationId && (
                  <button
                    type="button"
                    onClick={() => copyCode(partner.applicationId!)}
                    className="size-7 rounded-md bg-canvas hover:bg-line/40 text-ink-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copiedCode ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="text-xs text-ink-muted sm:text-right">
              Submitted on{" "}
              <strong className="text-ink">
                {partner.createdAt
                  ? new Date(partner.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Company Name</span>
              <strong className="text-ink text-sm block font-semibold">{partner.companyName}</strong>
            </div>
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Contact Person</span>
              <strong className="text-ink text-sm block font-semibold">{partner.contactName}</strong>
            </div>
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Email Address</span>
              <strong className="text-ink text-sm block font-semibold">{partner.email}</strong>
            </div>
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Phone Number</span>
              <strong className="text-ink text-sm block font-semibold">{partner.phone || "—"}</strong>
            </div>
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Partnership Track</span>
              <strong className="text-ink text-sm block font-semibold">{partner.partnershipType || "Referral Partner"}</strong>
            </div>
            <div className="p-4 rounded-lg bg-canvas/60 border border-line space-y-1">
              <span className="text-ink-muted block text-[11px] font-medium">Business Type</span>
              <strong className="text-ink text-sm block font-semibold">{partner.businessType || "Digital Agency"}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
            <div className="font-semibold text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-4" /> Application Details Dispatched to Bytezora Sales
            </div>
            <p className="leading-relaxed text-ink-muted">
              Our sales and partnerships team has received your submission and notification email.
              Your details are currently under review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const referralCode = partner.referralCode || "";
  const shareUrl =
    partner.shareUrl || `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`;

  const tabs = [
    { key: "referrals" as const, label: "All Referrals", count: referrals.length, icon: Users },
    {
      key: "commissions" as const,
      label: "Commission History",
      count: commissions.length,
      icon: Coins,
    },
    { key: "guide" as const, label: "How It Works", count: null, icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Platform Header matching Admin & Client designs */}
      <PageHeader
        title="Partner Dashboard"
        description={`Welcome, ${partner.contactName} (${partner.companyName}). Share your referral link with clients to earn automated commissions.`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active Partner
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
              <Percent className="size-3.5" />
              {partner.commissionRate}% Commission Rate
            </span>
          </div>
        }
      />

      {/* REFERRAL LINK & CODE CARD (Clean, minimal, high utility) */}
      <div className="rounded-xl border border-line bg-surface p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Referral Link */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-brand/10 text-brand">
                <Sparkles className="size-3" /> Share &amp; Earn
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-ink">Your Unique Referral Link</h2>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
              Share this link with your customers or network. When they register and make a payment
              for website builder connects or hosting, you automatically receive{" "}
              <strong className="text-ink font-semibold">{partner.commissionRate}% commission</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 px-3.5 py-2 rounded-lg bg-canvas border border-line text-xs font-mono text-ink truncate flex items-center gap-2">
                <LinkIcon className="size-3.5 text-brand shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => copyLink(shareUrl)}
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-strong text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-4" /> Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy Referral Link
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Create stunning websites with AI! Sign up using my referral link: ${shareUrl}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Referral Code Box */}
          <div className="lg:border-l lg:border-line lg:pl-6 shrink-0 flex flex-col justify-center">
            <div className="p-4 rounded-xl bg-canvas border border-dashed border-brand/30 text-center space-y-2 min-w-[200px]">
              <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">
                Partner Referral Code
              </span>
              <div className="text-2xl font-mono font-bold text-brand tracking-widest">
                {referralCode || "—"}
              </div>
              <button
                type="button"
                onClick={() => copyCode(referralCode)}
                className="w-full px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-xs font-semibold text-ink flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <Users className="size-3.5 text-brand" /> Total Referrals
          </div>
          <div className="text-xl sm:text-2xl font-bold text-ink">{stats.totalReferrals}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-blue-500" /> Registered
          </div>
          <div className="text-xl sm:text-2xl font-bold text-ink">{stats.registeredCustomers}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Converted
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600">
            {stats.successfulConversions}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <Coins className="size-3.5 text-amber-500" /> Total Earned
          </div>
          <div className="text-lg sm:text-xl font-bold text-ink">
            {formatCurrency(stats.totalEarnedPaise)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-500" /> Pending Payout
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-600">
            {formatCurrency(stats.pendingCommissionPaise)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface space-y-1 shadow-xs">
          <div className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
            <Wallet className="size-3.5 text-emerald-500" /> Paid Out
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            {formatCurrency(stats.paidCommissionPaise)}
          </div>
        </div>
      </div>

      {/* TABS (Matching Admin tabs) */}
      <div className="flex items-center gap-1 border-b border-line pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-brand text-white shadow-xs"
                  : "text-ink-muted hover:text-ink hover:bg-canvas"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? "bg-white/25 text-white" : "bg-line text-ink-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Referrals Table */}
      {activeTab === "referrals" && (
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          {referrals.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
                <Users className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink">No referrals yet</h2>
              <p className="mt-1 text-sm text-ink-body">
                Share your unique referral link to start tracking customer signups and conversions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[50rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                    <th scope="col" className="px-5 py-3 font-medium">Referred Customer</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Registered Date</th>
                    <th scope="col" className="px-5 py-3 font-medium">Converted Date</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Customer Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-5 py-3.5 align-middle">
                        <div className="font-semibold text-ink">{ref.customerName}</div>
                        <div className="text-xs text-ink-muted">{ref.customerEmail}</div>
                      </td>
                      <td className="px-5 py-3.5 align-middle">
                        {ref.status === "CONVERTED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                            <CheckCircle2 className="size-3" /> Converted (Paid)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 whitespace-nowrap">
                            <Clock className="size-3" /> Registered
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-ink-body whitespace-nowrap text-xs">
                        {new Date(ref.registeredAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-ink-body whitespace-nowrap text-xs">
                        {ref.convertedAt
                          ? new Date(ref.convertedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-right font-semibold text-ink whitespace-nowrap">
                        {ref.totalSpentPaise > 0 ? formatCurrency(ref.totalSpentPaise) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Commissions Table */}
      {activeTab === "commissions" && (
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          {commissions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
                <Coins className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink">No commissions earned yet</h2>
              <p className="mt-1 text-sm text-ink-body">
                When a referred customer completes a payment for website builder connects or hosting,
                your commission will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[54rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                    <th scope="col" className="px-5 py-3 font-medium">Customer &amp; Source</th>
                    <th scope="col" className="px-5 py-3 font-medium">Order Amount</th>
                    <th scope="col" className="px-5 py-3 font-medium">Commission Rate</th>
                    <th scope="col" className="px-5 py-3 font-medium">Commission Earned</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {commissions.map((com) => (
                    <tr key={com.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-5 py-3.5 align-middle">
                        <div className="font-semibold text-ink">{com.customerName}</div>
                        <div className="text-xs text-ink-muted">
                          Source: {com.source.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-middle text-ink-body whitespace-nowrap text-xs">
                        {formatCurrency(com.orderAmountPaise)}
                      </td>
                      <td className="px-5 py-3.5 align-middle font-medium text-ink whitespace-nowrap text-xs">
                        {com.commissionRate}%
                      </td>
                      <td className="px-5 py-3.5 align-middle font-bold text-emerald-600 whitespace-nowrap text-xs">
                        +{formatCurrency(com.commissionAmountPaise)}
                      </td>
                      <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                        {com.status === "PAID" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" /> Paid Out
                          </span>
                        )}
                        {com.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <Check className="size-3" /> Approved
                          </span>
                        )}
                        {com.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Clock className="size-3" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 align-middle text-right text-ink-muted whitespace-nowrap text-xs">
                        {new Date(com.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: How It Works */}
      {activeTab === "guide" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-line bg-surface space-y-2 shadow-xs">
            <span className="size-7 rounded-full bg-brand-soft text-brand font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-semibold text-xs text-ink">Share Your Referral Link</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Share your link or code with businesses and creators who need high quality websites.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-surface space-y-2 shadow-xs">
            <span className="size-7 rounded-full bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-semibold text-xs text-ink">Customer Signs Up</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              When a visitor signs up through your link, our system automatically attributes them to
              your partner account.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-surface space-y-2 shadow-xs">
            <span className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-semibold text-xs text-ink">Customer Completes Payment</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Whenever your referred customer buys connects or hosting packages, your commission is
              calculated automatically.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-line bg-surface space-y-2 shadow-xs">
            <span className="size-7 rounded-full bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-semibold text-xs text-ink">Receive Your Payout</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Platform Admin reviews and transfers your commission payouts directly to your bank or
              UPI account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
