import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Spinner } from "@heroui/react";
import AuthProvider from "./auth/AuthProvider.tsx";
import { GuestOnly, RequireAuth } from "./auth/RouteGuards.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import ClientLayout from "./layouts/ClientLayout.tsx";
import PublicLayout from "./layouts/PublicLayout.tsx";
import RoleLayout from "./layouts/RoleLayout.tsx";

// Route-level code-splitting (Lazy loading)
const LandingPage = lazy(() => import("./pages/public/LandingPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));
const TemplateDetailPage = lazy(() => import("./pages/public/TemplateDetailPage.tsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.tsx"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage.tsx"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage.tsx"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage.tsx"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage.tsx"));
const DashboardPage = lazy(() => import("./pages/client/DashboardPage.tsx"));
const MyWebsitesPage = lazy(() => import("./pages/client/MyWebsitesPage.tsx"));
const AccountSettingsPage = lazy(() => import("./pages/client/AccountSettingsPage.tsx"));
const WalletPage = lazy(() => import("./pages/client/WalletPage.tsx"));
const MediaLibraryPage = lazy(() => import("./pages/media/MediaLibraryPage.tsx"));
const CreateWebsitePage = lazy(() => import("./pages/websites/CreateWebsitePage.tsx"));
const WebsitePreviewPage = lazy(() => import("./pages/websites/WebsitePreviewPage.tsx"));
const ProjectDashboardPage = lazy(() => import("./pages/websites/ProjectDashboardPage.tsx"));
const BuilderRoute = lazy(() => import("./features/builder/BuilderRoute.tsx"));

// Admin pages
const ClientsPage = lazy(() => import("./pages/admin/ClientsPage.tsx"));
const ClientFormPage = lazy(() => import("./pages/admin/ClientFormPage.tsx"));
const AllWebsitesPage = lazy(() => import("./pages/admin/AllWebsitesPage.tsx"));
const AiUsagePage = lazy(() => import("./pages/admin/AiUsagePage.tsx"));
const AiUsageClientPage = lazy(() => import("./pages/admin/AiUsageClientPage.tsx"));
const TransactionsPage = lazy(() => import("./pages/admin/TransactionsPage.tsx"));
const SectionLibraryPage = lazy(() => import("./pages/admin/SectionLibraryPage.tsx"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage.tsx"));

function PageLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-canvas">
      <Spinner size="lg" aria-label="Loading..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="templates/:templateKey" element={<TemplateDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<GuestOnly />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            <Route element={<RequireAuth roles={["CLIENT"]} />}>
              <Route element={<ClientLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="websites" element={<MyWebsitesPage />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="account" element={<AccountSettingsPage />} />
                <Route path="wallet" element={<WalletPage />} />
              </Route>
            </Route>

            <Route element={<RequireAuth roles={["CLIENT", "SUPER_ADMIN"]} />}>
              <Route path="websites/new" element={<CreateWebsitePage />} />
              <Route element={<RoleLayout />}>
                <Route path="websites/:id" element={<ProjectDashboardPage />} />
              </Route>
              <Route path="websites/:id/preview" element={<WebsitePreviewPage />} />
              <Route path="websites/:id/edit" element={<BuilderRoute />} />
            </Route>

            <Route element={<RequireAuth roles={["SUPER_ADMIN"]} />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<ClientsPage />} />
                <Route path="clients/new" element={<ClientFormPage />} />
                <Route path="clients/:id" element={<ClientFormPage />} />
                <Route path="websites" element={<AllWebsitesPage />} />
                <Route path="ai-usage" element={<AiUsagePage />} />
                <Route path="ai-usage/:clientId" element={<AiUsageClientPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="sections" element={<SectionLibraryPage />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/email" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
