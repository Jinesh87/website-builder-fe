import type { CardItem, CardsData } from "./types.ts";

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const PRODUCT_ITEMS: CardItem[] = [
  {
    title: "5-Layer WPC Multiboards",
    description: "Engineered for interiors that demand extra strength, stability and a flawless finish.",
    image: { url: unsplash("photo-1581539250439-c96689b516dd"), alt: "Stacked multiboards" },
    tags: ["Waterproof", "Durable", "Eco-friendly"],
    link: { label: "View details", href: "/products" },
  },
  {
    title: "3-Layer WPC Multiboards",
    description: "Wood plastic composite boards built for furniture, cabinets and wall panelling.",
    image: { url: unsplash("photo-1600585154340-be6161a56a0c"), alt: "Composite board interior" },
    tags: ["Waterproof", "Durable", "Eco-friendly"],
    link: { label: "View details", href: "/products" },
  },
  {
    title: "PVC Foam Boards",
    description: "Lightweight, moisture-resistant and fire-retardant boards for signage and interiors.",
    image: { url: unsplash("photo-1618221195710-dd6b41faaea6"), alt: "Foam board panels" },
    tags: ["Waterproof", "Lightweight", "Fire-retardant"],
    link: { label: "View details", href: "/products" },
  },
  {
    title: "WPC Multiboards",
    description: "Manufactured with advanced extrusion and quality-controlled processes for consistency.",
    image: { url: unsplash("photo-1600566753190-17f0baa2a6c3"), alt: "Finished interior panels" },
    tags: ["Waterproof", "Durable", "Eco-friendly"],
    link: { label: "View details", href: "/products" },
  },
];

export function createCardsData(): CardsData {
  return {
    variant: "product-classic",
    heading: "Featured Products",
    headerLayout: "split",
    headerLink: { label: "View all products", href: "/products" },
    columns: 4,
    mobileColumns: 1,
    cardStyle: "bordered",
    imageAspect: "4:3",
    items: PRODUCT_ITEMS,
  };
}

export type CardsPreset = {
  key: string;
  label: string;
  description: string;
  data: () => Partial<CardsData>;
};

