import { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronDown, LogOut, type LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/auth-context.ts";
import BrandLogo from "../components/BrandLogo.tsx";
import NotificationBell from "../components/app/NotificationBell.tsx";
import { useCollapsedNav } from "./useCollapsedNav.ts";

export type ShellNavItem = {
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number | string; variant?: "glossy" | "gradient" | "solid" | "current" }>;
  /** Omit for sections that aren't built yet; they render as disabled. */
  to?: string;
  end?: boolean;
  /** Extra path prefixes that also mark this item active (e.g. detail pages). */
  activePrefixes?: string[];
  /** Count of items waiting for attention; hidden when zero. */
  badge?: number;
  badgeTone?: "brand" | "amber";
  children?: ShellNavChild[];
  /** Sub-links show all the time with a chevron to fold them away (remembered per browser). */
  collapsible?: boolean;
};

export type ShellNavChild = {
  label: string;
  /** Page path with the query that picks the view, e.g. "/shop?section=orders". */
  to: string;
  /** Active when the page is open without that query (the page's default view). */
  isDefault?: boolean;
};

/** Sub-link is active when the path matches and every query value in its link is in the address. */
function isChildActive(child: ShellNavChild, pathname: string, search: URLSearchParams): boolean {
  const [path, query = ""] = child.to.split("?");
  if (pathname !== path) return false;
  return [...new URLSearchParams(query)].every(([key, value]) =>
    search.has(key) ? search.get(key) === value : Boolean(child.isDefault),
  );
}

/** On the same page, keep the rest of the address (e.g. the chosen website) and swap only the link's own values. */
function childHref(child: ShellNavChild, pathname: string, search: URLSearchParams): string {
  const [path, query = ""] = child.to.split("?");
  if (pathname !== path) return child.to;
  const next = new URLSearchParams(search);
  for (const [key, value] of new URLSearchParams(query)) next.set(key, value);
  return `${path}?${next.toString()}`;
}

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
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [signingOut, setSigningOut] = useState(false);
  const collapsedNav = useCollapsedNav();
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
    <div className="fixed inset-0 flex overflow-hidden bg-canvas text-ink" data-theme="light">
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
          {nav.map(({ label, icon: Icon, to, end, activePrefixes, badge, badgeTone, children, collapsible }) => {
            const isSelfOrChildActive =
              (to ? (end ? pathname === to : pathname.startsWith(to)) : false) ||
              (activePrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false);
            const foldable = Boolean(children?.length && collapsible);
            const folded = foldable && collapsedNav.isCollapsed(label);
            const showChildren = Boolean(children) && (foldable ? !folded : isSelfOrChildActive);

            return (
              <div key={label} className="relative flex flex-col gap-0.5">
                {foldable && (
                  <button
                    type="button"
                    onClick={() => collapsedNav.toggle(label)}
                    aria-expanded={!folded}
                    aria-label={folded ? `Show ${label} links` : `Hide ${label} links`}
                    title={folded ? "Expand" : "Collapse"}
                    className={`absolute right-1 top-1 z-10 grid size-7 cursor-pointer place-items-center rounded-md transition-colors ${
                      dark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <ChevronDown className={`size-4 transition-transform ${folded ? "-rotate-90" : ""}`} aria-hidden />
                  </button>
                )}
                {to ? (
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `${linkClass({
                        isActive: isActive || isSelfOrChildActive,
                      })}${foldable ? " pr-9" : ""}`
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{label}</span>
                    {badge ? (
                      <span
                        className={`ml-auto min-w-5 shrink-0 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 text-white ${
                          badgeTone === "amber"
                            ? "bg-amber-600 text-amber-50"
                            : "bg-brand text-white"
                        }`}
                      >
                        {badge > 99 ? "99+" : badge}
                        <span className="sr-only"> new</span>
                      </span>
                    ) : null}
                  </NavLink>
                ) : (
                  <span
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
                )}

                {children && showChildren && (
                  <div className={`ml-6 flex flex-col gap-0.5 border-l pl-3 pt-0.5 pb-1 ${dark ? "border-white/10" : "border-line"}`}>
                    {children.map((sub) => {
                      const isSubActive = isChildActive(sub, pathname, searchParams);

                      return (
                        <NavLink
                          key={sub.to}
                          to={childHref(sub, pathname, searchParams)}
                          className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                            isSubActive
                              ? dark
                                ? "bg-white/10 font-semibold text-white"
                                : "bg-brand-soft font-semibold text-brand"
                              : dark
                                ? "text-white/60 hover:text-white hover:bg-white/5"
                                : "text-ink-muted hover:text-ink hover:bg-canvas"
                          }`}
                        >
                          {sub.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
            <NotificationBell dark={dark} />
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

      <main className="min-w-0 flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
