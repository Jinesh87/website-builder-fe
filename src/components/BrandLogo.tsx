import { Link } from "react-router-dom";
import { env } from "../config/env.ts";

type BrandLogoProps = {
  /** "dark" = dark text on light bg; "light" = white text on dark bg. */
  tone?: "dark" | "light";
};

export default function BrandLogo({ tone = "dark" }: BrandLogoProps) {
  const src =
    tone === "light"
      ? "/bytezora-webbuilder-logo-white-text.png"
      : "/bytezora-webbuilder-logo.png";

  return (
    <Link to="/" className="inline-flex items-center" aria-label={`${env.appName} home`}>
      <img
        src={src}
        alt={env.appName}
        width={360}
        height={96}
        className="h-24 w-auto max-w-[min(400px,80vw)] object-contain"
      />
    </Link>
  );
}
