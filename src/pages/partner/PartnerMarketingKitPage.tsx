import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { partnerApi, type PartnerDashboardData } from "../../api/partner.ts";
import { useAuth } from "../../auth/auth-context.ts";
import { renderQRCodeDataUrl } from "../../utils/qr-generator.ts";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "size-4"}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function PartnerMarketingKitPage() {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{ partner?: PartnerDashboardData["partner"] }>();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Copy state trackers
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

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
      contactName: data?.partner?.contactName || outletCtx?.partner?.contactName || user?.fullName || "Partner",
      companyName: data?.partner?.companyName || outletCtx?.partner?.companyName || "Your Company",
      referralCode: data?.partner?.referralCode || outletCtx?.partner?.referralCode || "",
      status: data?.partner?.status || outletCtx?.partner?.status || "APPROVED",
      suspensionReason: data?.partner?.suspensionReason || outletCtx?.partner?.suspensionReason || null,
    };
  }, [data, outletCtx, user]);

  const isSuspended = partnerInfo.status === "SUSPENDED";
  const brandOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://yourbrand.com";
  const brandName = "Bytezora";
  const referralUrl = `${brandOrigin}/r/${partnerInfo.referralCode}`;

  // Generate QR Code data URL dynamically
  const qrCodeDataUrl = useMemo(() => {
    return renderQRCodeDataUrl(referralUrl, 320, 2);
  }, [referralUrl]);

  function handleCopy(text: string, type: "link" | "code" | "whatsapp" | "social" | "email") {
    if (isSuspended) return;
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedMsg(type);
      setTimeout(() => setCopiedMsg(null), 2000);
    }
  }

  function handleDownloadQr() {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `partner-qr-${partnerInfo.referralCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleShareWhatsApp() {
    if (isSuspended) return;
    const text = encodeURIComponent(
      `Hi! I use ${brandName} to build business websites. It's simple and affordable. Sign up with my link and get started today:\n${referralUrl}\n(Or enter referral code ${partnerInfo.referralCode} at checkout)`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleShareLinkedIn() {
    if (isSuspended) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, "_blank");
  }

  // Canvas banner downloader
  function handleDownloadBanner(type: "post" | "story" | "banner") {
    const canvas = document.createElement("canvas");
    let width = 1080;
    let height = 1080;

    if (type === "story") {
      width = 1080;
      height = 1920;
    } else if (type === "banner") {
      width = 1200;
      height = 628;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#2563EB");
    grad.addColorStop(0.5, "#1D4ED8");
    grad.addColorStop(1, "#1E3A8A");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative glow circle
    const glowGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 50, width * 0.85, height * 0.15, width * 0.6);
    glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
    glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, width * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Text styling based on layout
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "middle";

    if (type === "story") {
      ctx.textAlign = "center";
      ctx.font = "bold 72px sans-serif";
      ctx.fillText("Get your business", width / 2, height * 0.35);
      ctx.fillText("online today", width / 2, height * 0.40);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "38px sans-serif";
      ctx.fillText("Websites with WhatsApp, forms & payments", width / 2, height * 0.46);

      const pillW = 600;
      const pillH = 220;
      const pillX = (width - pillW) / 2;
      const pillY = height * 0.58;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 28);
      ctx.fill();

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 26px monospace";
      ctx.fillText("USE MY CODE", width / 2, pillY + 65);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 64px monospace";
      ctx.fillText(partnerInfo.referralCode, width / 2, pillY + 145);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(brandName, width / 2, height * 0.88);
    } else if (type === "banner") {
      ctx.textAlign = "left";
      ctx.font = "bold 48px sans-serif";
      ctx.fillText("Get your business online today", 80, height * 0.28);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "24px sans-serif";
      ctx.fillText("Websites with WhatsApp, forms & payments", 80, height * 0.40);

      const pillW = 420;
      const pillH = 140;
      const pillX = 80;
      const pillY = height * 0.52;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 20);
      ctx.fill();

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 16px monospace";
      ctx.fillText("USE MY CODE", pillX + 35, pillY + 45);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 44px monospace";
      ctx.fillText(partnerInfo.referralCode, pillX + 35, pillY + 95);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(brandName, 80, height * 0.88);
    } else {
      ctx.textAlign = "left";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText("Get your business", 90, height * 0.28);
      ctx.fillText("online today", 90, height * 0.35);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "30px sans-serif";
      ctx.fillText("Websites with WhatsApp, forms & payments", 90, height * 0.44);

      const pillW = 480;
      const pillH = 160;
      const pillX = 90;
      const pillY = height * 0.58;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 24);
      ctx.fill();

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 20px monospace";
      ctx.fillText("USE MY CODE", pillX + 40, pillY + 50);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 52px monospace";
      ctx.fillText(partnerInfo.referralCode, pillX + 40, pillY + 110);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "36px sans-serif";
      ctx.fillText(brandName, 90, height * 0.88);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bytezora-creative-${type}-${partnerInfo.referralCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Pre-formatted messages
  const whatsappMsgText = `Hi! I use ${brandName} to build business websites. It's simple and affordable. Sign up with my link and get started today:\n${referralUrl}`;

  const socialCaptionText = `Need a website for your business? 🌐 Build it in a day with ${brandName}: no coding, mobile-ready, with WhatsApp and enquiry forms built in. Use code ${partnerInfo.referralCode} or the link in my bio.`;

  const clientEmailText = `Subject: A simple way to get your business online\n\nHi,\n\nAs we discussed, ${brandName} lets you create and manage your own business website, with enquiry forms, WhatsApp and online payments.\n\nYou can sign up here: ${referralUrl}\n\nHappy to help you set it up.\n\nRegards,\n${partnerInfo.contactName}\n${partnerInfo.companyName}`;

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh] text-ink-muted">
        <Spinner size="lg" aria-label="Loading marketing kit..." />
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
              Your partner account is temporarily suspended. Referral tracking and marketing link attribution are inactive.
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
            PARTNER / MARKETING KIT
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Marketing kit
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

      {/* Row 1: Link & Code Box (Left) + QR Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Your link & code */}
        <div className="lg:col-span-7 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink mb-4">
              Your link & code
            </h2>

            {/* Referral Link Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-canvas border border-line">
                <span className="font-mono text-xs text-brand truncate flex-1 select-all font-medium">
                  {referralUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(referralUrl, "link")}
                  disabled={isSuspended}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-ink-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Referral Code Box */}
              <div className="flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-canvas border border-line">
                <span className="font-mono text-xs font-bold text-ink tracking-wider truncate flex-1 select-all">
                  {partnerInfo.referralCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(partnerInfo.referralCode, "code")}
                  disabled={isSuspended}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {copiedCode ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-ink-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-muted leading-relaxed">
              Customers can click your link, or type your code at checkout. Both are tracked to you.
            </p>
          </div>

          {/* Quick share buttons */}
          <div className="mt-6 pt-5 border-t border-line flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isSuspended}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <MessageCircle className="size-4 text-emerald-600" />
              Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleShareLinkedIn}
              disabled={isSuspended}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <LinkedinIcon className="size-4 text-blue-600" />
              Share on LinkedIn
            </button>
          </div>
        </div>

        {/* Right Card: QR code */}
        <div className="lg:col-span-5 rounded-2xl bg-surface border border-line p-6 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h2 className="text-sm font-bold text-ink mb-4">
              QR code
            </h2>
          </div>

          {/* QR Code Container */}
          <div className="my-2 p-3.5 rounded-2xl bg-canvas border border-line shadow-xs inline-flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR code for ${referralUrl}`}
                className="size-44 object-contain rounded-lg"
              />
            ) : (
              <div className="size-44 grid place-items-center bg-slate-100 text-ink-muted rounded-lg">
                <QrCode className="size-12" />
              </div>
            )}
          </div>

          <div className="w-full mt-3">
            <p className="text-xs text-ink-muted">
              Print it on visiting cards, flyers or your shop counter.
            </p>

            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={isSuspended || !qrCodeDataUrl}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Download className="size-3.5" />
              Download QR (PNG)
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Ready-to-send messages */}
      <div className="rounded-2xl bg-surface border border-line p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-ink">
          Ready-to-send messages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WhatsApp message */}
          <div className="rounded-xl bg-canvas/70 border border-line p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-line mb-3">
                <span className="text-xs font-bold text-ink">WhatsApp message</span>
                <button
                  type="button"
                  onClick={() => handleCopy(whatsappMsgText, "whatsapp")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  {copiedMsg === "whatsapp" ? (
                    <span className="text-emerald-600">Copied</span>
                  ) : (
                    <>
                      <Copy className="size-3 text-ink-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-ink-body leading-relaxed">
                Hi! I use {brandName} to build business websites. It's simple and affordable. Sign up with my link and get started today:
                <br />
                <span className="font-mono text-brand block mt-1 break-all font-medium">{referralUrl}</span>
              </p>
            </div>
          </div>

          {/* Instagram / Facebook caption */}
          <div className="rounded-xl bg-canvas/70 border border-line p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-line mb-3">
                <span className="text-xs font-bold text-ink">Instagram / Facebook caption</span>
                <button
                  type="button"
                  onClick={() => handleCopy(socialCaptionText, "social")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  {copiedMsg === "social" ? (
                    <span className="text-emerald-600">Copied</span>
                  ) : (
                    <>
                      <Copy className="size-3 text-ink-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-ink-body leading-relaxed">
                Need a website for your business? 🌐 Build it in a day with {brandName}: no coding, mobile-ready, with WhatsApp and enquiry forms built in. Use code <span className="font-mono font-bold text-ink">{partnerInfo.referralCode}</span> or the link in my bio.
              </p>
            </div>
          </div>

          {/* Email to a client */}
          <div className="rounded-xl bg-canvas/70 border border-line p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-line mb-3">
                <span className="text-xs font-bold text-ink">Email to a client</span>
                <button
                  type="button"
                  onClick={() => handleCopy(clientEmailText, "email")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  {copiedMsg === "email" ? (
                    <span className="text-emerald-600">Copied</span>
                  ) : (
                    <>
                      <Copy className="size-3 text-ink-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-ink-body leading-relaxed space-y-2">
                <p className="font-semibold text-ink">Subject: A simple way to get your business online</p>
                <p>Hi,</p>
                <p>As we discussed, {brandName} lets you create and manage your own business website, with enquiry forms, WhatsApp and online payments.</p>
                <p>You can sign up here: <span className="font-mono text-brand break-all font-medium">{referralUrl}</span></p>
                <p>Happy to help you set it up.</p>
                <p className="pt-1 text-ink-muted">
                  Regards,<br />
                  {partnerInfo.contactName}<br />
                  {partnerInfo.companyName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Banners & creatives */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-ink">
            Banners & creatives
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Your code is already added to each design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Creative 1: Instagram post (1080 x 1080) */}
          <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Graphic Preview */}
            <div className="aspect-square bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 sm:p-7 text-white flex flex-col justify-between relative overflow-hidden select-none">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div>
                <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  Get your business<br />online today
                </h3>
                <p className="text-xs text-blue-100/90 mt-2 font-medium">
                  Websites with WhatsApp, forms & payments
                </p>
              </div>

              <div>
                <div className="bg-white rounded-xl p-3 text-slate-900 max-w-[200px] shadow-sm">
                  <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    USE MY CODE
                  </p>
                  <p className="font-mono text-lg font-black text-slate-900 tracking-wider mt-0.5">
                    {partnerInfo.referralCode}
                  </p>
                </div>
                <p className="font-bold text-xs text-blue-200/90 mt-4 tracking-wide">
                  {brandName}
                </p>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-4 bg-surface border-t border-line flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink">Instagram post</p>
                <p className="text-[11px] text-ink-muted">1080 × 1080 px</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadBanner("post")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer shadow-xs"
              >
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Creative 2: Story / WhatsApp status (1080 x 1920) */}
          <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Graphic Preview */}
            <div className="aspect-[9/16] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 text-white flex flex-col justify-between relative overflow-hidden select-none">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="pt-6">
                <h3 className="text-xl font-black leading-tight tracking-tight">
                  Get your business<br />online today
                </h3>
                <p className="text-xs text-blue-100/90 mt-2 font-medium">
                  Websites with WhatsApp, forms & payments
                </p>
              </div>

              <div className="pb-4">
                <div className="bg-white rounded-xl p-3 text-slate-900 max-w-[200px] shadow-sm">
                  <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    USE MY CODE
                  </p>
                  <p className="font-mono text-lg font-black text-slate-900 tracking-wider mt-0.5">
                    {partnerInfo.referralCode}
                  </p>
                </div>
                <p className="font-bold text-xs text-blue-200/90 mt-4 tracking-wide">
                  {brandName}
                </p>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-4 bg-surface border-t border-line flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink">Story / WhatsApp status</p>
                <p className="text-[11px] text-ink-muted">1080 × 1920 px</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadBanner("story")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer shadow-xs"
              >
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Creative 3: Website banner (1200 x 628) */}
          <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Graphic Preview */}
            <div className="aspect-[1200/628] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 text-white flex flex-col justify-between relative overflow-hidden select-none">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div>
                <h3 className="text-xl font-black leading-tight tracking-tight">
                  Get your business online today
                </h3>
                <p className="text-xs text-blue-100/90 mt-1.5 font-medium">
                  Websites with WhatsApp, forms & payments
                </p>
              </div>

              <div>
                <div className="bg-white rounded-xl p-2.5 px-3.5 text-slate-900 max-w-[210px] shadow-sm">
                  <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    USE MY CODE
                  </p>
                  <p className="font-mono text-base font-black text-slate-900 tracking-wider mt-0.5">
                    {partnerInfo.referralCode}
                  </p>
                </div>
                <p className="font-bold text-xs text-blue-200/90 mt-3 tracking-wide">
                  {brandName}
                </p>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-4 bg-surface border-t border-line flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink">Website banner</p>
                <p className="text-[11px] text-ink-muted">1200 × 628 px</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadBanner("banner")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors cursor-pointer shadow-xs"
              >
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Do and Don't Guideline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Do Card */}
        <div className="rounded-2xl bg-surface border border-line p-6 shadow-xs">
          <h2 className="text-sm font-bold text-ink mb-4">
            Do
          </h2>
          <ul className="space-y-3 text-xs text-ink-body leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
              <span>Share your link with businesses you know or work with.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
              <span>Explain features and prices honestly.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
              <span>Use the official banners and messages from this kit.</span>
            </li>
          </ul>
        </div>

        {/* Don't Card */}
        <div className="rounded-2xl bg-surface border border-line p-6 shadow-xs">
          <h2 className="text-sm font-bold text-ink mb-4">
            Don't
          </h2>
          <ul className="space-y-3 text-xs text-ink-body leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
              <span>Send unsolicited bulk messages or spam.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
              <span>Run ads on "{brandName}" search keywords.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
              <span>Use your own code for your own purchases.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
              <span>Promise discounts or features we don't offer.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
