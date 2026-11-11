import PageHeader from "../../components/app/PageHeader.tsx";
import HostingCouponsPanel from "../../components/hosting/HostingCouponsPanel.tsx";

export default function CouponsPage() {
  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Coupons"
        description="Discount codes for hosting subscription purchases. Each client can use a coupon once."
      />
      <div className="mt-6">
        <HostingCouponsPanel />
      </div>
    </div>
  );
}
