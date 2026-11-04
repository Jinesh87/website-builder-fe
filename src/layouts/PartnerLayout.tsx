import { useEffect, useState } from "react";
import {
  BadgePercent,
  Gift,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { partnerApi, type PartnerDashboardData } from "../api/partner.ts";
import { useAuth } from "../auth/auth-context.ts";
import BrandLogo from "../components/BrandLogo.tsx";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PartnerLayout() {
  const { user, logout } = useAuth();
  const { pathname, hash } = useLocation();
  const [partnerData, setPartnerData] = useState<
    PartnerDashboardData["partner"] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    partnerApi
      .getDashboard()
      .then((res) => {
        if (!cancelled && res?.partner) {
          setPartnerData(res.partner);
        }
      })
      .catch(() => {
        // Fallback or unauthenticated handled by guards
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contactName = partnerData?.contactName || user?.fullName || "Partner";
  const companyName = partnerData?.companyName || "Partner Account";

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/partner/dashboard",
      exact: true,
    },
    { label: "Referrals", icon: Users, to: "/partner/referrals" },
    {
      label: "Commission & payouts",
      icon: BadgePercent,
      to: "/partner/commissions",
    },
    { label: "Marketing kit", icon: Gift, to: "/partner/marketing" },
    { label: "Profile", icon: Settings, to: "/partner/profile" },
  ];

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-canvas text-ink [color-scheme:light]">
      {/* Sidebar */}
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800/80 bg-[#0D111C] px-3.5 py-5 select-none">
        {/* Brand & Partner Label */}
        <div className="shrink-0 px-2.5">
          <BrandLogo tone="light" />
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Partner
          </p>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Partner Navigation"
          className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto pr-1"
        >
          {navItems.map((item) => {
            const isDashboard = item.exact;
            const isActive = isDashboard
              ? pathname === "/partner/dashboard" &&
                (!hash || hash === "#dashboard")
              : item.to === "/partner/referrals"
                ? pathname === "/partner/referrals" || hash === "#referrals"
                : item.to === "/partner/commissions"
                  ? pathname === "/partner/commissions" ||
                    hash === "#commissions"
                  : item.to === "/partner/marketing"
                    ? pathname === "/partner/marketing" || hash === "#marketing"
                    : item.to === "/partner/profile"
                      ? pathname === "/partner/profile" || hash === "#profile"
                      : pathname === item.to;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#162033] text-white font-semibold shadow-xs border border-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <item.icon
                  className={`size-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Pill */}
        <div className="mt-auto shrink-0 pt-4 border-t border-slate-800/80 px-1">
          <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#121826] border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white border border-slate-700 font-mono"
                aria-hidden
              >
                {initials(contactName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white leading-tight">
                  {contactName}
                </p>
                <p className="truncate text-ed-2xs text-slate-400 leading-tight mt-0.5">
                  {companyName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign out of Partner Portal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area: Always Light Mode */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-canvas text-ink">
        <Outlet context={{ partner: partnerData }} />
      </main>
    </div>
  );
}
