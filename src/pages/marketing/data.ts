export interface Template {
  /** Template name */
  n: string;
  /** Category */
  c: string;
  /** Sample business name */
  biz: string;
  /** Body and heading font stacks */
  f: string;
  hf: string;
  rad: string;
  /** Background, ink, accent, on-accent and soft surface colours */
  b: string;
  i: string;
  a: string;
  o: string;
  s: string;
  art: string;
  eye: string;
  h: string;
  p: string;
  cta: string;
  sec: string;
  cards: [string, string][];
  band: string;
  pages: string;
}

export const TPLS: Template[] = [
  {
    n: "Business Classic",
    c: "Business",
    biz: "Northwind Advisory",
    f: "'Manrope'",
    hf: "'Manrope'",
    rad: "8px",
    b: "#FFFFFF",
    i: "#14213D",
    a: "#2448C8",
    o: "#FFFFFF",
    s: "#EEF2FC",
    art: "office",
    eye: "Accounting and advice",
    h: "Practical advice for growing companies",
    p: "Bookkeeping, tax and planning for small businesses, from one team you can call.",
    cta: "Book a call",
    sec: "How we help",
    cards: [
      ["Bookkeeping", "Monthly books, payroll and reports done for you."],
      ["Tax planning", "Returns filed on time, with fewer surprises."],
      ["Business advice", "Cash flow, pricing and growth plans."],
    ],
    band: "Talk to an adviser this week",
    pages: "Home, About, Services, Contact",
  },
  {
    n: "Agency Modern",
    c: "Agency",
    biz: "Halftone Studio",
    f: "'Archivo'",
    hf: "'Archivo'",
    rad: "0px",
    b: "#0F0F12",
    i: "#F5F5F0",
    a: "#FF5A36",
    o: "#0F0F12",
    s: "#1C1C22",
    art: "agency",
    eye: "Design studio",
    h: "Brands, websites and campaigns that get noticed",
    p: "A small studio for ambitious companies. Strategy, identity and digital, under one roof.",
    cta: "Start a project",
    sec: "What we do",
    cards: [
      ["Branding", "Names, logos and identity systems."],
      ["Web design", "Websites that are fast, clear and easy to update."],
      ["Campaigns", "Launches across social, print and outdoor."],
    ],
    band: "Have a project in mind?",
    pages: "Home, About, Services, Portfolio, Contact",
  },
  {
    n: "Local Services",
    c: "Services",
    biz: "Brightline Plumbing",
    f: "'Nunito Sans'",
    hf: "'Nunito Sans'",
    rad: "10px",
    b: "#FFFFFF",
    i: "#0E2A2A",
    a: "#0F7B6C",
    o: "#FFFFFF",
    s: "#E6F4F1",
    art: "tools",
    eye: "Licensed and insured",
    h: "Same-day plumbing repairs across the city",
    p: "Leaks, blocked drains and new fittings. Upfront prices and a 12-month guarantee.",
    cta: "Get a quote",
    sec: "Our services",
    cards: [
      ["Emergency repairs", "Burst pipes and leaks, any time of day."],
      ["Installations", "Taps, showers, heaters and kitchens."],
      ["Maintenance plans", "Yearly checks so problems never start."],
    ],
    band: "Need a plumber today?",
    pages: "Home, Services, Contact",
  },
  {
    n: "Consultant",
    c: "Business",
    biz: "Meera Iyer Consulting",
    f: "'Manrope'",
    hf: "'Libre Baskerville'",
    rad: "4px",
    b: "#FBF7F2",
    i: "#2B2118",
    a: "#A63D10",
    o: "#FFFFFF",
    s: "#F3E6DA",
    art: "consult",
    eye: "Strategy consultant",
    h: "Clear strategy for leadership teams",
    p: "Fifteen years helping companies decide where to grow, and how to get there.",
    cta: "Schedule a consultation",
    sec: "Ways to work together",
    cards: [
      ["Strategy workshops", "Two-day sessions that end with a plan."],
      ["Leadership coaching", "One-to-one support for new leaders."],
      ["Market research", "Know your customers before you invest."],
    ],
    band: "Start with a free 30-minute call",
    pages: "Home, About, Blog, Contact",
  },
  {
    n: "Single Landing Page",
    c: "Landing page",
    biz: "Tidy Invoices",
    f: "'Sora'",
    hf: "'Sora'",
    rad: "12px",
    b: "#F5F7FF",
    i: "#12153A",
    a: "#4F46E5",
    o: "#FFFFFF",
    s: "#E4E7FF",
    art: "app",
    eye: "New · Invoicing app",
    h: "Send a professional invoice in under a minute",
    p: "Create, send and track invoices from your phone. Automatic reminders get you paid faster.",
    cta: "Join the waitlist",
    sec: "Why Tidy",
    cards: [
      ["Ready templates", "Your logo and details, filled in for you."],
      ["Payment reminders", "Polite follow-ups sent automatically."],
      ["Simple reports", "See who has paid at a glance."],
    ],
    band: "Be first to try Tidy",
    pages: "Landing page",
  },
  {
    n: "Portfolio Minimal",
    c: "Portfolio",
    biz: "Arun Rao",
    f: "'Archivo'",
    hf: "'Playfair Display'",
    rad: "0px",
    b: "#F4F4F2",
    i: "#111111",
    a: "#111111",
    o: "#F4F4F2",
    s: "#E6E6E1",
    art: "gallery",
    eye: "Photographer",
    h: "Portraits and architecture, in natural light",
    p: "Commissions for people, places and publications. Based in the city, available to travel.",
    cta: "View work",
    sec: "Selected work",
    cards: [
      ["Portraits", "People at home and at work."],
      ["Architecture", "Buildings, interiors and details."],
      ["Editorial", "Stories for magazines and brands."],
    ],
    band: "Booking projects for next season",
    pages: "Home, Portfolio, About, Contact",
  },
  {
    n: "Clinic and Health",
    c: "Services",
    biz: "Lumen Dental Care",
    f: "'Nunito Sans'",
    hf: "'Nunito Sans'",
    rad: "24px",
    b: "#FFFFFF",
    i: "#0B2D3A",
    a: "#0E7C9A",
    o: "#FFFFFF",
    s: "#E5F3F7",
    art: "clinic",
    eye: "Family dentistry",
    h: "Gentle dental care for the whole family",
    p: "Check-ups, cleaning and cosmetic treatments in a calm, modern clinic. Evening appointments available.",
    cta: "Book an appointment",
    sec: "Treatments",
    cards: [
      ["Check-ups", "Exams and cleaning every six months."],
      ["Cosmetic care", "Whitening, veneers and aligners."],
      ["Emergency visits", "Same-day help for pain and injuries."],
    ],
    band: "New patients welcome",
    pages: "Home, Services, Team, Contact",
  },
  {
    n: "Restaurant",
    c: "Food",
    biz: "Saffron Table",
    f: "'Nunito Sans'",
    hf: "'Playfair Display'",
    rad: "999px",
    b: "#1E1410",
    i: "#F7EBDD",
    a: "#E0A33B",
    o: "#1E1410",
    s: "#2C1F18",
    art: "food",
    eye: "Kitchen and bar",
    h: "Seasonal plates and slow-cooked curries",
    p: "A neighbourhood restaurant cooking with local produce. Open for lunch and dinner, six days a week.",
    cta: "Reserve a table",
    sec: "Visit us for",
    cards: [
      ["Lunch", "Thali plates and quick bites, noon to three."],
      ["Dinner", "Sharing menu and a short wine list."],
      ["Private dining", "A room for up to twenty guests."],
    ],
    band: "Tables fill up on weekends",
    pages: "Home, Menu, About, Contact",
  },
  {
    n: "Startup Launch",
    c: "Landing page",
    biz: "Orbit Analytics",
    f: "'Sora'",
    hf: "'Sora'",
    rad: "10px",
    b: "#0B1026",
    i: "#E9ECFF",
    a: "#8B6CFF",
    o: "#0B1026",
    s: "#161C3D",
    art: "launch",
    eye: "Product analytics",
    h: "See how people use your product, without the setup",
    p: "Add one line of code. Get live dashboards, funnels and alerts your whole team can read.",
    cta: "Start free",
    sec: "Built for product teams",
    cards: [
      ["Live dashboards", "Usage and growth, updated every minute."],
      ["Funnels", "Find the step where people drop off."],
      ["Alerts", "Hear about changes before customers do."],
    ],
    band: "Set up in five minutes",
    pages: "Landing page",
  },
];

