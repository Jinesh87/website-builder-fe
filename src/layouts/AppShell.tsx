import { useState } from "react";
import { Button } from "@heroui/react";
import { LogOut, type LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/auth-context.ts";
import BrandLogo from "../components/BrandLogo.tsx";

export type ShellNavItem = {
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number | string; variant?: "glossy" | "gradient" | "solid" | "current" }>;
  /** Omit for sections that aren't built yet; they render as disabled. */
  to?: string;
  end?: boolean;
  /** Extra path prefixes that also mark this item active (e.g. detail pages). */
  activePrefixes?: string[];
};

type AppShellProps = {
  tone: "light" | "dark";
  nav: ShellNavItem[];
  roleLabel: string;
  /** Small caption under the logo (e.g. "Super Admin"). */
  caption?: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AppShell({ tone, nav, roleLabel, caption }: AppShellProps) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const dark = tone === "dark";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? dark
          ? "bg-white/10 font-medium text-white"
          : "bg-brand-soft font-medium text-brand"
        : dark
          ? "text-white/70 hover:bg-white/5 hover:text-white"
          : "text-ink-body hover:bg-canvas hover:text-ink"
    }`;

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside
        className={`flex h-full w-64 shrink-0 flex-col border-r px-3 py-5 ${
          dark ? "border-transparent bg-ink text-white" : "border-line bg-surface"
        }`}
      >
        <div className="shrink-0 px-2">
          <BrandLogo tone={dark ? "light" : "dark"} />
          {caption && (
            <p
              className={`mt-2 font-mono text-[10px] uppercase tracking-[0.2em] ${
                dark ? "text-white/50" : "text-ink-muted"
              }`}
            >
              {caption}
            </p>
          )}
        </div>

        <nav aria-label="Main" className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {nav.map(({ label, icon: Icon, to, end, activePrefixes }) =>
            to ? (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) =>
                  linkClass({
                    isActive: isActive || (activePrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false),
                  })
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </NavLink>
            ) : (
              <span
                key={label}
                aria-disabled="true"
                title="Coming soon"
                className={`flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  dark ? "text-white/35" : "text-ink-muted/70"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
                <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider">Soon</span>
              </span>
            ),
          )}
        </nav>

        {user && (
          <div className={`mt-auto shrink-0 flex items-center gap-3 border-t px-2 pt-4 ${dark ? "border-white/10" : "border-line"}`}>
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                dark ? "bg-white/10 text-white" : "bg-canvas text-ink-body"
              }`}
              aria-hidden
            >
              {initials(user.fullName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${dark ? "text-white" : "text-ink"}`}>{user.fullName}</p>
              <p className={`truncate text-xs ${dark ? "text-white/50" : "text-ink-muted"}`}>{roleLabel}</p>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Log out"
              isPending={signingOut}
              onPress={handleLogout}
              className={dark ? "text-white/70 hover:text-white" : undefined}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
