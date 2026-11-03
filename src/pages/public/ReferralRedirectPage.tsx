import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveReferralCode } from "../../utils/referral.ts";

export default function ReferralRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      saveReferralCode(code);
      navigate(`/signup?ref=${encodeURIComponent(code)}`, { replace: true });
    } else {
      navigate("/signup", { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-canvas text-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-xs text-ink-muted">Redirecting you to sign up...</p>
      </div>
    </div>
  );
}

