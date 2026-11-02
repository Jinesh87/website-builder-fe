import { useState, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Percent,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { partnerApi, type PartnerApplicationForm } from "../../api/partner.ts";
import { errorMessage } from "../../api/http.ts";
import { env } from "../../config/env.ts";

const BUSINESS_TYPES = [
  "IT Company",
  "Digital Agency",
  "Consultancy",
  "Education",
  "Individual",
  "Other",
] as const;

const TARGET_CATEGORIES = [
  "Small businesses",
  "Retail & shops",
  "Restaurants",
  "Education",
  "Healthcare",
  "Professional services",
  "Ecommerce",
  "Other",
] as const;

const EXPECTED_REFERRALS = ["1 - 5", "6 - 15", "16 - 30", "30+"] as const;

const MARKETING_CHANNELS = [
  "Social Media",
  "Portfolio",
  "Direct Sales",
  "Email Marketing",
  "Networking",
  "Other",
] as const;

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Singapore",
  "United Arab Emirates",
  "Other",
];

const INITIAL_FORM: PartnerApplicationForm = {
  companyName: "",
  registrationNumber: "",
  website: "",
  businessType: "Digital Agency",
  yearEstablished: "2022",
  country: "India",
  state: "",
  city: "",
  businessAddress: "",

  contactName: "",
  designation: "",
  email: "",
  phone: "",
  alternatePhone: "",

  partnershipType: "Referral Partner",
  targetCategories: ["Small businesses", "Retail & shops"],
  expectedReferrals: "6 - 15",
  marketingChannels: ["Direct Sales", "Networking"],
  reason: "",
  previousExperience: true,
  acceptTerms: true,
};

