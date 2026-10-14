import type { ReactNode } from "react";

const ICONS = {
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  check: (
    <>
      <path d="M5 12l5 5 9-10" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-2 0-3 3 0 4-1 3-2 3-4c0-4.5-4-8-9-8z" />
      <circle cx="7.5" cy="11" r="1.3" />
      <circle cx="10.5" cy="7.5" r="1.3" />
      <circle cx="15" cy="7.5" r="1.3" />
    </>
  ),
  devices: (
    <>
      <rect x="2" y="5" width="14" height="10" rx="1" />
      <rect x="17" y="8" width="5" height="11" rx="1" />
      <path d="M6 19h6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.8" />
      <path d="M21 16l-5-5-9 9" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  layout: (
    <>
      <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M17 14.5c3 0 5 1.8 5 4.5" />
    </>
  ),
  bolt: (
    <>
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H8l-4 4z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 015 .5c0 1.7-2.5 2-2.5 3.5M12 17h.01" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 11l4-4 5 3 5-3 4 4-9 8z" />
      <path d="M8 13l2 2M11 12l3 3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