export const CATS = ["All", "Business", "Agency", "Services", "Portfolio", "Landing page", "Food"];

export const HOME_TEMPLATES = [6, 1, 7];

export const PLANS: [name: string, description: string, features: string[], featured: boolean][] = [
  [
    "Starter",
    "For one simple website.",
    ["1 website", "Manual and AI builder", "Free sub-domain", "[Storage] media storage"],
    false,
  ],
  [
    "Business",
    "For growing businesses.",
    [
      "[n] websites",
      "Manual and AI builder",
      "Connect your own domain",
      "[Storage] media storage",
      "Reusable sections",
    ],
    true,
  ],
  [
    "Agency",
    "For managing many sites.",
    ["[n] websites", "Everything in Business", "[Extra feature]", "Priority support"],
    false,
  ],
];

export const DOCS = {
  terms: {
    t: "Terms of Service",
    s: [
      "Acceptance of terms",
      "Your account",
      "Using the website builder",
      "Your content",
      "Domains and publishing",
      "Payments",
      "Termination",
      "Changes to these terms",
      "Contact",
    ],
  },
  privacy: {
    t: "Privacy Policy",
    s: [
      "Information we collect",
      "How we use it",
      "Cookies",
      "Sharing with others",
      "Data retention",
      "Your rights",
      "Security",
      "Changes to this policy",
      "Contact",
    ],
  },
};

export type DocKey = keyof typeof DOCS;