export const CARDS_PRESETS: CardsPreset[] = [
  {
    key: "cards-product-classic",
    label: "Cards · Product Classic",
    description: "Image on top, tag chips and a full-width button in a divided footer. Ideal for product catalogues.",
    data: createCardsData,
  },
  {
    key: "cards-image-overlay",
    label: "Cards · Image Overlay",
    description: "Full-bleed photos with text on a gradient, image zoom on hover and pill buttons.",
    data: () => ({
      variant: "image-overlay",
      eyebrow: "COLLECTIONS",
      heading: "Explore by space",
      intro: "Curated materials for every room, from kitchens to commercial lobbies.",
      headerLayout: "center",
      headerLink: undefined,
      columns: 3,
      mobileColumns: 1,
      mobileLayout: "scroll",
      imageAspect: "3:4",
      cardCorners: "large",
      button: { variant: "filled", shape: "pill", showArrow: true },
      items: [
        {
          title: "Modular kitchens",
          description: "Moisture-proof carcasses that never swell or warp.",
          image: { url: unsplash("photo-1556911220-bff31c812dba"), alt: "Modern kitchen" },
          badge: "Bestseller",
          link: { label: "Explore", href: "/products" },
        },
        {
          title: "Bathrooms & vanities",
          description: "100% waterproof boards built for wet areas.",
          image: { url: unsplash("photo-1552321554-5fefe8c9ef14"), alt: "Bathroom vanity" },
          link: { label: "Explore", href: "/products" },
        },
        {
          title: "Commercial interiors",
          description: "Fire-retardant panels for offices, retail and hospitality.",
          image: { url: unsplash("photo-1497366216548-37526070297c"), alt: "Office interior" },
          link: { label: "Explore", href: "/products" },
        },
      ],
    }),
  },
  {
    key: "cards-horizontal-split",
    label: "Cards · Horizontal Split",
    description: "Image beside content with subtitle, price and two buttons. Stacks automatically on narrow screens.",
    data: () => ({
      variant: "horizontal-split",
      eyebrow: "SOLUTIONS",
      heading: "Built for every project",
      headerLayout: "left",
      headerLink: { label: "See all solutions", href: "/products" },
      columns: 2,
      mobileColumns: 1,
      cardStyle: "elevated",
      button: { variant: "filled", shape: "rounded", size: "sm" },
      items: [
        {
          title: "Residential",
          subtitle: "Homes & apartments",
          description: "Termite-proof, maintenance-free boards for wardrobes, kitchens and wall cladding.",
          image: { url: unsplash("photo-1600210492486-724fe5c67fb0"), alt: "Living room" },
          price: "From ₹85 / sq ft",
          link: { label: "Get a quote", href: "/contact" },
          secondaryLink: { label: "Learn more", href: "/products" },
        },
        {
          title: "Commercial",
          subtitle: "Offices, retail & hotels",
          description: "Certified fire-retardant panels with consistent density for large-scale fit-outs.",
          image: { url: unsplash("photo-1497366811353-6870744d04b2"), alt: "Commercial space" },
          price: "Volume pricing",
          link: { label: "Get a quote", href: "/contact" },
          secondaryLink: { label: "Learn more", href: "/products" },
        },
      ],
    }),
  },
  {
    key: "cards-minimal-accent",
    label: "Cards · Minimal Accent",
    description: "Text-first cards with an accent bar, icons, numbering and arrow links. Great for benefits or steps.",
    data: () => ({
      variant: "minimal-accent",
      eyebrow: "WHY CHOOSE US",
      heading: "Engineered to outlast wood",
      headerLayout: "center",
      headerLink: undefined,
      columns: 3,
      mobileColumns: 1,
      cardStyle: "flat",
      showNumbers: true,
      button: { variant: "link", showArrow: true },
      items: [
        {
          icon: "shield",
          title: "100% waterproof",
          description: "No swelling, rotting or warping, even in kitchens and bathrooms.",
          link: { label: "See test results", href: "/products" },
        },
        {
          icon: "bolt",
          title: "Fire-retardant",
          description: "Self-extinguishing composition that meets commercial safety norms.",
          accentColor: "#EA580C",
          link: { label: "View certificates", href: "/products" },
        },
        {
          icon: "heart",
          title: "Eco-friendly",
          description: "Made from recycled polymers and wood fibre, fully recyclable at end of life.",
          accentColor: "#16A34A",
          link: { label: "Our process", href: "/about" },
        },
      ],
    }),
  },
  {
    key: "cards-floating-panel",
    label: "Cards · Floating Panel",
    description: "Raised content panels overlapping the image, with a wide featured card spanning two columns.",
    data: () => ({
      variant: "floating-panel",
      eyebrow: "PROJECTS",
      heading: "Recent installations",
      headerLayout: "split",
      headerLink: { label: "View portfolio", href: "/products" },
      columns: 3,
      mobileColumns: 1,
      cardStyle: "shadow",
      cardCorners: "rounded",
      button: { variant: "soft", shape: "pill", size: "sm" },
      items: [
        {
          title: "Skyline Residences",
          subtitle: "Mumbai · 240 apartments",
          description: "Complete modular kitchens and wardrobes using 5-layer multiboards.",
          image: { url: unsplash("photo-1600607687939-ce8a6c25118c"), alt: "Apartment interior" },
          badge: "Featured",
          featured: true,
          tags: ["Kitchens", "Wardrobes"],
          link: { label: "Case study", href: "/products" },
        },
        {
          title: "Harbor Hotel",
          subtitle: "Goa · 120 rooms",
          description: "Fire-retardant panelling across rooms and lobby.",
          image: { url: unsplash("photo-1566073771259-6a8506099945"), alt: "Hotel room" },
          tags: ["Hospitality"],
          link: { label: "Case study", href: "/products" },
        },
        {
          title: "Nova Offices",
          subtitle: "Bengaluru · 3 floors",
          description: "Workstations and partitions built with PVC foam boards.",
          image: { url: unsplash("photo-1524758631624-e2822e304c36"), alt: "Office workstations" },
          tags: ["Commercial"],
          link: { label: "Case study", href: "/products" },
        },
        {
          title: "Green Leaf School",
          subtitle: "Pune · Campus",
          description: "Durable, moisture-proof furniture for classrooms and labs.",
          image: { url: unsplash("photo-1580582932707-520aed937b7b"), alt: "Classroom" },
          tags: ["Education"],
          link: { label: "Case study", href: "/products" },
        },
      ],
    }),
  },
];
