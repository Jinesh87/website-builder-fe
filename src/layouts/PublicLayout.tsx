import { Outlet } from "react-router-dom";
import { MarketingFooter, MarketingHeader } from "../pages/marketing/MarketingLayout.tsx";

/** Non-marketing public pages (template detail, 404) framed by the marketing header and footer. */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mk contents">
        <MarketingHeader />
      </div>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <div className="mk contents">
        <MarketingFooter />
      </div>
    </div>
  );
}