export default function BecomePartnerPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<PartnerApplicationForm>(INITIAL_FORM);
  const [phonePrefix, setPhonePrefix] = useState("+91");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ applicationId: string; message: string } | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState(false);

  function scrollToSection(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateField<K extends keyof PartnerApplicationForm>(
    key: K,
    value: PartnerApplicationForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function toggleArrayItem(key: "targetCategories" | "marketingChannels", item: string) {
    setForm((prev) => {
      const arr = prev[key];
      const exists = arr.includes(item);
      const nextArr = exists ? arr.filter((x) => x !== item) : [...arr, item];
      return { ...prev, [key]: nextArr };
    });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (!form.yearEstablished.trim()) errs.yearEstablished = "Year is required";
    if (!form.country.trim()) errs.country = "Country is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.businessAddress.trim()) errs.businessAddress = "Business address is required";

    if (!form.contactName.trim()) errs.contactName = "Contact person name is required";
    if (!form.designation.trim()) errs.designation = "Designation is required";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";

    if (form.targetCategories.length === 0)
      errs.targetCategories = "Select at least one customer category";
    if (form.marketingChannels.length === 0)
      errs.marketingChannels = "Select at least one marketing channel";
    if (!form.reason.trim() || form.reason.trim().length < 10)
      errs.reason = "Please tell us why you want to become a partner (min 10 characters)";

    if (!form.acceptTerms)
      errs.acceptTerms = "You must confirm details and accept the Partner Terms";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = form.phone.startsWith("+")
        ? form.phone
        : `${phonePrefix} ${form.phone}`.trim();
      const res = await partnerApi.apply({
        ...form,
        phone: fullPhone,
      });
      setSuccessData(res);
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function copyApplicationId() {
    if (!successData?.applicationId) return;
    navigator.clipboard.writeText(successData.applicationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  return (
    <div className="text-slate-900 font-sans antialiased selection:bg-brand selection:text-white pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="eyebrow">Partner Programme</div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 tracking-tight leading-[1.15]">
                Become a partner and earn on every paying customer you refer
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Recommend {env.appName || "Bytezora"} to businesses that need a website. Once we
                approve you, you get your own referral code, an agreed commission rate, and a
                live dashboard to track every referral and payout.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(formRef)}
                  className="px-6 py-3.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  Apply to become a partner
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(howItWorksRef)}
                  className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors border border-slate-300 cursor-pointer"
                >
                  How it works
                </button>
              </div>
            </div>

            {/* Right Illustration Card Preview (Exact visual match to attached screenshots) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-slate-900 font-medium">Home</span>
                    <span>|</span>
                    <span>Earnings</span>
                    <span>|</span>
                    <span>Referrals</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="my-6 p-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-center space-y-1.5">
                  <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-[#2563EB]">
                    ABC-7Q4M
                  </span>
                  <p className="text-xs text-slate-500">Share this code or your referral link</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/70">
                    <div className="text-2xl font-bold text-slate-900">24</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Total Referrals</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/70">
                    <div className="text-2xl font-bold text-slate-900">9</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Paid Customers</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/70">
                    <div className="text-2xl font-bold text-emerald-600">15%</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Commission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With Us Section */}
      <section className="py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              WHY PARTNER WITH US
            </span>
            <h2 className="text-3xl font-bold text-slate-900">
              Built for agencies, consultants and freelancers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:border-blue-400/50 hover:shadow-md transition-all">
              <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                <Percent className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Commission on paid sales</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Earn a percentage on every renewal or purchase from customers you refer. You receive
                payout when client is approved.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:border-blue-400/50 hover:shadow-md transition-all">
              <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
                <Tag className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Your own referral code</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A unique code and tracking link that attributes leads to you even if they register or
                pay later.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:border-blue-400/50 hover:shadow-md transition-all">
              <div className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Live partner dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                See referrals, conversions and pending, approved and paid commission in one unified
                place.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:border-blue-400/50 hover:shadow-md transition-all">
              <div className="size-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Reviewed partners only</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every application is reviewed by our team, so customers trust the people who
                recommend us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-bold text-slate-900">
              From application to your first commission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative">
              <div className="size-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-900">Apply</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fill in the form below. You get a reference ID and an acknowledgement email.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative">
              <div className="size-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-900">We review</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our team reviews your application, usually within 2-3 working days.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative">
              <div className="size-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-900">Get approved</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We activate your referral code, commission rate and dashboard login access.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative">
              <div className="size-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-900">Refer & earn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share your link. You earn when a referred customer completes payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section (Exact match to the provided screenshot) */}
      <section ref={formRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              APPLICATION FORM
            </span>
            <h2 className="text-3xl font-bold text-slate-900">Apply to become a partner</h2>
            <p className="text-sm text-slate-600">
              Fields marked <span className="text-red-500">*</span> are required. It takes about 3-5
              minutes.
            </p>
          </div>

          {successData ? (
            /* Submission Success Card */
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-slate-200/90 shadow-lg text-center space-y-6">
              <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Application Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {successData.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                    Your Reference ID
                  </div>
                  <div className="font-mono text-xl font-bold text-[#2563EB]">
                    {successData.applicationId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyApplicationId}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Our partnerships team will review your business information within 2-3 business
                days. Keep an eye on your inbox for approval updates and your referral code.
              </p>

              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  to="/admin/partners"
                  className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors"
                >
                  View in Admin Portal
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Step Indicators */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-6 shadow-sm">
                  <div className="space-y-4 text-sm font-medium">
                    <div className="flex items-center gap-3 text-slate-900 font-semibold">
                      <span className="size-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Company information</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="size-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-300">
                        2
                      </span>
                      <span>Contact information</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="size-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-300">
                        3
                      </span>
                      <span>Partnership information</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                    Once you submit, our team will review within 2-3 business days. You'll receive email
                    updates on your application approval.
                  </div>
                </div>
              </div>

              {/* Right Form Container */}
              <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* Card 1: Company Information */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2 text-slate-900 text-lg font-bold">
                        <span className="size-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        Company information
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-8">
                        Tell us about your business. Sole traders or freelancers are welcome.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Company / Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => updateField("companyName", e.target.value)}
                          placeholder="e.g. Apex Digital Solutions"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                        />
                        {errors.companyName && (
                          <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Business registration number (optional)
                          </label>
                          <input
                            type="text"
                            value={form.registrationNumber || ""}
                            onChange={(e) => updateField("registrationNumber", e.target.value)}
                            placeholder="GST/CIN/LLPIN/Tax ID"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Company website
                          </label>
                          <input
                            type="url"
                            value={form.website || ""}
                            onChange={(e) => updateField("website", e.target.value)}
                            placeholder="https://"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Business type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {BUSINESS_TYPES.map((type) => {
                            const isSelected = form.businessType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => updateField("businessType", type)}
                                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Year of establishment <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.yearEstablished}
                            onChange={(e) => updateField("yearEstablished", e.target.value)}
                            placeholder="e.g. 2020"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.yearEstablished && (
                            <p className="text-xs text-red-500 mt-1">{errors.yearEstablished}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.country}
                            onChange={(e) => updateField("country", e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors cursor-pointer"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c} className="bg-white text-slate-900">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.state}
                            onChange={(e) => updateField("state", e.target.value)}
                            placeholder="Select or enter state"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => updateField("city", e.target.value)}
                            placeholder="e.g. Austin / Mumbai"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Business address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={form.businessAddress}
                          onChange={(e) => updateField("businessAddress", e.target.value)}
                          placeholder="Building, street, area, pincode"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors resize-none"
                        />
                        {errors.businessAddress && (
                          <p className="text-xs text-red-500 mt-1">{errors.businessAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Contact Information */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2 text-slate-900 text-lg font-bold">
                        <span className="size-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        Contact information
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-8">
                        We'll use this to contact you about your application.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Contact person name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.contactName}
                            onChange={(e) => updateField("contactName", e.target.value)}
                            placeholder="Full name"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.contactName && (
                            <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.designation}
                            onChange={(e) => updateField("designation", e.target.value)}
                            placeholder="e.g. Founder, Sales Head"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.designation && (
                            <p className="text-xs text-red-500 mt-1">{errors.designation}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Email address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Phone / WhatsApp number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={phonePrefix}
                              onChange={(e) => setPhonePrefix(e.target.value)}
                              className="px-2.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                            >
                              <option value="+91" className="bg-white text-slate-900">+91 (IN)</option>
                              <option value="+1" className="bg-white text-slate-900">+1 (US)</option>
                              <option value="+44" className="bg-white text-slate-900">+44 (UK)</option>
                              <option value="+61" className="bg-white text-slate-900">+61 (AU)</option>
                              <option value="+971" className="bg-white text-slate-900">+971 (AE)</option>
                              <option value="+65" className="bg-white text-slate-900">+65 (SG)</option>
                            </select>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => updateField("phone", e.target.value)}
                              placeholder="9876543210"
                              className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                            />
                          </div>
                          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Alternative contact number (optional)
                        </label>
                        <input
                          type="tel"
                          value={form.alternatePhone || ""}
                          onChange={(e) => updateField("alternatePhone", e.target.value)}
                          placeholder="Landline or second mobile"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Partnership Information */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2 text-slate-900 text-lg font-bold">
                        <span className="size-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        Partnership information
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-8">
                        Help us understand how you will refer customers.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Target customer categories <span className="text-red-500">*</span> (select
                          all that apply)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TARGET_CATEGORIES.map((category) => {
                            const isSelected = form.targetCategories.includes(category);
                            return (
                              <button
                                key={category}
                                type="button"
                                onClick={() => toggleArrayItem("targetCategories", category)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                {isSelected && <Check className="size-3" />}
                                {category}
                              </button>
                            );
                          })}
                        </div>
                        {errors.targetCategories && (
                          <p className="text-xs text-red-500 mt-1">{errors.targetCategories}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Expected monthly referrals <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {EXPECTED_REFERRALS.map((bracket) => {
                            const isSelected = form.expectedReferrals === bracket;
                            return (
                              <button
                                key={bracket}
                                type="button"
                                onClick={() => updateField("expectedReferrals", bracket)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                {bracket}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Marketing channels <span className="text-red-500">*</span> (select all
                          that apply)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MARKETING_CHANNELS.map((channel) => {
                            const isSelected = form.marketingChannels.includes(channel);
                            return (
                              <button
                                key={channel}
                                type="button"
                                onClick={() => toggleArrayItem("marketingChannels", channel)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                                }`}
                              >
                                {isSelected && <Check className="size-3" />}
                                {channel}
                              </button>
                            );
                          })}
                        </div>
                        {errors.marketingChannels && (
                          <p className="text-xs text-red-500 mt-1">{errors.marketingChannels}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Why do you want to become our partner? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={form.reason}
                          onChange={(e) => updateField("reason", e.target.value)}
                          placeholder="Tell us about your network and how you plan to promote us..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors resize-none"
                        />
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Previous partnership / referral experience?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => updateField("previousExperience", true)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              form.previousExperience
                                ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField("previousExperience", false)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              !form.previousExperience
                                ? "bg-[#3B82F6] text-white border border-[#3B82F6] shadow-xs"
                                : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission and agreement section */}
                  <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={form.acceptTerms}
                        onChange={(e) => updateField("acceptTerms", e.target.checked)}
                        className="mt-1 size-4 rounded bg-white border-slate-300 text-[#3B82F6] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="acceptTerms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                        I confirm the above details are accurate and agree to the{" "}
                        <Link to="/legal" className="text-[#2563EB] font-medium hover:underline">
                          Partner Terms
                        </Link>{" "}
                        and{" "}
                        <Link to="/legal" className="text-[#2563EB] font-medium hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-xs text-red-500">{errors.acceptTerms}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        You'll receive a confirmation email with a reference ID once you submit.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
