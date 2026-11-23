import type { ReactNode } from "react";

const bar = (width: string, tone = "bg-zinc-300", height = "h-1") => <div className={`${height} ${width} rounded-full ${tone}`} />;
const logo = <div className="h-2 w-6 rounded-sm bg-zinc-400" />;
const phone = (
  <div className="flex items-center gap-0.5">
    <div className="size-2 rounded-full bg-brand/70" />
    {bar("w-5", "bg-zinc-500")}
  </div>
);
const button = <div className="h-1.5 w-4 rounded-sm bg-brand/70" />;
const nav = (
  <div className="flex items-center gap-1">
    {bar("w-2")}
    {bar("w-2")}
    {bar("w-2")}
  </div>
);

/** Section-library thumbnails for the phone-first header presets. */
export const CONTACT_HEADER_SKELETONS: Record<string, ReactNode> = {
  "header-contact-topbar": (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-1.5 bg-brand/70 px-2 py-0.5">
        {bar("w-5", "bg-white/80")}
        {bar("w-6", "bg-white/60")}
        {bar("w-4", "bg-white/60")}
      </div>
      <div className="flex flex-1 items-center justify-between px-2">
        {logo}
        {nav}
        {button}
      </div>
    </div>
  ),
  "header-call-now": (
    <div className="flex h-full w-full items-center justify-between px-2">
      {logo}
      {nav}
      <div className="flex items-center gap-1">
        {phone}
        {button}
      </div>
    </div>
  ),
  "header-contact-stacked": (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 items-center justify-between px-2">
        {logo}
        <div className="flex items-center gap-1.5">
          {phone}
          {phone}
        </div>
      </div>
      <div className="flex items-center justify-between bg-brand/70 px-2 py-1">
        <div className="flex items-center gap-1">
          {bar("w-2", "bg-white/80")}
          {bar("w-2", "bg-white/80")}
          {bar("w-2", "bg-white/80")}
        </div>
        <div className="h-1.5 w-4 rounded-sm bg-white/90" />
      </div>
    </div>
  ),
  "header-centered-phone": (
    <div className="flex h-full w-full flex-col justify-center gap-1 px-2">
      <div className="flex items-center justify-between">
        {phone}
        {logo}
        {button}
      </div>
      <div className="flex justify-center border-t border-zinc-200 pt-1">{nav}</div>
    </div>
  ),
};
