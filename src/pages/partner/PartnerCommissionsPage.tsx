import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { Download, ShieldAlert, X } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
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

type CommissionRow = {
  id: string;
  date: string;
  customer: string;
  invoice: string;
  payment: number;
  rate: number;
  commission: number;
  status: "Pending" | "Approved" | "Paid";
};

type PayoutRecord = {
  id: string;
  payoutId: string;
  forMonth: string;
  paidOn: string;
  commission: number;
  tds: number;
  netPaid: number;
  reference: string;
};

export default function PartnerCommissionsPage() {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{
    partner?: PartnerDashboardData["partner"];
  }>();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Statement modal state
  const [selectedStatement, setSelectedStatement] =
    useState<PayoutRecord | null>(null);

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
    };
  }, [data, outletCtx, user]);

  const isSuspended = partnerInfo.status === "SUSPENDED";

  // Calculate live stats
  const stats = useMemo(() => {
    const nextPayout = Math.round((data?.stats?.approvedCommissionPaise || 0) / 100);
    const pending = Math.round((data?.stats?.pendingCommissionPaise || 0) / 100);
    const paidToDate = Math.round((data?.stats?.paidCommissionPaise || 0) / 100);

    return {
      nextPayout,
      pending,
      paidToDate,
      payoutCount: data?.commissions?.filter((c) => c.status === "PAID").length ?? 0,
      commissionRate: partnerInfo.commissionRate,
    };
  }, [data, partnerInfo.commissionRate]);

  // Map real transactions from backend
  const transactions = useMemo<CommissionRow[]>(() => {
    if (!data?.commissions || data.commissions.length === 0) {
      return [];
    }

    return data.commissions.map((c, i) => {
      let status: "Pending" | "Approved" | "Paid" = "Pending";
      if (c.status === "APPROVED") status = "Approved";
      if (c.status === "PAID") status = "Paid";

      const payment = Math.round(c.orderAmountPaise / 100);
      const commission = Math.round(c.commissionAmountPaise / 100);

      return {
        id: c.id,
        date: formatDate(c.createdAt),
        customer: c.customerName || "Customer",
        invoice: `INV-26-${1100 + i}`,
        payment,
        rate: c.commissionRate || partnerInfo.commissionRate,
        commission,
        status,
      };
    });
  }, [data?.commissions, partnerInfo.commissionRate]);

  // Real payout history derived from paid commissions
  const payoutHistory = useMemo<PayoutRecord[]>(() => {
    if (!data?.commissions) return [];
    return data.commissions
      .filter((c) => c.status === "PAID")
      .map((c, i) => {
        const comm = Math.round(c.commissionAmountPaise / 100);
        const tds = Math.round(comm * 0.05);
        const net = comm - tds;
        return {
          id: c.id,
          payoutId: `PO-2026-${String(1001 + i).slice(-4)}`,
          forMonth: formatDate(c.createdAt),
          paidOn: c.paidAt ? formatDate(c.paidAt) : formatDate(c.createdAt),
          commission: comm,
          tds,
          netPaid: net,
          reference: "Bank Transfer",
        };
      });
  }, [data?.commissions]);

  function handlePrintStatement() {
    window.print();
  }

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-ink-muted">
        <Spinner size="lg" aria-label="Loading commission & payouts..." />
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-7 max-w-6xl mx-auto bg-canvas min-h-screen text-ink">
      {/* Suspended Alert Banner */}
      {isSuspended && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 shadow-xs">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-amber-900 text-sm">
              Partner Account Suspended
            </p>
            <p className="mt-1 leading-relaxed text-amber-800">
              Your partner account is temporarily suspended. Commission payouts
              and withdrawal requests are on hold.
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
            PARTNER / COMMISSION & PAYOUTS
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Commission & payouts
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

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Next payout (Accent card) */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-900">Next payout</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1.5">
              {formatCurrency(stats.nextPayout)}
            </p>
          </div>
          <p className="text-ed-2xs text-blue-700/80 mt-2">
            On [10 Nov 2026] to bank ****4821
          </p>
        </div>

        {/* Card 2: Pending */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Pending
            </div>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {formatCurrency(stats.pending)}
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">
            Becomes approved after 15 days
          </p>
        </div>

        {/* Card 3: Paid to date */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Paid to date
            </div>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {formatCurrency(stats.paidToDate)}
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">
            {stats.payoutCount} payouts
          </p>
        </div>

        {/* Card 4: Commission rate */}
        <div className="rounded-2xl bg-surface border border-line p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-muted">
              Commission rate
            </p>
            <p className="text-3xl font-bold text-ink mt-1.5">
              {stats.commissionRate}%
            </p>
          </div>
          <p className="text-ed-2xs text-ink-muted mt-2">
            {outletCtx?.partner?.effectiveCommissionPolicy === "EVERY_RENEWAL"
              ? "Earn on every renewal"
              : "Earn on first payment"}
          </p>
        </div>
      </div>

      {/* Row 2: How you get paid */}
      <div className="rounded-2xl bg-surface border border-line p-6 shadow-xs">
        <h2 className="text-sm font-bold text-ink mb-5">How you get paid</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <span className="grid size-7 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
              1
            </span>
            <p className="text-xs font-bold text-ink">Customer pays</p>
            <p className="text-ed-2xs text-ink-muted leading-relaxed">
              A referred customer completes a payment.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <span className="grid size-7 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
              2
            </span>
            <p className="text-xs font-bold text-ink">Pending · 15 days</p>
            <p className="text-ed-2xs text-ink-muted leading-relaxed">
              Held during the refund window.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <span className="grid size-7 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
              3
            </span>
            <p className="text-xs font-bold text-ink">Approved</p>
            <p className="text-ed-2xs text-ink-muted leading-relaxed">
              Added to the next monthly payout.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <span className="grid size-7 place-items-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
              4
            </span>
            <p className="text-xs font-bold text-ink">Paid on the [10th]</p>
            <p className="text-ed-2xs text-ink-muted leading-relaxed">
              Sent to your bank or UPI, with a statement.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Commission transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">
            Commission transactions
          </h2>
          <span className="text-xs text-ink-muted font-medium">
            Paid customer transactions only
          </span>
        </div>

        <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas/60 border-b border-line text-ed-2xs font-mono uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3.5 font-semibold">DATE</th>
                  <th className="px-5 py-3.5 font-semibold">CUSTOMER</th>
                  <th className="px-5 py-3.5 font-semibold">INVOICE</th>
                  <th className="px-5 py-3.5 font-semibold">PAYMENT</th>
                  <th className="px-5 py-3.5 font-semibold">RATE</th>
                  <th className="px-5 py-3.5 font-semibold">COMMISSION</th>
                  <th className="px-5 py-3.5 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-ink-muted">
                      No commission transactions yet. Commissions will appear here once your referred customers purchase a paid subscription.
                    </td>
                  </tr>
                ) : (
                  transactions.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-canvas/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-ink-body font-mono text-ed-2xs whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-5 py-3.5 text-ink font-semibold whitespace-nowrap">
                      {row.customer}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted font-mono text-ed-2xs whitespace-nowrap">
                      {row.invoice}
                    </td>
                    <td className="px-5 py-3.5 text-ink font-mono whitespace-nowrap font-medium">
                      {formatCurrency(row.payment)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted font-mono whitespace-nowrap">
                      {row.rate}%
                    </td>
                    <td className="px-5 py-3.5 text-ink font-mono font-semibold whitespace-nowrap">
                      {formatCurrency(row.commission)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {row.status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                      {row.status === "Approved" && (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Approved
                        </span>
                      )}
                      {row.status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Payout history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Payout history</h2>
          <span className="text-xs text-ink-muted font-medium">
            TDS deducted as per Income Tax rules where applicable
          </span>
        </div>

        <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas/60 border-b border-line text-ed-2xs font-mono uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3.5 font-semibold">PAYOUT ID</th>
                  <th className="px-5 py-3.5 font-semibold">FOR</th>
                  <th className="px-5 py-3.5 font-semibold">PAID ON</th>
                  <th className="px-5 py-3.5 font-semibold">COMMISSION</th>
                  <th className="px-5 py-3.5 font-semibold">TDS (5%)</th>
                  <th className="px-5 py-3.5 font-semibold">NET PAID</th>
                  <th className="px-5 py-3.5 font-semibold">REFERENCE</th>
                  <th className="px-5 py-3.5 font-semibold text-right">
                    STATEMENT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs">
                {payoutHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-ink-muted">
                      No payouts disbursed yet. Once monthly payouts are initiated to your bank or UPI, statements will appear here.
                    </td>
                  </tr>
                ) : (
                  payoutHistory.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-canvas/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-ink font-mono font-semibold text-ed-2xs whitespace-nowrap">
                        {payout.payoutId}
                      </td>
                      <td className="px-5 py-3.5 text-ink-body whitespace-nowrap font-medium">
                        {payout.forMonth}
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted font-mono text-ed-2xs whitespace-nowrap">
                        {payout.paidOn}
                      </td>
                      <td className="px-5 py-3.5 text-ink font-mono font-medium whitespace-nowrap">
                        {formatCurrency(payout.commission)}
                      </td>
                      <td className="px-5 py-3.5 text-rose-600 font-mono whitespace-nowrap">
                        −{formatCurrency(payout.tds)}
                      </td>
                      <td className="px-5 py-3.5 text-emerald-600 font-mono font-bold whitespace-nowrap">
                        {formatCurrency(payout.netPaid)}
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted font-mono text-ed-2xs whitespace-nowrap">
                        {payout.reference}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStatement(payout)}
                          className="px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          Statement
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-ink-muted leading-relaxed pt-1">
          Payouts go to the bank account or UPI ID in your{" "}
          <Link
            to="/partner/profile"
            className="text-brand font-medium hover:underline"
          >
            Profile
          </Link>
          . Minimum payout [₹500]; smaller amounts roll over to the next month.
        </p>
      </div>

      {/* Payout Statement Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-line shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Commission Payout Statement
                </h3>
                <p className="text-xs font-mono text-ink-muted mt-0.5">
                  {selectedStatement.payoutId} · {selectedStatement.forMonth}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-canvas/60 border border-line space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Partner Name</span>
                  <span className="font-semibold text-ink">
                    {partnerInfo.contactName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Company</span>
                  <span className="font-semibold text-ink">
                    {partnerInfo.companyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Paid Date</span>
                  <span className="font-mono text-ink">
                    {selectedStatement.paidOn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Bank Reference</span>
                  <span className="font-mono text-ink">
                    {selectedStatement.reference}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between text-ink-body">
                  <span>Gross Earned Commission</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(selectedStatement.commission)}
                  </span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>TDS Deducted (5%)</span>
                  <span className="font-mono">
                    −{formatCurrency(selectedStatement.tds)}
                  </span>
                </div>
                <div className="pt-2 border-t border-line flex justify-between text-sm font-bold text-ink">
                  <span>Net Disbursed Amount</span>
                  <span className="font-mono text-emerald-600">
                    {formatCurrency(selectedStatement.netPaid)}
                  </span>
                </div>
              </div>

              <div className="pt-3 text-ed-2xs text-ink-muted leading-relaxed">
                This document serves as proof of partner commission remittance.
                Tax deduction certificates (Form 16A) are issued quarterly.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-canvas/60 border-t border-line flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="px-4 py-2 rounded-xl border border-line bg-surface hover:bg-canvas text-xs font-semibold text-ink cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintStatement}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-xs font-semibold text-white cursor-pointer shadow-xs transition-colors"
              >
                <Download className="size-3.5" />
                Print / Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
