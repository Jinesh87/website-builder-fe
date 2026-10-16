import { AUTH_PRESETS, createAuthData } from "./auth-defaults.ts";
import type {
  Section,
  SectionDataMap,
  SectionOf,
  SectionSettings,
  SectionType,
} from "./types.ts";

export type SectionCategory =
  | "Header"
  | "Footer"
  | "Hero"
  | "Features"
  | "Services"
  | "Social proof"
  | "FAQ"
  | "CTA"
  | "Contact"
  | "Portfolio"
  | "Content"
  | "Media"
  | "Pricing"
  | "Team"
  | "Carousel"
  | "Marquee"
  | "Auth"
  | "Blog";

export type SectionDefinition<T extends SectionType> = {
  type: T;
  label: string;
  category: SectionCategory;
  description: string;
  /** Starter content used when a section is added in the editor. */
  createData: () => SectionDataMap[T];
};

export const SECTION_DEFINITIONS: { [T in SectionType]: SectionDefinition<T> } =
  {
    header: {
      type: "header",
      label: "Header",
      category: "Header",
      description:
        "Site header with brand logo, navigation menu, and optional action button.",
      createData: () => ({
        design: "logo-left",
        siteName: "My Website",
        menu: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
        sticky: false,
      }),
    },
    footer: {
      type: "footer",
      label: "Footer",
      category: "Footer",
      description:
        "Site footer with brand info, link columns, contact info, and copyright.",
      createData: () => ({
        design: "columns",
        siteName: "My Website",
        copyright: "© My Website. All rights reserved.",
        columns: [
          {
            title: "Navigation",
            links: [
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ],
          },
        ],
        social: [],
      }),
    },
    hero: {
      type: "hero",
      label: "Hero",
      category: "Hero",
      description:
        "Large heading, supporting text and call-to-action buttons. Centered or two-column.",
      createData: () => ({
        variant: "centered",
        heading: "Your headline goes here",
        subheading:
          "Explain in one or two sentences what you offer and who it is for.",
        primaryCta: { label: "Get started", href: "/contact" },
      }),
    },
    features: {
      type: "features",
      label: "Features",
      category: "Features",
      description:
        "Customizable feature grid or split showcase with modern icon badges and clean typography.",
      createData: () => ({
        variant: "pastel-icons",
        heading: "Our Features",
        intro:
          "Unleash your creativity with a visual collaboration platform that enables effective ideation.",
        columns: 4,
        mobileColumns: 2,
        bottomCta: { label: "Learn more", href: "/features" },
        items: [
          {
            icon: "gear",
            iconColor: "orange",
            title: "Choosing a Service",
            description: "Choosing an accountant that matches your needs.",
          },
          {
            icon: "user",
            iconColor: "green",
            title: "Our Clients Say",
            description: "Read the reviews from some of our satisfied clients.",
          },
          {
            icon: "mail",
            iconColor: "yellow",
            title: "Initial Consultation",
            description: "Understanding your accountancy requirements.",
          },
          {
            icon: "phone",
            iconColor: "cyan",
            title: "Request a Callback",
            description: "Let's talk at a more convenient time for you.",
          },
        ],
      }),
    },
    services: {
      type: "services",
      label: "Services grid",
      category: "Services",
      description:
        "Modern cards for each service with badges, pricing, checklist, and buttons.",
      createData: () => ({
        variant: "cards-grid",
        eyebrow: "OUR SERVICES",
        heading: "High-impact solutions for modern brands",
        intro:
          "Tailored services engineered to accelerate growth, enhance performance, and elevate your presence.",
        columns: 3,
        mobileColumns: 1,
        cardStyle: "surface",
        iconStyle: "pastel-circle",
        showBadges: true,
        showIcons: true,
        showPrices: true,
        showBullets: true,
        bottomCta: { label: "Explore all capabilities", href: "/services" },
        items: [
          {
            title: "Brand Strategy & Identity",
            description:
              "Distinctive positioning, messaging architectures, and memorable visual identities that stand out.",
            badge: "Strategic",
            badgeColor: "blue",
            icon: "sparkles",
            iconColor: "blue",
            price: "From $1,200",
            duration: "2-3 weeks",
            features: [
              "Competitive landscape analysis",
              "Comprehensive brand guidelines",
              "Digital & print design assets",
            ],
            link: { label: "Get started", href: "/contact" },
          },
          {
            title: "Web Design & Development",
            description:
              "High-converting, responsive websites and web applications built with modern frameworks and pixel perfection.",
            badge: "Popular",
            badgeColor: "purple",
            icon: "code",
            iconColor: "purple",
            price: "From $2,400",
            duration: "3-4 weeks",
            features: [
              "Custom UX/UI architecture",
              "SEO & performance optimized",
              "CMS & analytics integration",
            ],
            link: { label: "Get started", href: "/contact" },
            featured: true,
          },
          {
            title: "Growth & Digital Marketing",
            description:
              "Data-driven acquisition channels, search optimization, and automated conversion funnels.",
            badge: "Turnkey",
            badgeColor: "green",
            icon: "chart",
            iconColor: "green",
            price: "From $900/mo",
            duration: "Monthly sprint",
            features: [
              "Targeted search marketing",
              "Conversion rate optimization",
              "Bi-weekly performance reports",
            ],
            link: { label: "Get started", href: "/contact" },
          },
        ],
      }),
    },
    testimonials: {
      type: "testimonials",
      label: "Testimonials",
      category: "Social proof",
      description: "Customer quotes with ratings, verified badges, and avatars.",
      createData: () => ({
        variant: "cards-grid",
        eyebrow: "CUSTOMER STORIES",
        heading: "Loved by teams worldwide",
        intro: "See how fast-growing businesses scale their online presence effortlessly.",
        cardStyle: "default",
        align: "center",
        columns: 3,
        showRatings: true,
        showAvatars: true,
        showBadges: true,
        ratingMetric: {
          score: "4.9/5",
          count: "2,500+ reviews",
          label: "Verified Customer Rating",
        },
        items: [
          {
            quote: "This builder cut our website rollout time from three weeks to literally two hours. Pixel-perfect out of the box.",
            name: "Sophia Chen",
            role: "Head of Marketing",
            company: "Pulse Media",
            avatar: { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", alt: "Sophia Chen" },
            rating: 5,
            verified: true,
            badge: "Verified Buyer",
            highlight: "10x Faster Launch",
          },
          {
            quote: "The animations and performance are silky smooth. Our client conversion rates surged immediately after our redesign.",
            name: "Marcus Vance",
            role: "Creative Director",
            company: "Studio Vanguard",
            avatar: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", alt: "Marcus Vance" },
            rating: 5,
            verified: true,
            badge: "Enterprise Client",
            highlight: "+340% Conversions",
          },
          {
            quote: "Unbelievable quality and responsiveness. It feels like an agency built our website custom for half the price.",
            name: "Elena Rostova",
            role: "Founder & CEO",
            company: "Novus AI",
            avatar: { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", alt: "Elena Rostova" },
            rating: 5,
            verified: true,
            badge: "Verified Founder",
            highlight: "Saved $15k in dev",
          },
        ],
      }),
    },
    faq: {
      type: "faq",
      label: "FAQ accordion",
      category: "FAQ",
      description: "Questions that expand to show their answer.",
      createData: () => ({
        heading: "Frequently asked questions",
        items: [
          {
            question: "Add a common question?",
            answer: "Answer it clearly in a sentence or two.",
          },
          {
            question: "Add another question?",
            answer: "Answer it clearly in a sentence or two.",
          },
        ],
      }),
    },
    cta: {
      type: "cta",
      label: "Call to action",
      category: "CTA",
      description: "Short heading with a single prominent button.",
      createData: () => ({
        heading: "Ready to get started?",
        text: "Tell visitors what to do next.",
        button: { label: "Contact us", href: "/contact" },
      }),
    },
    contact: {
      type: "contact",
      label: "Contact form",
      category: "Contact",
      description: "Contact details with an optional enquiry form.",
      createData: () => ({
        heading: "Get in touch",
        text: "We usually reply within one business day.",
        showForm: true,
        submitLabel: "Send message",
      }),
    },
    text: {
      type: "text",
      label: "Text + heading",
      category: "Content",
      description: "A heading followed by paragraphs of text.",
      createData: () => ({
        heading: "About us",
        body: "Write a few paragraphs here.\n\nLeave a blank line between paragraphs.",
      }),
    },
    gallery: {
      type: "gallery",
      label: "Gallery / Portfolio",
      category: "Portfolio",
      description: "Grid of images for work samples or photos.",
      createData: () => ({
        heading: "Our work",
        columns: 3,
        mobileColumns: 1,
        images: [],
      }),
    },
    logos: {
      type: "logos",
      label: "Logo cloud",
      category: "Social proof",
      description: "A row of customer or partner logos.",
      createData: () => ({
        heading: "Trusted by teams at",
        grayscale: true,
        logos: [],
      }),
    },
    split: {
      type: "split",
      label: "Split content",
      category: "Content",
      description: "Text and bullet points beside an image.",
      createData: () => ({
        eyebrow: "How it works",
        heading: "Explain one key idea",
        body: "Use a short paragraph to describe what makes this part of your offer valuable.",
        bullets: ["First benefit", "Second benefit", "Third benefit"],
        imagePosition: "right",
      }),
    },
    stats: {
      type: "stats",
      label: "Statistics",
      category: "Social proof",
      description: "Large numbers that show results at a glance.",
      createData: () => ({
        items: [
          { value: "10+", label: "Years of experience" },
          { value: "500", label: "Happy customers" },
          { value: "24/7", label: "Support" },
        ],
      }),
    },
    pricing: {
      type: "pricing",
      label: "Pricing",
      category: "Pricing",
      description: "Plans with price, features and a button each.",
      createData: () => ({
        heading: "Simple, transparent pricing",
        intro: "Choose the plan that fits you.",
        plans: [
          {
            name: "Starter",
            price: "$19",
            period: "/ month",
            description: "For individuals getting started.",
            features: ["First feature", "Second feature"],
            cta: { label: "Choose Starter", href: "/contact" },
            featured: false,
          },
          {
            name: "Pro",
            price: "$49",
            period: "/ month",
            description: "For growing teams.",
            features: [
              "Everything in Starter",
              "Third feature",
              "Priority support",
            ],
            cta: { label: "Choose Pro", href: "/contact" },
            featured: true,
          },
        ],
      }),
    },
    media: {
      type: "media",
      label: "Image / video",
      category: "Media",
      description: "One large image or a YouTube / Vimeo video.",
      createData: () => ({
        kind: "image",
        aspect: "16:9",
        width: "contained",
      }),
    },
    team: {
      type: "team",
      label: "Team",
      category: "Team",
      description: "People with photo, role and short bio.",
      createData: () => ({
        heading: "Meet the team",
        columns: 3,
        mobileColumns: 1,
        members: [
          { name: "Team member", role: "Role" },
          { name: "Team member", role: "Role" },
          { name: "Team member", role: "Role" },
        ],
      }),
    },
    carousel: {
      type: "carousel",
      label: "Carousel / Slider",
      category: "Carousel",
      description:
        "Interactive slide deck, multi-card slider, or full-width hero banner.",
      createData: () => ({
        variant: "cards",
        heading: "Featured Highlights",
        intro: "Browse our latest solutions, client stories, and capabilities.",
        autoPlay: false,
        interval: 5,
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
        slides: [
          {
            title: "Next-Gen Cloud Architecture",
            subtitle: "Infrastructure",
            description:
              "Ultra-low latency microservices engineered for 99.999% uptime and elastic scalability.",
            badge: "NEW RELEASE",
            button: { label: "Learn more", href: "/services" },
          },
          {
            title: "AI-Powered Automation",
            subtitle: "Intelligence",
            description:
              "Empower your operations with frontier machine learning pipelines and real-time inference.",
            badge: "ENTERPRISE",
            button: { label: "Explore AI", href: "/services" },
          },
          {
            title: "Design System Engineering",
            subtitle: "User Experience",
            description:
              "Pixel-perfect tokenized component libraries that bridge design and engineering seamlessly.",
            badge: "FEATURED",
            button: { label: "View Showcase", href: "/portfolio" },
          },
        ],
      }),
    },
    marquee: {
      type: "marquee",
      label: "Marquee / Ticker",
      category: "Marquee",
      description:
        "Smooth continuous scrolling ticker for headlines, badges, or capability streams.",
      createData: () => ({
        variant: "ticker-text",
        speed: "normal",
        direction: "left",
        pauseOnHover: true,
        gradientFades: true,
        fontSize: "medium",
        items: [
          { text: "GLOBAL CLOUD SCALE" },
          { text: "ENTERPRISE SECURITY", badge: "SOC2 TYPE II" },
          { text: "AI & ML INTEGRATION" },
          { text: "99.99% SLA UPTIME", badge: "GUARANTEED" },
          { text: "24/7 DEDICATED TRIAGE" },
        ],
      }),
    },
    auth: {
      type: "auth",
      label: "Login / Sign up",
      category: "Auth",
      description:
        "Login, register, forgot password and optional OTP verification screens with configurable fields and social login.",
      createData: createAuthData,
    },
    custom: {
      type: "custom",
      label: "Custom Layout",
      category: "Content",
      description:
        "Free-form layout built from blocks. The AI Copilot uses it for designs no preset covers.",
      createData: () => ({
        width: "contained",
        align: "start",
        blocks: [
          {
            type: "grid",
            columns: 2,
            align: "center",
            children: [
              {
                type: "stack",
                gap: "md",
                children: [
                  { type: "badge", text: "Custom layout" },
                  {
                    type: "heading",
                    text: "Build any layout you can describe",
                    level: 2,
                  },
                  {
                    type: "text",
                    text: "Ask the AI Copilot for a design and it composes it from these blocks.",
                    size: "lg",
                    muted: true,
                  },
                  {
                    type: "stack",
                    direction: "row",
                    gap: "sm",
                    children: [
                      {
                        type: "button",
                        label: "Get started",
                        href: "/contact",
                        tone: "primary",
                      },
                      {
                        type: "button",
                        label: "Learn more",
                        href: "#",
                        tone: "secondary",
                      },
                    ],
                  },
                ],
              },
              {
                type: "card",
                tone: "muted",
                children: [
                  { type: "icon", name: "sparkles" },
                  { type: "heading", text: "Why it works", level: 3 },
                  {
                    type: "list",
                    items: [
                      "Follows your theme",
                      "Fully responsive",
                      "Editable text and links",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    blog: {
      type: "blog",
      label: "Blog cards",
      category: "Blog",
      description:
        "Responsive blog post cards with category filtering, reading times, and optional newsletter box.",
      createData: () => ({
        eyebrow: "Articles & Insights",
        title: "The Kindsight Blog",
        subtitle:
          "Practical stories, industry observations, and guides to help you build and scale with intention.",
        categories: ["All", "Design", "Architecture", "Technology", "Culture"],
        layout: "grid-3",
        showNewsletterCard: false,
        posts: [
          {
            id: "post-1",
            title: "The influence of modern architecture",
            slug: "/blog/influence-of-modern-architecture",
            excerpt:
              "An exploration into how minimalist silhouettes and brutalist honesty redefine modern spaces.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
              alt: "Modern architecture skyscrapers",
            },
            category: "Design",
            authorName: "Jakob Gronberg",
            date: "July 21, 2024",
            readTime: "12 Min",
            readMoreLabel: "Read More →",
          },
          {
            id: "post-2",
            title: "How to write a sponsorship letter that converts",
            slug: "/blog/how-to-write-a-sponsorship-letter",
            excerpt:
              "Practical guidelines and a field-tested template to craft compelling partnership requests.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
              alt: "Working on laptop in office",
            },
            category: "Tips",
            authorName: "Maya Lin",
            date: "June 14, 2024",
            readTime: "8 Min",
            readMoreLabel: "Read More →",
          },
          {
            id: "post-3",
            title: "How to use your donor pyramid to build donation strategies",
            slug: "/blog/donor-pyramid-strategies",
            excerpt:
              "Structure your outreach tiers to turn one-time contributors into lifelong supporters.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
              alt: "Stone pyramid monument",
            },
            category: "Growth",
            authorName: "Alex Rivera",
            date: "May 29, 2024",
            readTime: "10 Min",
            readMoreLabel: "Read More →",
          },
        ],
      }),
    },
    blog_detail: {
      type: "blog_detail",
      label: "Blog detail",
      category: "Blog",
      description:
        "Full-page article layout with 10 modern designs, rich typography, author bio, and sharing tools.",
      createData: () => ({
        design: "minimalist-editorial",
        title: "The influence of modern architecture",
        subtitle:
          "Nibh sed pulvinar proin gravida hendrerit lectus a. Consequat mauris nunc congue nisi vitae suscipit tellus mauris a. Cursus metus aliquam.",
        category: "Design",
        date: "July 21, 2024",
        authorName: "Jakob Gronberg",
        authorRole: "Lead Architectural Designer",
        authorBio:
          "Jakob Gronberg explores tectonic expression, geometric clarity, and material permanence in contemporary urban design.",
        readTime: "12 Min",
        coverImage: {
          url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
          alt: "The influence of modern architecture",
        },
        coverImageCaption:
          "Skyscrapers rising against a clear horizon in Copenhagen.",
        content: [
          {
            heading: "Elit ullamcorper dignissim",
            paragraphs: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit ullamcorper dignissim cras tincidunt. Enim neque volutpat ac tincidunt vitae. Dictum at tempor commodo ullamcorper a lacus vestibulum sed. Condimentum mattis pellentesque id nibh tortor id. Nisl condimentum id venenatis a condimentum.",
              "Nunc sed blandit libero volutpat sed. Tristique sollicitudin nibh sit amet commodo. Sit amet justo donec enim diam vulputate ut pharetra. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Massa vitae tortor condimentum lacinia quis vel.",
            ],
            quote:
              "Architecture is the learned game, correct and magnificent, of forms assembled in the light.",
            quoteAuthor: "Le Corbusier",
          },
          {
            heading: "Hendrerit dolor magna",
            paragraphs: [
              "Tristique sollicitudin nibh sit amet commodo. Sit amet justo donec enim diam vulputate ut pharetra. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Massa vitae tortor condimentum lacinia quis vel. Hendrerit dolor magna eget est lorem ipsum dolor. Mollis aliquam ut porttitor leo a diam sollicitudin tempor id.",
            ],
            callout:
              "Simplicity in architectural geometry often requires the most complex structural precision behind the facade.",
          },
          {
            heading: "Materiality and spatial balance",
            paragraphs: [
              "Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget arcu.",
            ],
          },
        ],
        tags: ["Architecture", "Modernism", "Design Systems", "Urbanism"],
        showShareButtons: true,
        showAuthorBio: true,
        showNewsletter: true,
      }),
    },
  };

export const SECTION_TYPES = Object.keys(SECTION_DEFINITIONS) as SectionType[];

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  background: "default",
  hideOnMobile: false,
};

export function createSection<T extends SectionType>(
  type: T,
  overrides: {
    data?: Partial<SectionDataMap[T]>;
    settings?: Partial<SectionSettings>;
  } = {},
): SectionOf<T> {
  return {
    id: crypto.randomUUID(),
    type,
    hidden: false,
    settings: { ...DEFAULT_SECTION_SETTINGS, ...overrides.settings },
    data: { ...SECTION_DEFINITIONS[type].createData(), ...overrides.data },
  } as SectionOf<T>;
}

/** A ready-made design in the component library: a section type plus starting layout and content. */
export type SectionPreset = {
  key: string;
  type: SectionType;
  label: string;
  category: SectionCategory;
  description: string;
  create: () => Section;
};

export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: "header-classical",
    type: "header",
    label: "Classical header",
    category: "Header",
    description: "Logo left, centered nav with dropdowns, dual action buttons.",
    create: () =>
      createSection("header", {
        data: {
          design: "classical",
          siteName: "Modulus",
          menu: [
            {
              label: "Solutions",
              href: "/solutions",
              children: [
                {
                  label: "Analytics",
                  href: "/analytics",
                  description: "Real-time metrics & reporting",
                },
                {
                  label: "Engagement",
                  href: "/engagement",
                  description: "Automated customer workflows",
                },
              ],
            },
            { label: "About us", href: "/about" },
            { label: "Pricing", href: "/pricing" },
            { label: "Resources", href: "/resources" },
          ],
          secondaryCta: { label: "Log in", href: "/login" },
          cta: { label: "Sign up", href: "/signup" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-minimalist",
    type: "header",
    label: "Minimalist header",
    category: "Header",
    description: "Nav on left, centered logo, sign in and CTA on right.",
    create: () =>
      createSection("header", {
        data: {
          design: "minimalist",
          siteName: "Modulus",
          menu: [
            { label: "Solutions", href: "/solutions" },
            { label: "About us", href: "/about" },
            { label: "Pricing", href: "/pricing" },
          ],
          secondaryCta: { label: "Sign in", href: "/login" },
          cta: { label: "Try for free", href: "/signup" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-comprehensive",
    type: "header",
    label: "Comprehensive header",
    category: "Header",
    description: "Mega dropdowns, search trigger, sales & booking CTAs.",
    create: () =>
      createSection("header", {
        data: {
          design: "comprehensive",
          siteName: "Modulus",
          menu: [
            {
              label: "Product",
              href: "/product",
              children: [
                {
                  label: "Core Engine",
                  href: "/core",
                  description: "Fast scalable foundation",
                },
                {
                  label: "Integrations",
                  href: "/integrations",
                  description: "Connect 100+ tools",
                },
              ],
            },
            {
              label: "Solutions",
              href: "/solutions",
              children: [
                {
                  label: "For Startups",
                  href: "/startups",
                  description: "Build & launch fast",
                },
                {
                  label: "For Enterprise",
                  href: "/enterprise",
                  description: "Custom compliance & security",
                },
              ],
            },
            { label: "Company", href: "/company" },
            { label: "Customers", href: "/customers" },
            { label: "App", href: "/app" },
          ],
          showSearch: true,
          secondaryCta: { label: "Contact Sales", href: "/contact" },
          cta: { label: "Book a demo", href: "/demo" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-floating",
    type: "header",
    label: "Floating pill header",
    category: "Header",
    description:
      "Modern blurred floating island navbar with rounded pill styling.",
    create: () =>
      createSection("header", {
        data: {
          design: "floating",
          siteName: "Modulus",
          menu: [
            { label: "Courses", href: "/courses" },
            { label: "Platform", href: "/platform" },
            { label: "Lectors", href: "/lectors" },
            { label: "Community", href: "/community" },
          ],
          secondaryCta: { label: "Sign in", href: "/login" },
          cta: { label: "Start Learning", href: "/signup" },
          position: "floating",
          sticky: true,
        },
      }),
  },
  {
    key: "header-transparent",
    type: "header",
    label: "Transparent overlay",
    category: "Header",
    description: "Transparent overlay header floating over hero sections.",
    create: () =>
      createSection("header", {
        data: {
          design: "transparent",
          siteName: "Modulus",
          overlay: true,
          menu: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
          ],
          cta: { label: "Get started", href: "/signup" },
          sticky: false,
        },
      }),
  },
  {
    key: "header-logo-left",
    type: "header",
    label: "Header · logo left",
    category: "Header",
    description: "Brand on left, navigation links and button on right.",
    create: () => createSection("header"),
  },
  {
    key: "header-centered",
    type: "header",
    label: "Header · centered",
    category: "Header",
    description: "Centered logo and navigation links.",
    create: () => createSection("header", { data: { design: "centered" } }),
  },
  {
    key: "header-glass-dock",
    type: "header",
    label: "Glass dock header",
    category: "Header",
    description:
      "Floating segmented liquid glass island dock with active beacon and command hint.",
    create: () =>
      createSection("header", {
        data: {
          design: "glass-dock",
          siteName: "Modulus",
          badge: "v2.6",
          statusText: "All systems online",
          statusColor: "green",
          menu: [
            { label: "Overview", href: "#overview" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Changelog", href: "#changelog" },
          ],
          cta: { label: "Get Started", href: "/signup" },
          position: "floating",
          sticky: true,
        },
      }),
  },
  {
    key: "header-split-stacked",
    type: "header",
    label: "Split stacked header",
    category: "Header",
    description:
      "2-tier enterprise double-decker with top utility status strip + primary navigation bar.",
    create: () =>
      createSection("header", {
        data: {
          design: "split-stacked",
          siteName: "Enterprise Cloud",
          tagline: "Global Cloud Infrastructure & Edge Network",
          statusText: "System operational (99.99%)",
          statusColor: "green",
          utilityLinks: [
            { label: "Global Status", href: "/status" },
            { label: "Documentation", href: "/docs" },
            { label: "Support", href: "/support" },
          ],
          menu: [
            {
              label: "Platform",
              href: "/platform",
              children: [
                {
                  label: "Compute Engine",
                  href: "/compute",
                  description: "Scalable virtual instances",
                },
                {
                  label: "Edge Functions",
                  href: "/edge",
                  description: "Sub-millisecond serverless",
                },
              ],
            },
            { label: "Solutions", href: "/solutions" },
            { label: "Enterprise", href: "/enterprise" },
            { label: "Pricing", href: "/pricing" },
          ],
          secondaryCta: { label: "Contact Sales", href: "/contact" },
          cta: { label: "Start Free Trial", href: "/signup" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-mega-menu-grid",
    type: "header",
    label: "Mega menu grid header",
    category: "Header",
    description:
      "Architectural bento mega-dropdown header with multi-column links and featured release card.",
    create: () =>
      createSection("header", {
        data: {
          design: "mega-menu-grid",
          siteName: "Stripe Scale",
          menu: [
            {
              label: "Products",
              href: "/products",
              children: [
                {
                  label: "Payments",
                  href: "/payments",
                  description: "Accept global online transactions",
                },
                {
                  label: "Billing",
                  href: "/billing",
                  description: "Flexible subscriptions & recurring invoices",
                },
                {
                  label: "Connect",
                  href: "/connect",
                  description: "Multi-party platforms & marketplaces",
                },
                {
                  label: "Radar",
                  href: "/radar",
                  description: "AI-driven fraud detection & security",
                },
              ],
            },
            {
              label: "Developers",
              href: "/developers",
              children: [
                {
                  label: "API Reference",
                  href: "/api",
                  description: "Complete REST and GraphQL endpoints",
                },
                {
                  label: "SDKs & Libraries",
                  href: "/sdks",
                  description: "Client libraries for 12 languages",
                },
                {
                  label: "Webhooks",
                  href: "/webhooks",
                  description: "Real-time event streaming",
                },
              ],
            },
            { label: "Customers", href: "/customers" },
            { label: "Pricing", href: "/pricing" },
          ],
          secondaryCta: { label: "Sign in", href: "/login" },
          cta: { label: "Create Account", href: "/signup" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-side-drawer",
    type: "header",
    label: "Side drawer curtain header",
    category: "Header",
    description:
      "Minimalist luxury bar with slide-over off-canvas navigation curtain.",
    create: () =>
      createSection("header", {
        data: {
          design: "side-drawer",
          siteName: "Atelier Studio",
          tagline: "Architecture & Spatial Design",
          menu: [
            {
              label: "Selected Works",
              href: "/works",
              description: "2022 — 2026 Portfolio",
            },
            {
              label: "Design Philosophy",
              href: "/philosophy",
              description: "Manifesto & Practices",
            },
            {
              label: "Publications",
              href: "/publications",
              description: "Monographs & Press",
            },
            {
              label: "The Studio",
              href: "/studio",
              description: "Team & Locations",
            },
            {
              label: "Contact Inquiries",
              href: "/contact",
              description: "Commissions & Press",
            },
          ],
          cta: { label: "Book Commission", href: "/contact" },
          sticky: true,
        },
      }),
  },
  {
    key: "header-headline-ticker",
    type: "header",
    label: "Headline ticker header",
    category: "Header",
    description:
      "Live broadcast ticker announcement marquee integrated with glass header.",
    create: () =>
      createSection("header", {
        data: {
          design: "headline-ticker",
          siteName: "NewsPulse Live",
          announcement:
            "🚀 Spring 2026 Release is live • Early access unlocked • Join 100,000+ creators building on Modulus",
          announcementLink: { label: "Learn more", href: "/changelog" },
          statusText: "LIVE 24/7",
          statusColor: "red",
          menu: [
            { label: "Stories", href: "/stories" },
            { label: "Broadcasts", href: "/broadcasts" },
            { label: "Podcasts", href: "/podcasts" },
            { label: "Markets", href: "/markets" },
          ],
          secondaryCta: { label: "Sign in", href: "/login" },
          cta: { label: "Subscribe $5/mo", href: "/subscribe" },
          sticky: true,
        },
      }),
  },
  {
    key: "footer-mega",
    type: "footer",
    label: "Footer · mega store",
    category: "Footer",
    description:
      "E-commerce footer with social icons, category columns, contact info, and payment badges.",
    create: () =>
      createSection("footer", {
        data: {
          design: "mega",
          siteName: "YOURSTORE",
          tagline: "Online Store",
          description:
            "Quality goods delivered worldwide. Dedicated customer support 24/7.",
          columns: [
            {
              title: "Categories",
              links: [
                { label: "Outdoors", href: "/outdoors" },
                { label: "Jewellery", href: "/jewellery" },
                { label: "Footwear", href: "/footwear" },
                { label: "Men", href: "/men" },
                { label: "Women", href: "/women" },
              ],
            },
            {
              title: "Information",
              links: [
                { label: "Specials", href: "/specials" },
                { label: "New Products", href: "/new" },
                { label: "Best Sellers", href: "/bestsellers" },
                { label: "Our Stores", href: "/stores" },
                { label: "Contact Us", href: "/contact" },
              ],
            },
            {
              title: "My Account",
              links: [
                { label: "My Orders", href: "/orders" },
                { label: "My Credit Slips", href: "/credit-slips" },
                { label: "My Addresses", href: "/addresses" },
                { label: "My Personal Info", href: "/account" },
              ],
            },
          ],
          contact: {
            title: "Contact Us",
            address: "42 Avenue Des Champs-Elysées, 75008 Paris, France",
            phone: "0123-456-789",
            email: "sales@yourcompany.com",
          },
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Pinterest", href: "https://pinterest.com" },
          ],
          paymentMethods: {
            enabled: true,
            methods: ["paypal", "amex", "discover", "mastercard", "visa"],
          },
          legalLinks: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ],
          copyright: "© 2026 YourStore. All rights reserved.",
        },
      }),
  },
  {
    key: "footer-newsletter",
    type: "footer",
    label: "Footer · newsletter & links",
    category: "Footer",
    description:
      "Horizontal navigation bar, contact details, newsletter signup, and payment methods.",
    create: () =>
      createSection("footer", {
        data: {
          design: "newsletter",
          siteName: "YOURSTORE",
          tagline: "Online Store",
          menu: [
            { label: "Woman", href: "/woman" },
            { label: "Man", href: "/man" },
            { label: "Lookbook", href: "/lookbook" },
            { label: "Sale", href: "/sale" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
          ],
          newsletter: {
            enabled: true,
            title: "Subscribe to News",
            description: "Get updates on new releases and promotions.",
            placeholder: "Enter email address",
            buttonText: "Subscribe",
          },
          contact: {
            address: "42 Avenue Des Champs-Elysées, 75008 Paris",
            phone: "0123-456-789",
            email: "sales@yourcompany.com",
          },
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Pinterest", href: "https://pinterest.com" },
          ],
          paymentMethods: {
            enabled: true,
            methods: ["paypal", "amex", "discover", "mastercard", "visa"],
          },
          copyright: "© 2026 YourStore. All rights reserved.",
        },
      }),
  },
  {
    key: "footer-split",
    type: "footer",
    label: "Footer · split navigation",
    category: "Footer",
    description:
      "Brand & social on left, horizontal links in middle, contact & payment badges on right.",
    create: () =>
      createSection("footer", {
        data: {
          design: "split",
          siteName: "YOURSTORE",
          tagline: "Online Store",
          menu: [
            { label: "Woman", href: "/woman" },
            { label: "Man", href: "/man" },
            { label: "Lookbook", href: "/lookbook" },
            { label: "Sale", href: "/sale" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
          ],
          contact: {
            address: "42 Avenue Des Champs-Elysées, Paris",
            phone: "0123-456-789",
          },
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Pinterest", href: "https://pinterest.com" },
          ],
          paymentMethods: {
            enabled: true,
            methods: ["paypal", "amex", "discover", "mastercard", "visa"],
          },
          copyright: "Design by Web builder · All Right Reserved",
        },
      }),
  },
  {
    key: "footer-inline",
    type: "footer",
    label: "Footer · inline logo & links",
    category: "Footer",
    description:
      "Minimal single-tier bar with logo, horizontal navigation links, and circular social icons.",
    create: () =>
      createSection("footer", {
        data: {
          design: "inline",
          siteName: "YOURSTORE",
          menu: [
            { label: "Woman", href: "/woman" },
            { label: "Man", href: "/man" },
            { label: "Lookbook", href: "/lookbook" },
            { label: "Sale", href: "/sale" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
          ],
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Pinterest", href: "https://pinterest.com" },
          ],
          copyright: "© 2026 YourStore. All rights reserved.",
        },
      }),
  },
  {
    key: "footer-centered",
    type: "footer",
    label: "Footer · centered brand",
    category: "Footer",
    description:
      "Centered brand logo, navigation links, social button row, and contact/copyright info.",
    create: () =>
      createSection("footer", {
        data: {
          design: "centered",
          siteName: "YOURSTORE",
          tagline: "Online Store",
          menu: [
            { label: "Woman", href: "/woman" },
            { label: "Man", href: "/man" },
            { label: "Lookbook", href: "/lookbook" },
            { label: "Sale", href: "/sale" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
          ],
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Pinterest", href: "https://pinterest.com" },
          ],
          contact: {
            address: "42 Avenue Des Champs-Elysées, 75008 Paris, France",
            phone: "0123-456-789",
            email: "sales@yourcompany.com",
          },
          copyright: "© 2026 YourStore. All rights reserved.",
        },
      }),
  },
  {
    key: "footer-cta-banner",
    type: "footer",
    label: "Footer · CTA banner",
    category: "Footer",
    description:
      "Prominent call-to-action banner atop link columns, social links, and copyright.",
    create: () =>
      createSection("footer", {
        data: {
          design: "cta-banner",
          siteName: "Acme Inc.",
          ctaBanner: {
            enabled: true,
            heading: "Ready to grow your online store?",
            subheading:
              "Join over 10,000+ happy merchants and launch in minutes.",
            primaryCta: { label: "Get started free", href: "/signup" },
            secondaryCta: { label: "Book a demo", href: "/demo" },
          },
          columns: [
            {
              title: "Product",
              links: [
                { label: "Features", href: "/features" },
                { label: "Integrations", href: "/integrations" },
                { label: "Pricing", href: "/pricing" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About us", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
              ],
            },
          ],
          social: [
            { label: "Twitter", href: "https://twitter.com" },
            { label: "GitHub", href: "https://github.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
          legalLinks: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ],
          copyright: "© 2026 Acme Inc. All rights reserved.",
        },
      }),
  },
  {
    key: "footer-columns",
    type: "footer",
    label: "Footer · multi-column",
    category: "Footer",
    description:
      "Brand summary, organized link columns, contact info, and social links.",
    create: () => createSection("footer"),
  },
  {
    key: "footer-simple",
    type: "footer",
    label: "Footer · simple",
    category: "Footer",
    description: "Minimal single-line footer with copyright and social links.",
    create: () => createSection("footer", { data: { design: "simple" } }),
  },
  {
    key: "hero-centered",
    type: "hero",
    label: "Hero · centered",
    category: "Hero",
    description: "Centered headline with badge and dual action buttons.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "centered",
          eyebrow: "Next-Gen Platform",
          badgeIcon: "✨",
          heading: "Build and scale your next big idea faster",
          highlightText: "faster",
          subheading:
            "Everything you need to launch a modern, high-converting digital experience in minutes.",
          primaryCta: { label: "Get started free", href: "/signup" },
          secondaryCta: { label: "Book a demo", href: "/demo" },
        },
      }),
  },
  {
    key: "hero-curved-carousel",
    type: "hero",
    label: "Hero · 3D video reel carousel",
    category: "Hero",
    description:
      "Curved 3D arc video reel banner with smooth continuous loop scrolling, doodles and CTA.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "curved-carousel",
          eyebrow: "Join over 100,000 happy creators",
          badgeIcon: "✨",
          heading: "Engage Audiences with Stunning Videos",
          highlightText: "Stunning Videos",
          subheading:
            "Boost Your Brand with High-Impact Short Videos from our expert content creators. Our team is ready to propel your business forward",
          primaryCta: { label: "Get Started", href: "/signup" },
          carouselDirection: "left-to-right",
          carouselSpeed: 45,
          curveIntensity: "medium",
          carouselSlides: [
            {
              title: "Cliffside Explorer",
              subtitle: "@marco_travels",
              badge: "Travel",
              image: {
                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Cliffside Explorer",
              },
            },
            {
              title: "Aesthetic Wellness",
              subtitle: "@glow_studios",
              badge: "Beauty",
              image: {
                url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Aesthetic Wellness",
              },
            },
            {
              title: "Vibrant Harvest",
              subtitle: "@citrus_kitchen",
              badge: "Food & Drink",
              image: {
                url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Vibrant Harvest",
              },
            },
            {
              title: "Morning Routine",
              subtitle: "@nourish_daily",
              badge: "Lifestyle",
              image: {
                url: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Morning Routine",
              },
            },
            {
              title: "Night Highway",
              subtitle: "@riders_journal",
              badge: "Automotive",
              image: {
                url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Night Highway",
              },
            },
            {
              title: "Artisan Refresh",
              subtitle: "@fresh_press",
              badge: "Culinary",
              image: {
                url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Artisan Refresh",
              },
            },
            {
              title: "Golden Hour Studio",
              subtitle: "@sarah_creates",
              badge: "Creator",
              image: {
                url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Golden Hour Studio",
              },
            },
            {
              title: "Urban Motion",
              subtitle: "@tokyo_street",
              badge: "Fashion",
              image: {
                url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Urban Motion",
              },
            },
          ],
        },
      }),
  },
  {
    key: "hero-campaign-banner",
    type: "hero",
    label: "Hero · Interactive Video Banner",
    category: "Hero",
    description:
      "Interactive hero banner with full-bleed looping video background, adjustable bottom shape divider, and floating stat cards.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "campaign-banner",
          contentAlign: "left",
          heading: "Empower Your Next Breakthrough 2026",
          subheading:
            "Join over 25,000 innovators, creators, and teams scaling high-impact digital experiences worldwide.",
          minHeight: "screen",
          backgroundVideoUrl: "/bannervid.mp4",
          backgroundImage: {
            url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80",
            alt: "Cinematic modern landscape backdrop",
          },
          bgOverlayType: "dark",
          overlayOpacity: 25,
          bottomShape: "curve",
          bannerBottomShape: "curved",
          bannerCurveDepth: 80,
          bottomDividerColor: "var(--wb-bg, #ffffff)",
          campaignStats: [
            { label: "Active Members", value: "12,450", icon: "users" },
            { label: "Milestones Hit", value: "320+", icon: "pin" },
          ],
          campaignProgress: {
            currency: "$",
            raisedAmount: "285,000",
            targetAmount: "300,000",
            raisedLabel: "funded",
            targetLabel: "of $300,000 milestone",
            percentage: 95,
            donateButton: { label: "Explore Platform", href: "#explore" },
            registerButton: { label: "Get Started Free →", href: "#start" },
          },
        },
      }),
  },
  {
    key: "hero-split",
    type: "hero",
    label: "Hero · split screen",
    category: "Hero",
    description:
      "Side-by-side headline, CTAs, and visual mockup with left/right toggle.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "split",
          imagePosition: "right",
          eyebrow: "Product Showcase",
          badgeIcon: "⚡",
          heading: "The smarter way to build websites",
          highlightText: "smarter way",
          subheading:
            "Design, iterate, and publish pixel-perfect web pages with full creative control.",
          primaryCta: { label: "Start free trial", href: "/signup" },
          tertiaryCta: { label: "Watch 2-min demo", href: "#demo" },
          imageStyle: "mockup",
        },
      }),
  },
  {
    key: "hero-platform-showcase",
    type: "hero",
    label: "Hero · platform showcase",
    category: "Hero",
    description:
      "Split screen hero with glowing platform dashboard visual and dual action buttons.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "split",
          eyebrow: "Growth Platform",
          badgeIcon: "🚀",
          heading: "Turn visitors into lifelong customers",
          highlightText: "lifelong customers",
          subheading:
            "Automate marketing, streamline workflows, and grow revenue effortlessly.",
          primaryCta: { label: "Get started", href: "/signup" },
          secondaryCta: { label: "View pricing", href: "/pricing" },
          image: {
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
            alt: "Platform growth metrics and analytics dashboard",
          },
          imageStyle: "glow",
        },
      }),
  },
  {
    key: "hero-gradient",
    type: "hero",
    label: "Hero · vibrant gradient",
    category: "Hero",
    description:
      "Modern radial mesh glow background with centered typography and trusted logos.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "gradient",
          eyebrow: "AI Powered Web Engine",
          badgeIcon: "🔥",
          heading: "Ship stunning digital experiences effortlessly",
          highlightText: "effortlessly",
          subheading:
            "From idea to live production site in minutes. No complex setup or maintenance required.",
          primaryCta: { label: "Launch your site", href: "/signup" },
          secondaryCta: { label: "Browse templates", href: "/templates" },
          trustedBy: {
            label: "Trusted by founders and product leaders worldwide",
            logos: [
              { label: "ACME Corp" },
              { label: "HyperScale" },
              { label: "Vortex Labs" },
              { label: "Pulse AI" },
            ],
          },
        },
      }),
  },
  {
    key: "hero-curved-bottom",
    type: "hero",
    label: "Hero · curved bottom wave",
    category: "Hero",
    description:
      "Hero with dynamic SVG wave bottom divider connecting smoothly to the next section.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "curved-bottom",
          bottomShape: "wave",
          eyebrow: "Creative Freedom",
          heading: "Design without limits or constraints",
          highlightText: "without limits",
          subheading:
            "Create gorgeous modern web pages tailored to your brand identity.",
          primaryCta: { label: "Get started today", href: "/signup" },
        },
      }),
  },
  {
    key: "hero-soft-card",
    type: "hero",
    label: "Hero · soft card container",
    category: "Hero",
    description:
      "Elevated rounded card container with glassmorphic border and soft shadow.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "soft-card",
          eyebrow: "Enterprise Ready",
          heading: "The all-in-one workspace for modern digital teams",
          highlightText: "all-in-one",
          subheading:
            "Collaborate, design, and manage your online presence seamlessly in one unified hub.",
          primaryCta: { label: "Start enterprise trial", href: "/signup" },
          secondaryCta: { label: "Contact sales", href: "/contact" },
          imageStyle: "mockup",
        },
      }),
  },
  {
    key: "hero-minimal-typography",
    type: "hero",
    label: "Hero · minimal bold typography",
    category: "Hero",
    description:
      "Bold oversized typography statement hero with clean dual buttons.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "minimal-typography",
          eyebrow: "Simplicity First",
          heading: "Design crafted for clarity.",
          subheading:
            "We build intuitive, high-performance web products that leave a lasting impression.",
          primaryCta: { label: "View our work", href: "/services" },
          secondaryCta: { label: "Get in touch", href: "/contact" },
        },
      }),
  },
  {
    key: "hero-asymmetric",
    type: "hero",
    label: "Hero · asymmetric layout",
    category: "Hero",
    description: "Modern offset asymmetric grid with angled visual card.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "asymmetric",
          eyebrow: "Modern Architecture",
          heading: "Reimagining the future of digital commerce",
          highlightText: "future",
          subheading:
            "Deliver lighting fast, personalized shopping experiences that scale infinitely.",
          primaryCta: { label: "Discover more", href: "/features" },
          imageStyle: "glow",
        },
      }),
  },
  {
    key: "hero-background-image",
    type: "hero",
    label: "Hero · background image overlay",
    category: "Hero",
    description:
      "Full-width background image with dark overlay and centered high-contrast text.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "background-image",
          backgroundImage: {
            url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=80",
            alt: "Atmospheric team collaboration",
          },
          bgImagePosition: "cover",
          bgOverlayType: "dark",
          overlayOpacity: 70,
          overlayBlur: true,
          eyebrow: "Atmospheric Presence",
          heading: "Experience the ultimate in quality and craftsmanship",
          highlightText: "craftsmanship",
          subheading:
            "Every detail engineered with passion to elevate your brand above the rest.",
          primaryCta: { label: "Explore collection", href: "/products" },
          secondaryCta: { label: "About our story", href: "/about" },
        },
      }),
  },
  {
    key: "hero-video-bg",
    type: "hero",
    label: "Hero · video background & demo",
    category: "Hero",
    description:
      "Immersive video background with dark overlay and play video CTA.",
    create: () =>
      createSection("hero", {
        data: {
          variant: "video-bg",
          videoUrl:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          imageStyle: "glow",
          bgOverlayType: "dark",
          overlayOpacity: 65,
          eyebrow: "Cinematic Experience",
          badgeIcon: "🎬",
          heading: "Bring your story to life with motion",
          highlightText: "to life",
          subheading:
            "Captivate your audience with high-impact visuals and rich media presentations.",
          primaryCta: { label: "Start watching", href: "#watch" },
          tertiaryCta: { label: "Play trailer", href: "#play" },
        },
      }),
  },
  {
    key: "hero-banner",
    type: "hero",
    label: "Hero · colour banner",
    category: "Hero",
    description: "Centered headline on your primary colour.",
    create: () =>
      createSection("hero", { settings: { background: "primary" } }),
  },
  {
    key: "features-pastel",
    type: "features",
    label: "Features · pastel highlights",
    category: "Features",
    description:
      "4-column minimalist features with soft pastel circular icon badges and clean bottom link.",
    create: () =>
      createSection("features", {
        data: {
          variant: "pastel-icons",
          iconStyle: "pastel-circle",
          cardStyle: "transparent",
          align: "center",
          heading: "Our Features",
          intro:
            "Unleash your creativity with a visual collaboration platform that enables effective ideation.",
          columns: 4,
          mobileColumns: 2,
          bottomCta: { label: "Learn more", href: "/features" },
          items: [
            {
              icon: "gear",
              iconColor: "orange",
              title: "Choosing a Service",
              description: "Choosing an accountant that matches your needs.",
            },
            {
              icon: "user",
              iconColor: "green",
              title: "Our Clients Say",
              description:
                "Read the reviews from some of our satisfied clients.",
            },
            {
              icon: "mail",
              iconColor: "yellow",
              title: "Initial Consultation",
              description: "Understanding your accountancy requirements.",
            },
            {
              icon: "phone",
              iconColor: "cyan",
              title: "Request a Callback",
              description: "Let's talk at a more convenient time for you.",
            },
          ],
        },
      }),
  },
  {
    key: "features-split-showcase",
    type: "features",
    label: "Features · split screen showcase",
    category: "Features",
    description:
      "Headline & 3D isometric dashboard visual on left with stacked elevated feature cards on right.",
    create: () =>
      createSection("features", {
        data: {
          variant: "split",
          splitPosition: "left",
          eyebrow: "Product Capabilities",
          heading: "Exclusive Features.",
          intro:
            "Data should underlie every business decision. Yet too often cultural artifacts lead the business down the wrong routes.",
          splitCta: { label: "Explore More", href: "/features" },
          iconStyle: "square-badge",
          items: [
            {
              icon: "check",
              iconColor: "green",
              title: "Easy To Use",
              description:
                "The Isaac SDK robotics developer toolbox designed to change that with general availability.",
            },
            {
              icon: "chart",
              iconColor: "yellow",
              title: "Daily Report",
              description:
                "Comprehensive analytics and automated daily summary digests for your entire team.",
            },
            {
              icon: "clock",
              iconColor: "blue",
              title: "Real Time",
              description:
                "Instant data synchronization and lightning-fast low latency updates across all platforms.",
            },
            {
              icon: "shield",
              iconColor: "pink",
              title: "Extreme Security",
              description:
                "Enterprise-grade end-to-end data encryption and compliance safeguards by default.",
            },
          ],
        },
      }),
  },
  {
    key: "features-minimal-grid",
    type: "features",
    label: "Features · minimal clean grid",
    category: "Features",
    description:
      "Clean 3-column minimalist layout with bold accent icons and spacious typography.",
    create: () =>
      createSection("features", {
        data: {
          variant: "minimal",
          iconStyle: "minimal-accent",
          cardStyle: "transparent",
          align: "center",
          columns: 3,
          mobileColumns: 1,
          heading: "Amazing Features",
          intro:
            "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.",
          items: [
            {
              icon: "gear",
              iconColor: "blue",
              title: "Powerful Dashboard",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
            {
              icon: "tools",
              iconColor: "blue",
              title: "User Friendly",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
            {
              icon: "bell",
              iconColor: "blue",
              title: "Smart Notifications",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
            {
              icon: "wallet",
              iconColor: "blue",
              title: "Cost Control",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
            {
              icon: "pointer",
              iconColor: "blue",
              title: "Unique Features",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
            {
              icon: "help",
              iconColor: "blue",
              title: "Support 24/7",
              description:
                "Utise wisi enim minim veniam, quis et stationes ullamcorper suscipit ets lobortis nisle consequat nihis etim.",
            },
          ],
        },
      }),
  },
  {
    key: "features-cards-elevated",
    type: "features",
    label: "Features · elevated modern cards",
    category: "Features",
    description:
      "Modern container cards with subtle borders and smooth hover lift.",
    create: () =>
      createSection("features", {
        data: {
          variant: "cards",
          iconStyle: "pastel-circle",
          cardStyle: "surface",
          align: "left",
          heading: "Engineered for speed and security",
          intro:
            "Discover the cutting-edge features powering next-generation websites.",
          columns: 3,
          mobileColumns: 1,
          items: [
            {
              icon: "sparkles",
              iconColor: "purple",
              badge: "AI Powered",
              title: "Smart Automation",
              description:
                "Save hundreds of hours with intelligent workflows and real-time assisted editing.",
            },
            {
              icon: "rocket",
              iconColor: "orange",
              badge: "Blazing Fast",
              title: "Instant Global CDN",
              description:
                "Lightning fast delivery edge-cached across 300+ worldwide edge nodes.",
            },
            {
              icon: "lock",
              iconColor: "green",
              badge: "Enterprise",
              title: "Bank-Grade Protection",
              description:
                "Automatic SSL certificates, DDoS mitigation, and continuous vulnerability scans.",
            },
          ],
        },
      }),
  },
  {
    key: "features-3",
    type: "features",
    label: "Features · 3 columns",
    category: "Features",
    description: "Three benefits with icons.",
    create: () => createSection("features"),
  },
  {
    key: "features-4-surface",
    type: "features",
    label: "Features · 4 columns",
    category: "Features",
    description: "Four compact benefits on a tinted background.",
    create: () =>
      createSection("features", {
        settings: { background: "surface" },
        data: {
          columns: 4,
          mobileColumns: 2,
          items: [
            {
              icon: "check",
              title: "Quality",
              description: "Describe this benefit.",
            },
            {
              icon: "star",
              title: "Experience",
              description: "Describe this benefit.",
            },
            {
              icon: "chat",
              title: "Support",
              description: "Describe this benefit.",
            },
            {
              icon: "shield",
              title: "Trusted",
              description: "Describe this benefit.",
            },
          ],
        },
      }),
  },
  {
    key: "services-bento",
    type: "services",
    label: "Services · Bento grid",
    category: "Services",
    description:
      "Modern 2026 asymmetric bento layout with a featured spotlight hero card.",
    create: () =>
      createSection("services", {
        data: {
          variant: "bento-grid",
          eyebrow: "CORE CAPABILITIES",
          heading: "Engineered for high performance",
          intro:
            "Explore our modular suite of creative and technical services.",
          columns: 3,
          mobileColumns: 1,
          cardStyle: "bordered",
          iconStyle: "square-badge",
          bottomCta: { label: "Schedule a discovery call", href: "/contact" },
          items: [
            {
              title: "Full-Stack Web Applications",
              description:
                "Scalable cloud architectures, blazing fast interactive frontends, and robust API backends built to scale effortlessly.",
              badge: "Flagship",
              badgeColor: "blue",
              icon: "code",
              iconColor: "blue",
              price: "From $3,500",
              duration: "4-6 weeks",
              featured: true,
              features: [
                "React, Next.js & TypeScript architecture",
                "High-performance cloud database & caching",
                "Enterprise security, authentication & CI/CD",
                "Full analytics & telemetry instrumentation",
              ],
              link: { label: "View technical specs", href: "/contact" },
            },
            {
              title: "Product Design & UX",
              description:
                "User research, wireframing, and design systems in Figma.",
              badge: "Design",
              badgeColor: "purple",
              icon: "sparkles",
              iconColor: "purple",
              price: "$1,800",
              features: [
                "Interactive prototypes",
                "Design tokens & components",
              ],
              link: { label: "Learn more", href: "/contact" },
            },
            {
              title: "Performance & SEO Optimization",
              description: "Core Web Vitals tuning and technical search audit.",
              badge: "Speed",
              badgeColor: "green",
              icon: "bolt",
              iconColor: "green",
              price: "$950",
              features: ["Sub-second load times", "Lighthouse 95+ score"],
              link: { label: "Learn more", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "services-split",
    type: "services",
    label: "Services · Split showcase",
    category: "Services",
    description:
      "Sticky hero showcase on one side with structured service cards alongside.",
    create: () =>
      createSection("services", {
        data: {
          variant: "split-showcase",
          splitPosition: "left",
          eyebrow: "WHAT WE DELIVER",
          heading: "End-to-end digital excellence",
          intro:
            "From concept to deployment, we partner with visionary teams to build market-defining digital products.",
          splitTagline:
            "Trusted by 500+ forward-thinking organizations worldwide.",
          splitCta: { label: "Start your project", href: "/contact" },
          secondaryCta: { label: "Our methodology", href: "/about" },
          cardStyle: "surface",
          iconStyle: "pastel-circle",
          items: [
            {
              title: "Experience Design",
              description:
                "Creating intuitive interfaces that turn complex workflows into delightful customer journeys.",
              badge: "UX / UI",
              badgeColor: "orange",
              icon: "pointer",
              iconColor: "orange",
              price: "From $1,500",
              features: [
                "Journey mapping",
                "High-fidelity prototypes",
                "Usability testing",
              ],
              link: { label: "Explore UX", href: "/contact" },
            },
            {
              title: "Modern Engineering",
              description:
                "Clean, maintainable codebases with state-of-the-art responsiveness and maximum uptime.",
              badge: "Dev",
              badgeColor: "cyan",
              icon: "layers",
              iconColor: "cyan",
              price: "From $2,800",
              features: [
                "TypeScript & Tailwind",
                "Automated testing",
                "Zero-downtime deployment",
              ],
              link: { label: "Explore Dev", href: "/contact" },
            },
            {
              title: "AI Integration & Automation",
              description:
                "Embed intelligent workflows, automated pipelines, and generative assistants directly into your product.",
              badge: "AI 2026",
              badgeColor: "purple",
              icon: "sparkles",
              iconColor: "purple",
              price: "From $2,200",
              features: [
                "LLM API orchestration",
                "Vector embeddings",
                "Autonomous background workers",
              ],
              link: { label: "Explore AI", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "services-interactive",
    type: "services",
    label: "Services · Interactive agency list",
    category: "Services",
    description:
      "Awwwards-style full-width row list with live hover media preview.",
    create: () =>
      createSection("services", {
        data: {
          variant: "interactive-list",
          eyebrow: "AGENCY CAPABILITIES",
          heading: "Our specialized practices",
          intro:
            "Hover over each practice to explore deliverables and engagement details.",
          bottomCta: { label: "Request a custom proposal", href: "/contact" },
          items: [
            {
              title: "Digital Brand Positioning",
              description:
                "Crafting distinct voice, tone, positioning pillars, and comprehensive visual systems.",
              badge: "Strategy",
              badgeColor: "blue",
              icon: "star",
              price: "Sprint · $2,500",
              features: [
                "Brand archetype definition",
                "Visual guidelines",
                "Asset library",
              ],
              link: { label: "Book sprint", href: "/contact" },
            },
            {
              title: "Flagship Web Platforms",
              description:
                "Custom headless websites with cinematic interactions, fluid motion, and lightning-fast speed.",
              badge: "Production",
              badgeColor: "purple",
              icon: "rocket",
              price: "Project · $4,800",
              features: [
                "Custom 3D / WebGL visuals",
                "CMS integration",
                "Global CDN delivery",
              ],
              link: { label: "Book project", href: "/contact" },
            },
            {
              title: "Growth Funnel Optimization",
              description:
                "Systematic experimentation, landing page split-testing, and retention automation.",
              badge: "Growth",
              badgeColor: "green",
              icon: "chart",
              price: "Monthly · $1,500",
              features: [
                "A/B landing page testing",
                "Funnel analytics",
                "Conversion optimization",
              ],
              link: { label: "Start growth", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "services-horizontal",
    type: "services",
    label: "Services · Horizontal detailed cards",
    category: "Services",
    description:
      "Expansive horizontal rows with side-by-side details, checklists, and dual buttons.",
    create: () =>
      createSection("services", {
        data: {
          variant: "horizontal-cards",
          eyebrow: "ENTERPRISE SOLUTIONS",
          heading: "Full-cycle digital transformation",
          intro:
            "Comprehensive service engagements designed for scale and enterprise reliability.",
          cardStyle: "bordered",
          iconStyle: "square-badge",
          items: [
            {
              title: "Custom SaaS & Platform Engineering",
              description:
                "End-to-end architecture and engineering of robust software-as-a-service platforms, multi-tenant portals, and secure cloud workflows.",
              badge: "Enterprise",
              badgeColor: "blue",
              icon: "code",
              iconColor: "blue",
              price: "$5,000+",
              duration: "6-8 weeks",
              features: [
                "SOC2 & GDPR compliance standards",
                "Role-based access control (RBAC)",
                "Automated CI/CD & infrastructure-as-code",
              ],
              link: { label: "Discuss architecture", href: "/contact" },
              secondaryLink: { label: "Case studies", href: "/portfolio" },
            },
            {
              title: "Design System & UI Component Library",
              description:
                "Unified cross-platform design token architecture and accessible component libraries built for high velocity team execution.",
              badge: "Design Ops",
              badgeColor: "purple",
              icon: "layers",
              iconColor: "purple",
              price: "$3,200",
              duration: "3-4 weeks",
              features: [
                "WCAG 2.1 AA accessibility guaranteed",
                "Storybook documentation & live test suite",
                "Figma-to-code automated syncing",
              ],
              link: { label: "Explore design systems", href: "/contact" },
              secondaryLink: { label: "Live demo", href: "#" },
            },
          ],
        },
      }),
  },
  {
    key: "services-editorial",
    type: "services",
    label: "Services · Minimal numbered consulting",
    category: "Services",
    description:
      "Luxury consulting style with large elegant numerals and structured deliverables.",
    create: () =>
      createSection("services", {
        data: {
          variant: "minimal-numbered",
          eyebrow: "PRACTICE AREAS",
          heading: "Advisory & Strategic Execution",
          intro:
            "Discrete, high-impact consulting for leaders navigating digital transformation.",
          columns: 3,
          mobileColumns: 1,
          align: "left",
          items: [
            {
              title: "01. Technology Audit & Roadmap",
              description:
                "Rigorous assessment of technical debt, cloud cost efficiency, and architecture modernization.",
              badge: "Advisory",
              badgeColor: "gray",
              features: [
                "Architecture review",
                "Security risk report",
                "12-month tech roadmap",
              ],
              link: { label: "Request audit", href: "/contact" },
            },
            {
              title: "02. AI Strategy & Implementation",
              description:
                "Pragmatic integration of machine learning and generative workflows that create real operational leverage.",
              badge: "Strategy",
              badgeColor: "indigo",
              features: [
                "Workflow automation audit",
                "Model evaluation",
                "Custom fine-tuning plan",
              ],
              link: { label: "Learn more", href: "/contact" },
            },
            {
              title: "03. Fractional CTO & Tech Leadership",
              description:
                "Executive-level engineering leadership to guide hiring, technical vision, and board alignment.",
              badge: "Leadership",
              badgeColor: "orange",
              features: [
                "Sprint cadence governance",
                "Team hiring & coaching",
                "Vendor evaluation",
              ],
              link: { label: "Learn more", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "services-grid",
    type: "services",
    label: "Services · Modern cards grid",
    category: "Services",
    description:
      "A polished card grid with badges, price pills, and action buttons.",
    create: () => createSection("services"),
  },
  {
    key: "services-links",
    type: "services",
    label: "Services · 2 columns with links",
    category: "Services",
    description:
      "Spacious 2-column cards, each linking directly to service details.",
    create: () =>
      createSection("services", {
        data: {
          columns: 2,
          cardStyle: "glow",
          items: [
            {
              title: "Design & Creative Direction",
              description:
                "Holistic brand experiences that captivate audiences and establish market leadership.",
              badge: "Creative",
              badgeColor: "orange",
              icon: "sparkles",
              price: "From $1,500",
              features: [
                "Visual identity design",
                "3D assets & animations",
                "Design token guidelines",
              ],
              link: { label: "Explore creative", href: "/contact" },
            },
            {
              title: "Web & Software Engineering",
              description:
                "Next-generation applications built with speed, accessibility, and clean scalable architecture.",
              badge: "Engineering",
              badgeColor: "cyan",
              icon: "code",
              price: "From $2,800",
              features: [
                "Modern component libraries",
                "API integrations & serverless",
                "Lighthouse 98+ guarantee",
              ],
              link: { label: "Explore engineering", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "testimonials-cards",
    type: "testimonials",
    label: "Testimonials · Cards Grid",
    category: "Social proof",
    description: "Clean multi-column testimonial cards with gold stars, verified badges, and author avatars.",
    create: () =>
      createSection("testimonials", {
        data: {
          variant: "cards-grid",
          columns: 3,
          cardStyle: "default",
          align: "center",
          showRatings: true,
          showAvatars: true,
          showBadges: true,
        },
        settings: { background: "surface" },
      }),
  },
  {
    key: "testimonials-carousel",
    type: "testimonials",
    label: "Testimonials · Interactive Carousel",
    category: "Social proof",
    description: "Smooth interactive quote stage with slide dots, watermark quote icon, and navigation arrows.",
    create: () =>
      createSection("testimonials", {
        data: {
          variant: "carousel-slider",
          cardStyle: "elevated",
          align: "center",
          showRatings: true,
          showAvatars: true,
          showBadges: true,
        },
        settings: { background: "default" },
      }),
  },
  {
    key: "testimonials-marquee",
    type: "testimonials",
    label: "Testimonials · Infinite Wall Marquee",
    category: "Social proof",
    description: "Hardware-accelerated 60fps infinite social proof ticker tape with pause on hover.",
    create: () =>
      createSection("testimonials", {
        data: {
          variant: "marquee-wall",
          cardStyle: "bordered",
          align: "center",
          showRatings: true,
          showAvatars: true,
          showBadges: true,
        },
        settings: { background: "surface" },
      }),
  },
  {
    key: "testimonials-spotlight",
    type: "testimonials",
    label: "Testimonials · Executive Spotlight",
    category: "Social proof",
    description: "Asymmetric split with hero customer quote, outcome metric, and supporting testimonial stack.",
    create: () =>
      createSection("testimonials", {
        data: {
          variant: "spotlight-featured",
          cardStyle: "glass",
          align: "left",
          showRatings: true,
          showAvatars: true,
          showBadges: true,
        },
        settings: { background: "default" },
      }),
  },
  {
    key: "testimonials-editorial",
    type: "testimonials",
    label: "Testimonials · Swiss Editorial Minimal",
    category: "Social proof",
    description: "Understated typographic minimalism with architectural hairline dividers and refined quotes.",
    create: () =>
      createSection("testimonials", {
        data: {
          variant: "minimal-editorial",
          cardStyle: "flat",
          align: "left",
          showRatings: true,
          showAvatars: true,
          showBadges: false,
        },
        settings: { background: "default" },
      }),
  },
  {
    key: "faq-accordion",
    type: "faq",
    label: "FAQ · Modern Accordion",
    category: "FAQ",
    description:
      "Centered accordion with category pills, micro chevron transitions, and support footer.",
    create: () =>
      createSection("faq", {
        data: {
          variant: "accordion-classic",
          eyebrow: "COMMON QUESTIONS",
          heading: "Frequently asked questions",
          intro:
            "Everything you need to know about our product, pricing, and onboarding process.",
          supportCta: {
            title: "Still have questions?",
            description:
              "Can't find what you're looking for? Reach out to our dedicated support engineering team.",
            link: { label: "Contact support", href: "/contact" },
          },
          items: [
            {
              question: "How does the onboarding and deployment process work?",
              answer:
                "Once you choose your package, you will get instant access to your dedicated dashboard. We provision your staging environments within 24 hours and begin collaboration directly via Slack or email.",
              category: "Onboarding",
              badge: "Popular",
              isOpenDefault: true,
            },
            {
              question:
                "Can I upgrade, downgrade, or cancel my subscription at any time?",
              answer:
                "Yes, absolutely. There are no lock-in contracts. You can change plans or cancel anytime directly from your account settings with a single click.",
              category: "Billing",
            },
            {
              question:
                "Is custom domain integration and SSL certificate included?",
              answer:
                "Yes. Every published website receives automatic SSL encryption with global edge CDN distribution for sub-second page loads worldwide.",
              category: "Security",
            },
            {
              question:
                "Do you support custom integrations with CRMs and webhooks?",
              answer:
                "Yes, our system supports turnkey integrations with HubSpot, Salesforce, Zapier, and custom HTTP webhooks for automated lead routing.",
              category: "Integrations",
            },
          ],
        },
      }),
  },
  {
    key: "faq-grid",
    type: "faq",
    label: "FAQ · 2-Column Matrix",
    category: "FAQ",
    description:
      "Spacious two-column grid matrix for dense, well-organized documentation and support.",
    create: () =>
      createSection("faq", {
        data: {
          variant: "two-column-grid",
          eyebrow: "HELP CENTER",
          heading: "Answers to common questions",
          intro:
            "Quickly browse our most frequent questions across product, engineering, and account management.",
          items: [
            {
              question: "What web frameworks and technologies are supported?",
              answer:
                "We support React, Next.js, and static vanilla HTML/CSS exports with zero vendor lock-in.",
              category: "Engineering",
            },
            {
              question:
                "How are software updates and security patches handled?",
              answer:
                "All core libraries and security patches are automatically updated in the cloud with zero downtime.",
              category: "Security",
            },
            {
              question: "Can multiple team members collaborate simultaneously?",
              answer:
                "Yes. Role-based permissions allow designers, copywriters, and developers to work seamlessly together.",
              category: "Collaboration",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, Stripe, Apple Pay, Google Pay, and bank wire transfers for enterprise tiers.",
              category: "Billing",
            },
          ],
        },
      }),
  },
  {
    key: "faq-split",
    type: "faq",
    label: "FAQ · Sticky Sidebar + Stack",
    category: "FAQ",
    description:
      "Asymmetric split layout with sticky sidebar heading, contact CTA, and clean accordion stack.",
    create: () =>
      createSection("faq", {
        data: {
          variant: "split-sidebar",
          eyebrow: "SUPPORT & FAQS",
          heading: "Got questions? We've got answers.",
          intro:
            "Find clear answers to standard questions, or get in touch with our team for personalized assistance.",
          supportCta: {
            title: "Need custom advisory?",
            description: "Speak with a solutions architect today.",
            link: { label: "Schedule a Call", href: "/contact" },
          },
          items: [
            {
              question:
                "What is your typical turnaround time for custom setups?",
              answer:
                "Standard deployments are live within 48 to 72 hours. Enterprise custom builds typically take 2 to 3 weeks depending on scope.",
              isOpenDefault: true,
            },
            {
              question: "Do you provide dedicated post-launch maintenance?",
              answer:
                "Yes, every engagement includes at least 30 days of warranty support with optional continuous retainer bandwidth.",
            },
            {
              question: "How does the SEO and page speed optimization work?",
              answer:
                "We implement automated OpenGraph meta tags, clean semantic HTML5, and asset minification to ensure 95+ Google Lighthouse scores.",
            },
            {
              question: "Where is our site data hosted and backed up?",
              answer:
                "Data is hosted on enterprise cloud infrastructure with automated daily snapshots and 99.99% guaranteed uptime.",
            },
          ],
        },
      }),
  },
  {
    key: "faq-minimal",
    type: "faq",
    label: "FAQ · Swiss Architectural",
    category: "FAQ",
    description:
      "Minimalist editorial layout with hairline dividers, numbered indices (01, 02), and bold typography.",
    create: () =>
      createSection("faq", {
        data: {
          variant: "minimal-numbered",
          eyebrow: "TRANSPARENCY",
          heading: "Questions & Insights",
          intro:
            "A clear overview of our operational standards, agreements, and execution.",
          items: [
            {
              question: "What makes your architectural approach different?",
              answer:
                "We prioritize ultra-clean codebases, zero bloated dependencies, and pixel-perfect design craftsmanship that performs at scale.",
              isOpenDefault: true,
            },
            {
              question: "How are project milestones and revisions structured?",
              answer:
                "Each project follows structured 2-week sprints with transparent milestone reviews and unlimited revision rounds within scope.",
            },
            {
              question: "Do I own 100% of the Intellectual Property and code?",
              answer:
                "Yes. Upon final delivery, all intellectual property, source code, designs, and assets belong entirely to you.",
            },
            {
              question:
                "What SLA guarantees are provided for production outages?",
              answer:
                "Enterprise tiers include 99.99% uptime SLAs with a guaranteed 1-hour critical response window 24/7.",
            },
          ],
        },
      }),
  },
  {
    key: "faq-cards",
    type: "faq",
    label: "FAQ · Categorized Boxed Modules",
    category: "FAQ",
    description:
      "Boxed 3-column surface cards with category tags, clean question headers, and direct answers.",
    create: () =>
      createSection("faq", {
        data: {
          variant: "categorized-cards",
          eyebrow: "KNOWLEDGE BASE",
          heading: "Essential information",
          intro: "Explore modular answers categorized for quick discovery.",
          items: [
            {
              question: "How secure is data transmission?",
              answer:
                "All communications are encrypted end-to-end using TLS 1.3 with AES-256 bit encryption at rest.",
              category: "Security",
            },
            {
              question: "Can I export my data at any time?",
              answer:
                "Yes. You can export all content, media, and site structures into standard JSON or zip archives anytime.",
              category: "Data Portability",
            },
            {
              question: "What level of support is included?",
              answer:
                "All plans include priority email support with standard 4-hour turnaround during business days.",
              category: "Support",
            },
          ],
        },
      }),
  },
  {
    key: "faq",
    type: "faq",
    label: "FAQ · 2 Questions (Simple)",
    category: "FAQ",
    description: "Questions that open to show the answer.",
    create: () => createSection("faq"),
  },
  {
    key: "cta-centered",
    type: "cta",
    label: "CTA · Centered Executive Banner",
    category: "CTA",
    description:
      "Centered high-impact callout with live pulse dot, dual actions, and trust checklist.",
    create: () =>
      createSection("cta", {
        data: {
          variant: "centered-card",
          eyebrow: "READY TO ACCELERATE",
          heading: "Build something extraordinary today",
          text: "Join thousands of product teams shipping delightful, high-converting digital experiences with our modern platform.",
          button: { label: "Get Started Free", href: "/contact" },
          secondaryButton: { label: "Book a Demo", href: "/contact" },
          trustBadges: [
            "No credit card required",
            "Instant 2-minute setup",
            "Cancel anytime",
          ],
        },
      }),
  },
  {
    key: "cta-split",
    type: "cta",
    label: "CTA · Split Metric Showcase",
    category: "CTA",
    description:
      "Asymmetric split layout pairing a strong pitch with an architectural live metric card.",
    create: () =>
      createSection("cta", {
        data: {
          variant: "split-visual",
          eyebrow: "ENTERPRISE PERFORMANCE",
          heading: "Scale your workflow with zero infrastructure overhead",
          text: "Deploy production-grade experiences backed by automated global CDN routing and sovereign cloud encryption.",
          button: { label: "Start Free Trial", href: "/contact" },
          secondaryButton: { label: "Explore Platform", href: "/about" },
          trustBadges: [
            "SOC2 Type II certified",
            "99.99% SLA guarantee",
            "Dedicated Slack channel",
          ],
          highlightMetric: {
            value: "99.99%",
            label: "Enterprise Uptime SLA",
            subtext: "Monitored across 34 global availability zones 24/7.",
          },
        },
      }),
  },
  {
    key: "cta-floating",
    type: "cta",
    label: "CTA · Floating Ambient Card",
    category: "CTA",
    description:
      "Framed ambient glassmorphism card with prominent typography and dual action cluster.",
    create: () =>
      createSection("cta", {
        data: {
          variant: "floating-card",
          cardStyle: "glass",
          eyebrow: "GET IN TOUCH",
          heading: "Let’s create your next breakthrough project",
          text: "Have a new concept or need dedicated engineering bandwidth? Our design engineers are ready to collaborate.",
          button: { label: "Schedule Discovery Call", href: "/contact" },
          secondaryButton: { label: "View Portfolio", href: "/work" },
          trustBadges: ["14-day warranty", "Direct team access"],
        },
      }),
  },
  {
    key: "cta-editorial",
    type: "cta",
    label: "CTA · Swiss Architectural Line",
    category: "CTA",
    description:
      "Stark editorial callout with top/bottom hairline borders and high-contrast typography.",
    create: () =>
      createSection("cta", {
        data: {
          variant: "minimal-editorial",
          eyebrow: "NEXT STEPS",
          heading: "Take the next step in your digital journey.",
          text: "Direct advisory and end-to-end execution for founders who value precision craftsmanship.",
          button: { label: "Begin Engagement", href: "/contact" },
          secondaryButton: { label: "Read Case Studies", href: "/about" },
          trustBadges: ["Fixed sprint scopes", "100% IP ownership"],
        },
      }),
  },
  {
    key: "cta-banner",
    type: "cta",
    label: "Call to action · banner",
    category: "CTA",
    description: "One clear next step on your primary colour.",
    create: () => createSection("cta", { settings: { background: "primary" } }),
  },
  {
    key: "cta-light",
    type: "cta",
    label: "Call to action · light",
    category: "CTA",
    description: "Subtle call to action on a tinted background.",
    create: () => createSection("cta", { settings: { background: "surface" } }),
  },
  {
    key: "contact-split",
    type: "contact",
    label: "Contact · Asymmetric Split Screen",
    category: "Contact",
    description:
      "Modern split layout with live response badges, direct links, and inquiry form.",
    create: () =>
      createSection("contact", {
        data: {
          variant: "split-form",
          eyebrow: "GET IN TOUCH • FAST RESPONSE",
          heading: "Let's build something exceptional together.",
          text: "Have a project in mind or need expert consultation? Reach out and our team will get back to you promptly.",
          responseTime: "Average response: < 2 hours",
          officeHours: "Mon – Fri: 9:00 AM – 6:00 PM EST",
          email: "hello@example.com",
          phone: "+1 (555) 234-5678",
          address: "100 Innovation Blvd, Suite 400, New York, NY",
          showForm: true,
          formHeading: "Send a direct inquiry",
          submitLabel: "Send Message",
          serviceOptions: [
            "Web Development",
            "UI/UX Design",
            "Cloud Infrastructure",
            "Consulting",
          ],
        },
      }),
  },
  {
    key: "contact-hub",
    type: "contact",
    label: "Contact · Multi-Channel Hub Cards",
    category: "Contact",
    description:
      "Dedicated cards for Sales, Support, Press, and Office locations.",
    create: () =>
      createSection("contact", {
        data: {
          variant: "cards-hub",
          eyebrow: "DIRECT COMMUNICATION CHANNELS",
          heading: "Connect with the right team directly.",
          text: "Choose the dedicated channel best suited for your inquiry to get fastest resolution.",
          responseTime: "Active triage Mon-Fri",
          showForm: true,
          formHeading: "Or send a general message",
          submitLabel: "Submit Request",
          channels: [
            {
              label: "Sales & Inquiries",
              description:
                "Talk to our product specialists about custom solutions.",
              value: "sales@example.com",
              icon: "mail",
            },
            {
              label: "Customer Support",
              description:
                "24/7 dedicated technical assistance for existing users.",
              value: "+1 (800) 555-0199",
              icon: "phone",
            },
            {
              label: "Direct Advisory & Chat",
              description: "Speak directly with our senior system architects.",
              value: "advisory@example.com",
              icon: "chat",
            },
          ],
        },
      }),
  },
  {
    key: "contact-editorial",
    type: "contact",
    label: "Contact · Minimal Architectural Editorial",
    category: "Contact",
    description:
      "Swiss architectural minimalist layout with clean hairline dividers.",
    create: () =>
      createSection("contact", {
        data: {
          variant: "minimal-editorial",
          eyebrow: "INQUIRIES & ADVISORY",
          heading: "Start a conversation.",
          text: "We partner with ambitious teams worldwide. Tell us about your objectives.",
          responseTime: "Direct partner response",
          email: "contact@studio.example",
          phone: "+1 (555) 890-1234",
          address: "500 Madison Avenue, 18th Floor, New York, NY",
          showForm: true,
          formHeading: "Project details",
          submitLabel: "Request Consultation",
          serviceOptions: [
            "Brand Strategy",
            "Digital Products",
            "Architecture",
          ],
        },
      }),
  },
  {
    key: "contact-glass",
    type: "contact",
    label: "Contact · Floating Framed Glass",
    category: "Contact",
    description:
      "Ambient frosted glass card with glowing backdrop and pill selectors.",
    create: () =>
      createSection("contact", {
        settings: { background: "surface" },
        data: {
          variant: "floating-glass",
          eyebrow: "COLLABORATE WITH US",
          heading: "We're ready when you are.",
          text: "Drop us a line and let's discuss how we can accelerate your roadmap.",
          responseTime: "⚡ Reply guaranteed within 24h",
          email: "team@company.example",
          phone: "+1 (555) 777-8899",
          address: "Silicon Valley Tech Campus, San Jose, CA",
          showForm: true,
          submitLabel: "Send Message",
          serviceOptions: [
            "Full-Stack",
            "Mobile App",
            "AI & ML",
            "Design System",
          ],
        },
      }),
  },
  {
    key: "contact-form",
    type: "contact",
    label: "Contact · Simple Form + Info",
    category: "Contact",
    description: "Email, phone and address with an enquiry form.",
    create: () => createSection("contact"),
  },
  {
    key: "contact-details",
    type: "contact",
    label: "Contact · Details only",
    category: "Contact",
    description: "Just your contact details, no form.",
    create: () => createSection("contact", { data: { showForm: false } }),
  },
  {
    key: "text",
    type: "text",
    label: "Text + heading",
    category: "Content",
    description: "A heading and paragraphs, e.g. your story.",
    create: () => createSection("text"),
  },
  {
    key: "gallery-3",
    type: "gallery",
    label: "Gallery · 3 columns",
    category: "Portfolio",
    description: "Grid of photos or work samples.",
    create: () => createSection("gallery"),
  },
  {
    key: "gallery-4",
    type: "gallery",
    label: "Gallery · 4 columns",
    category: "Portfolio",
    description: "Denser photo grid, 2 per row on mobile.",
    create: () =>
      createSection("gallery", { data: { columns: 4, mobileColumns: 2 } }),
  },
  {
    key: "logos",
    type: "logos",
    label: "Logo cloud",
    category: "Social proof",
    description: "Customer logos in a calm grayscale row.",
    create: () => createSection("logos", { settings: { spacing: "compact" } }),
  },
  {
    key: "stats",
    type: "stats",
    label: "Statistics",
    category: "Social proof",
    description: "Three headline numbers.",
    create: () =>
      createSection("stats", { settings: { background: "surface" } }),
  },
  {
    key: "split-right",
    type: "split",
    label: "Split · image right",
    category: "Content",
    description: "Text and bullets, image on the right.",
    create: () => createSection("split"),
  },
  {
    key: "split-left",
    type: "split",
    label: "Split · image left",
    category: "Content",
    description: "Image on the left, text on the right.",
    create: () => createSection("split", { data: { imagePosition: "left" } }),
  },
  {
    key: "pricing-cards",
    type: "pricing",
    label: "Pricing · 3 Executive tiers",
    category: "Pricing",
    description:
      "Executive 3-tier card grid with annual discount pill and featured recommendation.",
    create: () =>
      createSection("pricing", {
        data: {
          variant: "cards-grid",
          eyebrow: "PRICING PLANS",
          heading: "Predictable plans for growing teams",
          intro:
            "Scale with confidence. Change or cancel your plan at any time with no lock-in.",
          billingCycleLabel: "Billed annually",
          discountBadge: "Save 20%",
          footerNote:
            "All plans include 14-day money-back guarantee • No credit card required to start",
          columns: 3,
          plans: [
            {
              name: "Starter",
              price: "$29",
              period: "/ month",
              originalPrice: "$39",
              badge: "Individual",
              description:
                "Essential toolset for solo creators and early prototypes.",
              features: [
                "Up to 3 active projects",
                "Community & email support",
                "Standard analytics dashboard",
                "1 GB cloud storage",
              ],
              excludedFeatures: [
                "Custom domain SSL",
                "Dedicated account manager",
              ],
              cta: { label: "Start Free Trial", href: "/contact" },
              featured: false,
              highlightNote: "Free 14-day trial",
            },
            {
              name: "Professional",
              price: "$79",
              period: "/ month",
              originalPrice: "$99",
              badge: "Most Popular",
              description:
                "Advanced capabilities designed for scaling businesses and agencies.",
              features: [
                "Unlimited active projects",
                "Priority 24/7 Slack support",
                "Advanced real-time analytics",
                "Custom domain & automated SSL",
                "Team collaboration (up to 10 seats)",
                "50 GB high-speed cloud storage",
              ],
              cta: { label: "Get Professional", href: "/contact" },
              featured: true,
              highlightNote: "Most popular choice for teams",
            },
            {
              name: "Enterprise",
              price: "$199",
              period: "/ month",
              badge: "Scale",
              description:
                "Custom security, dedicated infrastructure, and tailored SLAs.",
              features: [
                "Unlimited seats & workspaces",
                "Dedicated technical account manager",
                "Custom SSO / SAML integration",
                "99.99% uptime SLA guarantee",
                "Custom data retention policies",
              ],
              cta: { label: "Contact Sales", href: "/contact" },
              featured: false,
              highlightNote: "Tailored contract & invoice billing",
            },
          ],
        },
      }),
  },
  {
    key: "pricing-minimal",
    type: "pricing",
    label: "Pricing · Swiss architectural",
    category: "Pricing",
    description:
      "Stark, ultra-clean editorial layout with subtle hairline accents and numbered tiers.",
    create: () =>
      createSection("pricing", {
        data: {
          variant: "minimal-monochrome",
          eyebrow: "TRANSPARENT VALUE",
          heading: "Straightforward investment",
          intro:
            "No hidden fees, no opaque addons. Clear deliverables for every stage.",
          footerNote:
            "Custom billing cycles and multi-year discounts available upon request.",
          columns: 3,
          plans: [
            {
              name: "Foundational",
              price: "$1,200",
              period: "one-time",
              description:
                "Core setup and brand alignment for focused product launches.",
              features: [
                "Design system specification",
                "Mobile & desktop responsiveness",
                "Technical SEO audit & setup",
                "Standard CMS integration",
              ],
              cta: { label: "Select Foundation", href: "/contact" },
              featured: false,
            },
            {
              name: "Growth Studio",
              price: "$3,400",
              period: "one-time",
              badge: "Recommended",
              description:
                "Full-scale custom digital experience with bespoke micro-interactions.",
              features: [
                "Custom architectural design",
                "Interactive motion guidelines",
                "Complete headless CMS setup",
                "Performance optimization (95+ score)",
                "30 days dedicated warranty",
              ],
              cta: { label: "Book Growth Studio", href: "/contact" },
              featured: true,
              highlightNote: "Estimated 2-3 weeks delivery",
            },
            {
              name: "Retainer Partnership",
              price: "$2,800",
              period: "/ month",
              description:
                "Ongoing engineering and product design bandwidth on demand.",
              features: [
                "40 hours dedicated bandwidth",
                "Direct Slack & weekly syncs",
                "A/B experimentation & updates",
                "Cancel anytime with 14 days notice",
              ],
              cta: { label: "Begin Retainer", href: "/contact" },
              featured: false,
            },
          ],
        },
      }),
  },
  {
    key: "pricing-spotlight",
    type: "pricing",
    label: "Pricing · Asymmetric spotlight",
    category: "Pricing",
    description:
      "High-contrast layout where the primary tier takes center stage with a subtle ambient focus.",
    create: () =>
      createSection("pricing", {
        data: {
          variant: "spotlight-tier",
          eyebrow: "MEMBERSHIP",
          heading: "Select your tier",
          intro: "Pick the membership level that matches your team velocity.",
          billingCycleLabel: "Annual membership",
          discountBadge: "2 Months Free",
          columns: 3,
          plans: [
            {
              name: "Basic Access",
              price: "$49",
              period: "/ mo",
              description: "Standard access to platform primitives and docs.",
              features: [
                "Single workspace",
                "Export to HTML/React",
                "Community forums",
              ],
              cta: { label: "Get Basic", href: "/contact" },
              featured: false,
            },
            {
              name: "Pro Accelerator",
              price: "$119",
              period: "/ mo",
              badge: "RECOMMENDED",
              description:
                "Complete unconstrained access with prioritized deployment pipelines.",
              features: [
                "Unlimited workspaces",
                "Full component source access",
                "Automated CI/CD hooks",
                "Priority support response (< 2h)",
                "Commercial client licensing",
              ],
              cta: { label: "Join Pro", href: "/contact" },
              featured: true,
              highlightNote: "Best value for production studios",
            },
            {
              name: "Custom Enterprise",
              price: "Custom",
              period: "billed yearly",
              description:
                "Dedicated cluster provisioning with sovereign security controls.",
              features: [
                "Private VPC hosting",
                "Custom integration engineering",
                "Executive technical review",
                "Custom Master Service Agreement",
              ],
              cta: { label: "Inquire Now", href: "/contact" },
              featured: false,
            },
          ],
        },
      }),
  },
  {
    key: "pricing-enterprise",
    type: "pricing",
    label: "Pricing · Detailed enterprise rows",
    category: "Pricing",
    description:
      "Stacked horizontal cards with side-by-side feature columns, ideal for consultative pricing.",
    create: () =>
      createSection("pricing", {
        data: {
          variant: "horizontal-rows",
          eyebrow: "CONSULTING PACKAGES",
          heading: "Engagement models built for clarity",
          intro:
            "Explore our fixed-scope packages and continuous retainer solutions.",
          columns: 1,
          plans: [
            {
              name: "Sprint Advisory",
              price: "$4,500",
              period: "per sprint",
              badge: "2-Week Sprint",
              description:
                "Rapid architectural review, design audit, and performance roadmap.",
              features: [
                "Comprehensive code & system audit",
                "Design system UI kit",
                "Full actionable refactor plan",
                "Executive briefing & workshop",
              ],
              cta: { label: "Book Sprint", href: "/contact" },
              featured: false,
            },
            {
              name: "Full Execution & Build",
              price: "$12,000",
              period: "fixed price",
              badge: "Turnkey",
              description:
                "End-to-end design, custom engineering, CMS configuration, and launch management.",
              features: [
                "Custom bespoke UI & animations",
                "Production headless CMS",
                "Automated CI/CD & preview envs",
                "Full SEO & schema optimization",
                "Comprehensive handover docs",
                "60 days warranty & maintenance",
              ],
              cta: { label: "Schedule Project", href: "/contact" },
              featured: true,
              highlightNote: "Includes 60-day post-launch warranty",
            },
          ],
        },
      }),
  },
  {
    key: "pricing",
    type: "pricing",
    label: "Pricing · 2 plans (Simple)",
    category: "Pricing",
    description: "Two plans with the recommended one highlighted.",
    create: () => createSection("pricing"),
  },
  {
    key: "media-image",
    type: "media",
    label: "Large image",
    category: "Media",
    description: "One wide image with an optional caption.",
    create: () => createSection("media"),
  },
  {
    key: "media-video",
    type: "media",
    label: "Video",
    category: "Media",
    description: "A YouTube or Vimeo video.",
    create: () => createSection("media", { data: { kind: "video" } }),
  },
  {
    key: "team-cards",
    type: "team",
    label: "Team · Executive Cards Grid",
    category: "Team",
    description:
      "Modern cards grid with department badges, credentials tags, location, and social links.",
    create: () =>
      createSection("team", {
        data: {
          variant: "grid-cards",
          eyebrow: "WORLD-CLASS LEADERSHIP",
          heading: "The minds shaping our vision.",
          intro:
            "Meet our multidisciplinary team of engineers, designers, and strategists.",
          badge: "40+ Specialists Worldwide",
          columns: 3,
          mobileColumns: 1,
          members: [
            {
              name: "Elena Rostova",
              role: "Chief Executive Officer",
              department: "Executive",
              location: "San Francisco, CA",
              bio: "Former VP of Product with 15+ years scaling enterprise systems and developer platforms.",
              tags: ["Co-Founder", "Stanford MBA"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
                { platform: "twitter", url: "https://twitter.com/" },
              ],
            },
            {
              name: "Marcus Vance",
              role: "Head of Design & Product",
              department: "Design",
              location: "London, UK",
              bio: "Pioneering design systems and immersive user interfaces for world-leading brands.",
              tags: ["Design Lead", "Ex-Apple"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
                { platform: "github", url: "https://github.com/" },
              ],
            },
            {
              name: "Dr. Aris Thorne",
              role: "Chief Technology Officer",
              department: "Engineering",
              location: "Zurich, CH",
              bio: "Specialist in distributed consensus algorithms, high-throughput cloud architectures, and ML.",
              tags: ["PhD CS ETH", "Open Source"],
              socialLinks: [
                { platform: "github", url: "https://github.com/" },
                { platform: "email", url: "mailto:aris@example.com" },
              ],
            },
          ],
        },
      }),
  },
  {
    key: "team-spotlight",
    type: "team",
    label: "Team · Leader Spotlight + Roster",
    category: "Team",
    description:
      "Prominent executive leader spotlight paired with a secondary leadership roster grid.",
    create: () =>
      createSection("team", {
        data: {
          variant: "spotlight-featured",
          eyebrow: "OUR LEADERSHIP",
          heading: "Driven by principles, guided by experience.",
          intro:
            "Direct stewardship from our founding partners and domain experts.",
          badge: "Founder-Led Organization",
          columns: 3,
          mobileColumns: 1,
          members: [
            {
              name: "Alexandra Sterling",
              role: "Founding Partner & Managing Director",
              department: "Global Leadership",
              location: "New York, NY",
              bio: "Over two decades directing capital allocation, digital transformation, and organizational strategy across Fortune 500 enterprises.",
              tags: ["Founding Partner", "Harvard Law", "Board Advisor"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
                { platform: "email", url: "mailto:alexandra@example.com" },
              ],
            },
            {
              name: "Julian Chen",
              role: "Partner, Infrastructure",
              department: "Engineering",
              location: "Singapore",
              bio: "Directing global cloud scaling and cybersecurity frameworks.",
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
              ],
            },
            {
              name: "Sofia Morales",
              role: "Partner, Creative Direction",
              department: "Design Studio",
              location: "Madrid, ES",
              bio: "Leading award-winning brand transformations and identity systems.",
              socialLinks: [
                { platform: "twitter", url: "https://twitter.com/" },
              ],
            },
            {
              name: "Liam O'Connor",
              role: "Partner, Client Solutions",
              department: "Advisory",
              location: "Dublin, IE",
              bio: "Overseeing enterprise delivery and strategic client roadmaps.",
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
              ],
            },
          ],
        },
      }),
  },
  {
    key: "team-editorial",
    type: "team",
    label: "Team · Minimal Architectural Roster",
    category: "Team",
    description:
      "Swiss architectural minimalist roster with indexed rows and smooth hover animations.",
    create: () =>
      createSection("team", {
        data: {
          variant: "minimal-editorial",
          eyebrow: "STUDIO ROSTER",
          heading: "Architects of the modern web.",
          intro: "An agile collective of specialized craftspeople.",
          badge: "Global Studio",
          columns: 3,
          mobileColumns: 1,
          members: [
            {
              name: "David Kim",
              role: "Principal Systems Architect",
              department: "Core Systems",
              location: "Seoul / Remote",
              bio: "Designing resilient backend engines and ultra-low latency streaming APIs.",
              tags: ["Rust", "Distributed DB"],
              socialLinks: [{ platform: "github", url: "https://github.com/" }],
            },
            {
              name: "Camille Dubois",
              role: "Creative Technologist",
              department: "Interactive",
              location: "Paris, FR",
              bio: "Crafting WebGL shaders, micro-animations, and fluid interactive 3D spaces.",
              tags: ["Three.js", "Creative Dev"],
              socialLinks: [
                { platform: "twitter", url: "https://twitter.com/" },
              ],
            },
            {
              name: "Mateo Rossi",
              role: "Lead Product Designer",
              department: "UI / UX",
              location: "Milan, IT",
              bio: "Shaping intuitive workflows for complex data dashboards and analytical tools.",
              tags: ["Design Systems"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
              ],
            },
          ],
        },
      }),
  },
  {
    key: "team-glass",
    type: "team",
    label: "Team · Cinematic Glass Overlay",
    category: "Team",
    description:
      "Cinematic portrait cards with glowing gradient vignettes and frosted glass slide-up sheets.",
    create: () =>
      createSection("team", {
        settings: { background: "surface" },
        data: {
          variant: "glass-overlay",
          eyebrow: "SPECIALIZED TALENT",
          heading: "Passionate creators and deep domain experts.",
          intro:
            "Hover over any team member to explore their background, focus, and channels.",
          badge: "Full-Stack Excellence",
          columns: 3,
          mobileColumns: 1,
          members: [
            {
              name: "Dr. Maya Patel",
              role: "Head of Artificial Intelligence",
              department: "Research & AI",
              location: "Boston, MA",
              bio: "Leading frontier model fine-tuning, agentic workflows, and semantic search.",
              tags: ["PhD MIT", "NeurIPS Author"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
                { platform: "github", url: "https://github.com/" },
              ],
            },
            {
              name: "Oliver Wright",
              role: "VP of Product Strategy",
              department: "Product",
              location: "Austin, TX",
              bio: "Translating customer pain points into high-velocity product execution roadmaps.",
              tags: ["Ex-Stripe", "Y Combinator Alum"],
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/" },
                { platform: "twitter", url: "https://twitter.com/" },
              ],
            },
            {
              name: "Hana Takahashi",
              role: "Director of Brand Design",
              department: "Brand & Motion",
              location: "Tokyo, JP",
              bio: "Elevating brand experiences through kinetic typography and thoughtful minimalism.",
              tags: ["Tokyo TDC Winner", "Brand Lead"],
              socialLinks: [
                { platform: "twitter", url: "https://twitter.com/" },
                { platform: "linkedin", url: "https://linkedin.com/" },
              ],
            },
          ],
        },
      }),
  },
  {
    key: "team",
    type: "team",
    label: "Team · Simple 3 Columns",
    category: "Team",
    description: "Classic 3 people cards with role and photo.",
    create: () => createSection("team"),
  },
  {
    key: "carousel-cards",
    type: "carousel",
    label: "Carousel · Multi-Cards Slider",
    category: "Carousel",
    description:
      "Interactive slider with card elevation, dot indicators, and chevron navigation.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "cards",
          eyebrow: "OUR CAPABILITIES",
          heading: "Engineered for excellence.",
          intro:
            "Explore what makes our platform and services the industry benchmark.",
          badge: "Interactive Slider",
          autoPlay: false,
          interval: 5,
          showArrows: true,
          showDots: true,
          slides: [
            {
              title: "Autonomous Agentic Pipelines",
              subtitle: "Artificial Intelligence",
              description:
                "Self-healing workflows that execute complex tasks reliably in enterprise environments.",
              badge: "ENTERPRISE",
              button: { label: "Explore Platform", href: "/services" },
            },
            {
              title: "Microsecond Edge Computing",
              subtitle: "Infrastructure",
              description:
                "Deploy globally distributed logic within 50ms of your end users with zero cold starts.",
              badge: "INFRASTRUCTURE",
              button: { label: "View Architecture", href: "/services" },
            },
            {
              title: "Fluid Design Systems",
              subtitle: "User Interface",
              description:
                "Harmonious token architecture supporting dynamic dark modes and micro-interactions.",
              badge: "DESIGN",
              button: { label: "Design Guide", href: "/portfolio" },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-hero",
    type: "carousel",
    label: "Carousel · Cinematic Hero Slider",
    category: "Carousel",
    description:
      "Full-width hero banner slider with rich dark overlays and call-to-actions.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "hero-slider",
          autoPlay: true,
          interval: 6,
          showArrows: true,
          showDots: true,
          pauseOnHover: true,
          slides: [
            {
              title: "Crafting digital experiences that transform industries.",
              subtitle: "Global Product Studio",
              description:
                "We partner with visionary founders and global enterprises to design, build, and scale world-class software.",
              badge: "2026 BENCHMARK",
              image: {
                url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1800&auto=format&fit=crop&q=80",
                alt: "Global digital technology studio and innovation lab",
              },
              button: { label: "Start a Project", href: "/contact" },
              secondaryButton: { label: "Our Portfolio", href: "/portfolio" },
            },
            {
              title: "High-throughput cloud systems built for resilience.",
              subtitle: "Infrastructure Excellence",
              description:
                "Architecting cloud foundations that withstand mission-critical scale with zero downtime.",
              badge: "CLOUD PLATFORMS",
              image: {
                url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1800&auto=format&fit=crop&q=80",
                alt: "Cloud infrastructure and data network",
              },
              button: { label: "Explore Solutions", href: "/services" },
              secondaryButton: {
                label: "Read Case Studies",
                href: "/portfolio",
              },
            },
            {
              title: "Autonomous AI agents architected for enterprise scale.",
              subtitle: "Next-Gen Intelligence",
              description:
                "Harness modern foundation models to automate intricate enterprise workflows with continuous evaluation.",
              badge: "AI PLATFORM",
              image: {
                url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1800&auto=format&fit=crop&q=80",
                alt: "Futuristic digital intelligence architecture",
              },
              button: { label: "Discover AI Stack", href: "/services" },
              secondaryButton: { label: "Documentation", href: "/portfolio" },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-showcase",
    type: "carousel",
    label: "Carousel · 3D Showcase Focus",
    category: "Carousel",
    description:
      "Perspective 3D active focus card showcase with counter and navigation.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "showcase",
          eyebrow: "FEATURED WORK",
          heading: "Spotlight on Innovation",
          intro:
            "Click or swipe through our marquee case studies and products.",
          slides: [
            {
              title: "Aether AI Analytics",
              badge: "FINTECH",
              description:
                "Real-time semantic risk analysis for institutional portfolio managers.",
              button: { label: "Case Study", href: "/portfolio" },
            },
            {
              title: "Vanguard Design System",
              badge: "DESIGN SYSTEM",
              description:
                "140+ accessible UI components powering 8 product verticals.",
              button: { label: "View System", href: "/portfolio" },
            },
            {
              title: "Krypton Cloud Engine",
              badge: "INFRASTRUCTURE",
              description:
                "Distributed message broker handling 40M requests/sec.",
              button: { label: "Deep Dive", href: "/portfolio" },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-editorial",
    type: "carousel",
    label: "Carousel · Minimal Editorial Slide Deck",
    category: "Carousel",
    description:
      "Swiss split editorial slide deck with active slide lines and prominent typography.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "minimal-editorial",
          eyebrow: "STRATEGIC PILLARS",
          slides: [
            {
              title: "Precision in every interaction and pixel.",
              subtitle: "Pillar 01 — Quality",
              badge: "CRAFT",
              description:
                "We don't settle for minimum viable. We build software that feels intuitive, robust, and delightful.",
              button: { label: "Our Philosophy", href: "/about" },
            },
            {
              title: "Speed without sacrificing architectural integrity.",
              subtitle: "Pillar 02 — Velocity",
              badge: "EXECUTION",
              description:
                "Continuous deployment and automated testing pipelines to ship value rapidly and safely.",
              button: { label: "Our Process", href: "/about" },
            },
            {
              title: "Long-term partnership and dedicated ownership.",
              subtitle: "Pillar 03 — Stewardship",
              badge: "PARTNERSHIP",
              description:
                "We work alongside your leadership team as embedded architects, not disconnected vendors.",
              button: { label: "Contact Partners", href: "/contact" },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-image-gallery",
    type: "carousel",
    label: "Images Carousel · Full Visual Gallery",
    category: "Carousel",
    description:
      "Cinematic full-frame photo showcase with thumbnail navigation bar and overlay captions.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "image-gallery",
          eyebrow: "VISUAL PORTFOLIO",
          heading: "Captured in Precision",
          intro:
            "Explore our latest flagship spatial architecture and product releases.",
          imageAspect: "16:9",
          showThumbnails: true,
          showArrows: true,
          showDots: false,
          autoPlay: true,
          interval: 6,
          slides: [
            {
              title: "Nordic Minimalist Headquarters",
              caption:
                "Architectural design with floor-to-ceiling glass and sustainably harvested Scandinavian timber.",
              badge: "ARCHITECTURE",
              image: {
                url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80",
                alt: "Modern minimalist workspace",
              },
              button: { label: "View Case Study", href: "/work" },
            },
            {
              title: "Next-Gen Quantum Hardware Lab",
              caption:
                "Sub-Kelvin cryogenic compute testing facilities operating at high coherence thresholds.",
              badge: "DEEP TECH",
              image: {
                url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&auto=format&fit=crop&q=80",
                alt: "Quantum hardware laboratory",
              },
              button: { label: "Lab Overview", href: "/work" },
            },
            {
              title: "Spatial Interactive Experiences",
              caption:
                "Zero-latency multi-user interactive canvas designed for precision engineering teams.",
              badge: "INTERFACE",
              image: {
                url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=80",
                alt: "Cybernetic high-tech display",
              },
              button: { label: "Explore Interface", href: "/work" },
            },
            {
              title: "Sustainable Urban Ecosystems",
              caption:
                "Carbon-negative commercial campus powered by geothermal and photovoltaic arrays.",
              badge: "ENERGY",
              image: {
                url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&auto=format&fit=crop&q=80",
                alt: "Green modern architecture",
              },
              button: { label: "Sustainability Report", href: "/work" },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-image-strip",
    type: "carousel",
    label: "Images Carousel · Multi-Image Filmstrip",
    category: "Carousel",
    description:
      "Continuous multi-column photography filmstrip reel for project works and showcases.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "image-strip",
          eyebrow: "FEATURED WORK",
          heading: "Crafted for global visionaries",
          columns: 3,
          imageAspect: "4:3",
          showArrows: true,
          showDots: true,
          slides: [
            {
              title: "Autonomous Fleet OS",
              subtitle: "01 / Mobility",
              caption: "Real-time edge compute telemetry and mission control.",
              badge: "AUTONOMOUS",
              image: {
                url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1000&auto=format&fit=crop&q=80",
                alt: "Autonomous tech system",
              },
            },
            {
              title: "Fintech Core Engine",
              subtitle: "02 / Platform",
              caption:
                "High-frequency global settlement ledger processing 100k TPS.",
              badge: "FINANCE",
              image: {
                url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&auto=format&fit=crop&q=80",
                alt: "Fintech analytics",
              },
            },
            {
              title: "Biotech Genomics Suite",
              subtitle: "03 / Research",
              caption: "AI-accelerated protein folding simulations.",
              badge: "GENOMICS",
              image: {
                url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80",
                alt: "Biotech research suite",
              },
            },
            {
              title: "Satellite Orbit Mesh",
              subtitle: "04 / Aerospace",
              caption: "Laser inter-satellite communication constellations.",
              badge: "AEROSPACE",
              image: {
                url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
                alt: "Satellite orbit network",
              },
            },
          ],
        },
      }),
  },
  {
    key: "carousel-image-coverflow",
    type: "carousel",
    label: "Images Carousel · 3D Coverflow Reel",
    category: "Carousel",
    description:
      "3D perspective coverflow deck focusing on high-impact visual artwork and photography.",
    create: () =>
      createSection("carousel", {
        data: {
          variant: "image-coverflow",
          eyebrow: "GALLERY PERSPECTIVE",
          heading: "Spatial 3D Gallery",
          imageAspect: "16:9",
          slides: [
            {
              title: "Spatial Compute Studio",
              subtitle: "Tokyo, Japan",
              badge: "STUDIO",
              image: {
                url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
                alt: "Atmospheric landscape and studio",
              },
            },
            {
              title: "Modernist Monolith",
              subtitle: "Reykjavik, Iceland",
              badge: "ARCHITECTURE",
              image: {
                url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
                alt: "Modernist architecture",
              },
            },
            {
              title: "Design Laboratory",
              subtitle: "Zurich, Switzerland",
              badge: "RESEARCH",
              image: {
                url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
                alt: "Design laboratory",
              },
            },
          ],
        },
      }),
  },
  {
    key: "marquee-ticker",
    type: "marquee",
    label: "Marquee · Bold Infinite Ticker",
    category: "Marquee",
    description:
      "Continuous typographic scroll with star separators and speed controls.",
    create: () =>
      createSection("marquee", {
        data: {
          variant: "ticker-text",
          speed: "normal",
          direction: "left",
          pauseOnHover: true,
          gradientFades: true,
          fontSize: "large",
          items: [
            { text: "GLOBAL RESILIENCE", badge: "99.999%" },
            { text: "ENTERPRISE SECURITY", badge: "SOC2" },
            { text: "AI & ML PLATFORMS" },
            { text: "ZERO COLD STARTS", badge: "EDGE" },
            { text: "24/7 DEDICATED SUPPORT" },
          ],
        },
      }),
  },
  {
    key: "marquee-cards",
    type: "marquee",
    label: "Marquee · Streaming Feature Cards",
    category: "Marquee",
    description:
      "Streaming continuous stream of feature cards and capability pills.",
    create: () =>
      createSection("marquee", {
        data: {
          variant: "cards-stream",
          eyebrow: "LIVE CAPABILITIES",
          heading: "Continuously streaming infrastructure",
          speed: "normal",
          direction: "left",
          pauseOnHover: true,
          gradientFades: true,
          items: [
            {
              text: "Cloud Automation",
              subtext: "Self-healing Kubernetes clusters",
              badge: "INFRA",
              icon: "cloud",
            },
            {
              text: "Frontier AI Models",
              subtext: "Low-latency streaming inferences",
              badge: "INTELLIGENCE",
              icon: "sparkles",
            },
            {
              text: "Design Token System",
              subtext: "Unified multi-platform consistency",
              badge: "UX",
              icon: "tools",
            },
            {
              text: "High-Throughput APIs",
              subtext: "< 5ms response time globally",
              badge: "SCALE",
              icon: "bolt",
            },
          ],
        },
      }),
  },
  {
    key: "marquee-pills",
    type: "marquee",
    label: "Marquee · Glowing Capability Badges",
    category: "Marquee",
    description:
      "Streaming badge pills for tech stack, certifications, and capabilities.",
    create: () =>
      createSection("marquee", {
        data: {
          variant: "pill-badges",
          speed: "slow",
          direction: "left",
          pauseOnHover: true,
          gradientFades: true,
          items: [
            { text: "TypeScript / Node.js", icon: "code" },
            { text: "React & Next.js", icon: "layers" },
            { text: "Kubernetes & Docker", icon: "cloud" },
            { text: "PostgreSQL & Redis", icon: "box" },
            { text: "GraphQL & REST", icon: "cloud" },
            { text: "Tailwind & Design Tokens", icon: "tools" },
            {
              text: "SOC2 & GDPR Compliant",
              badge: "CERTIFIED",
              icon: "shield",
            },
          ],
        },
      }),
  },
  {
    key: "marquee-dual",
    type: "marquee",
    label: "Marquee · Dual Opposite Streams",
    category: "Marquee",
    description:
      "Two stacked opposite-direction streaming tracks for dynamic layered movement.",
    create: () =>
      createSection("marquee", {
        data: {
          variant: "dual-directional",
          speed: "normal",
          direction: "left",
          pauseOnHover: true,
          gradientFades: true,
          fontSize: "medium",
          items: [
            { text: "PRECISION CRAFT", badge: "DESIGN" },
            { text: "ZERO DOWNTIME", badge: "RELIABILITY" },
            { text: "INSTANT SCALING", badge: "CLOUD" },
            { text: "WORLD-CLASS TALENT", badge: "TEAM" },
          ],
          secondaryItems: [
            { text: "AI & ML WORKFLOWS", badge: "AUTOMATION" },
            { text: "GLOBAL NETWORK", badge: "EDGE" },
            { text: "CLIENT-FIRST PHILOSOPHY", badge: "TRUST" },
            { text: "CONTINUOUS INNOVATION", badge: "FUTURE" },
          ],
        },
      }),
  },
  ...AUTH_PRESETS.map((preset): SectionPreset => ({
    key: preset.key,
    type: "auth",
    label: preset.label,
    category: "Auth",
    description: preset.description,
    create: () =>
      createSection("auth", {
        data: preset.data(),
        settings: { spacing: "none", ...preset.settings },
      }),
  })),
  {
    key: "blog-cards-grid",
    type: "blog",
    label: "Blog Cards Grid",
    category: "Blog",
    description:
      "Responsive 3-column blog card grid with category pills, cover media, and read time.",
    create: () => createSection("blog"),
  },
  {
    key: "blog-detail-minimalist-editorial",
    type: "blog_detail",
    label: "Blog Detail · Minimalist Editorial",
    category: "Blog",
    description:
      "Centered modern header, large rounded hero image, sticky social share, clean typography.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "minimalist-editorial",
          title: "The influence of modern architecture",
          subtitle:
            "An exploration into how minimalist silhouettes and brutalist honesty redefine contemporary spaces.",
          category: "Design",
          date: "July 21, 2024",
          authorName: "Jakob Gronberg",
          authorRole: "Lead Architectural Designer",
          readTime: "12 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
            alt: "Modern architecture skyscrapers",
          },
        },
      }),
  },
  {
    key: "blog-detail-split-hero",
    type: "blog_detail",
    label: "Blog Detail · Split Hero Banner",
    category: "Blog",
    description:
      "Dual-column hero header with title and author on left and featured image frame on right.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "split-hero",
          title: "Crafting scalable design systems for modern teams",
          subtitle:
            "How consistent tokens, modular architecture, and documentation transform product velocity.",
          category: "Systems",
          date: "August 10, 2024",
          authorName: "Maya Lin",
          authorRole: "Head of Design",
          readTime: "9 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
            alt: "Design work",
          },
        },
      }),
  },
  {
    key: "blog-detail-immersive-dark",
    type: "blog_detail",
    label: "Blog Detail · Immersive Dark Mode",
    category: "Blog",
    description:
      "Dramatic full-width dark hero with atmospheric ambient glow, contrast typography, and reading column.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "immersive-dark",
          title: "Building next-generation distributed systems",
          subtitle:
            "A deep dive into latency mitigation, consensus algorithms, and zero-downtime deployments.",
          category: "Engineering",
          date: "September 04, 2024",
          authorName: "Marcus Vance",
          authorRole: "Principal Systems Architect",
          readTime: "14 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
            alt: "Hardware circuit tech",
          },
        },
      }),
  },
  {
    key: "blog-detail-magazine-classic",
    type: "blog_detail",
    label: "Blog Detail · Magazine Classic Gazette",
    category: "Blog",
    description:
      "Refined serif print editorial aesthetic with author sidebar and structured two-column layout.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "magazine-classic",
          title: "The vanishing art of contemplative long-form journalism",
          subtitle:
            "Why depth, pacing, and editorial integrity matter more than ever in an era of micro-attention.",
          category: "Journalism",
          date: "October 02, 2024",
          authorName: "Clara Kensington",
          authorRole: "Senior Editor",
          readTime: "16 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
            alt: "Vintage printing and reading",
          },
        },
      }),
  },
  {
    key: "blog-detail-newsletter-tech",
    type: "blog_detail",
    label: "Blog Detail · Substack / Newsletter Style",
    category: "Blog",
    description:
      "Creator profile header, read time, callout boxes, and bottom newsletter subscribe box.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "newsletter-tech",
          title: "The founder's playbook for zero-to-one product growth",
          subtitle:
            "The metrics that actually matter before product-market fit, and the vanity metrics to ignore.",
          category: "Startups",
          date: "September 18, 2024",
          authorName: "Alex Rivera",
          authorRole: "Product Strategist",
          readTime: "7 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            alt: "Analytics and strategy",
          },
        },
      }),
  },
  {
    key: "blog-detail-floating-card",
    type: "blog_detail",
    label: "Blog Detail · Modernist Floating Card",
    category: "Blog",
    description:
      "Wide cover image hero with the article header card floating and overlapping upward.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "floating-card",
          title: "Urban sanctuaries: Reclaiming quiet in dense metropolises",
          subtitle:
            "How biophilic architecture and sound dampening materials create mental breathing room.",
          category: "Urbanism",
          date: "August 28, 2024",
          authorName: "Elena Rostova",
          authorRole: "Urban Researcher",
          readTime: "11 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
            alt: "Urban landscape",
          },
        },
      }),
  },
  {
    key: "blog-detail-sticky-sidebar",
    type: "blog_detail",
    label: "Blog Detail · Sticky Table of Contents",
    category: "Blog",
    description:
      "Modern publication layout with sticky outline TOC, author bio widget, and share widget.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "sticky-sidebar",
          title: "Comprehensive guide to sustainable web performance",
          subtitle:
            "Optimizing bundle budgets, server response latency, and carbon footprint for modern web apps.",
          category: "Engineering",
          date: "July 30, 2024",
          authorName: "David Zhao",
          authorRole: "Frontend Architect",
          readTime: "13 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
            alt: "Code and performance",
          },
        },
      }),
  },
  {
    key: "blog-detail-swiss-brutalist",
    type: "blog_detail",
    label: "Blog Detail · Swiss Brutalist Grid",
    category: "Blog",
    description:
      "High-contrast 1px border grid, tabular metadata, clean typography, and numbered blocks.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "swiss-brutalist",
          title: "OBJECTIVE FORM: THE SWISS TYPOGRAPHIC LEGACY",
          subtitle:
            "ANALYZING MAX BILL, JOSEF MÜLLER-BROCKMANN, AND THE MATHEMATICAL FOUNDATIONS OF GRID SYSTEMS.",
          category: "TYPOGRAPHY",
          date: "JUNE 22, 2024",
          authorName: "HANS WEBER",
          authorRole: "GRAPHIC THEORIST",
          readTime: "10 MIN",
          coverImage: {
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
            alt: "Geometric graphic art",
          },
        },
      }),
  },
  {
    key: "blog-detail-visual-story",
    type: "blog_detail",
    label: "Blog Detail · Cinematic Photo Essay",
    category: "Blog",
    description:
      "Panoramic media hero with overlay, oversized statement quotes, and storytelling rhythm.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "visual-story",
          title: "Chasing the midnight sun across the Arctic archipelago",
          subtitle:
            "When the horizon never sleeps, time bends into an endless golden hour of light, ice, and silence.",
          category: "Expeditions",
          date: "August 14, 2024",
          authorName: "Soren Lindqvist",
          authorRole: "Documentary Photographer",
          readTime: "8 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
            alt: "Nordic coast landscape",
          },
        },
      }),
  },
  {
    key: "blog-detail-glassmorphism-deck",
    type: "blog_detail",
    label: "Blog Detail · Glassmorphism Card Deck",
    category: "Blog",
    description:
      "Translucent frosted glass card container with subtle ambient glow and sleek floating elements.",
    create: () =>
      createSection("blog_detail", {
        data: {
          design: "glassmorphism-deck",
          title: "Spatial interfaces and the future of human computing",
          subtitle:
            "How depth, physics, and ambient illumination are replacing traditional flat UI paradigms.",
          category: "Future Tech",
          date: "September 29, 2024",
          authorName: "Aria Thorne",
          authorRole: "Spatial Designer",
          readTime: "9 Min",
          coverImage: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
            alt: "Abstract glass and light",
          },
        },
      }),
  },
];
