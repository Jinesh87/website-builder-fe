import type { ShowcaseCategory, ShowcaseData, ShowcaseProduct } from "./showcase-types.ts";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const CATEGORIES: ShowcaseCategory[] = [
  {
    id: "seating",
    name: "Seating",
    description: "Sofas, lounge chairs and stools built for everyday comfort.",
    image: { url: photo("photo-1555041469-a586c61ea9bc"), alt: "Green velvet sofa" },
  },
  {
    id: "tables",
    name: "Tables",
    description: "Dining, coffee and work tables in solid wood and stone.",
    image: { url: photo("photo-1533090481720-856c6e3c1fdc"), alt: "Wooden dining table with chairs" },
  },
  {
    id: "lighting",
    name: "Lighting",
    description: "Pendants, floor lamps and table lamps with a warm glow.",
    image: { url: photo("photo-1507473885765-e6ed057f782c"), alt: "Pendant lamp" },
  },
  {
    id: "bedroom",
    name: "Bedroom",
    description: "Beds, side tables and storage for calm, restful rooms.",
    image: { url: photo("photo-1519710164239-da123dc03ef4"), alt: "Bright bedroom" },
  },
];

const PRODUCTS: ShowcaseProduct[] = [
  {
    id: "p1",
    name: "Harbour Three-Seater Sofa",
    summary: "Deep seats, feather-blend cushions and a kiln-dried hardwood frame.",
    price: "$1,490",
    badge: "BESTSELLER",
    categoryId: "seating",
    image: { url: photo("photo-1555041469-a586c61ea9bc"), alt: "Green three-seater sofa" },
  },
  {
    id: "p2",
    name: "Nordic Lounge Chair",
    summary: "Curved oak arms and a woven seat that softens with use.",
    price: "$560",
    categoryId: "seating",
    image: { url: photo("photo-1567538096630-e0c55bd6374c"), alt: "Lounge chair" },
  },
  {
    id: "p3",
    name: "Studio Accent Chair",
    summary: "A compact chair for reading corners, in six fabric colours.",
    price: "$390",
    badge: "NEW",
    categoryId: "seating",
    image: { url: photo("photo-1592078615290-033ee584e267"), alt: "Accent chair" },
  },
  {
    id: "p4",
    name: "Solid Oak Dining Table",
    summary: "Seats six, finished with a hard-wearing natural oil.",
    price: "$1,250",
    categoryId: "tables",
    image: { url: photo("photo-1533090481720-856c6e3c1fdc"), alt: "Oak dining table" },
  },
  {
    id: "p5",
    name: "Walnut Work Desk",
    summary: "Cable tray, soft-close drawer and a generous 140 cm top.",
    price: "$840",
    categoryId: "tables",
    image: { url: photo("photo-1524758631624-e2822e304c36"), alt: "Walnut desk" },
  },
  {
    id: "p6",
    name: "Halo Pendant Light",
    summary: "Hand-spun aluminium shade with a warm, glare-free diffuser.",
    price: "$220",
    badge: "NEW",
    categoryId: "lighting",
    image: { url: photo("photo-1507473885765-e6ed057f782c"), alt: "Pendant light" },
  },
  {
    id: "p7",
    name: "Arc Floor Lamp",
    summary: "A sweeping brass arm that lights a sofa from above.",
    price: "$310",
    categoryId: "lighting",
    image: { url: photo("photo-1513694203232-719a280e022f"), alt: "Floor lamp in a living room" },
  },
  {
    id: "p8",
    name: "Linen Platform Bed",
    summary: "Upholstered headboard and slatted base, in queen and king.",
    price: "From $1,100",
    categoryId: "bedroom",
    image: { url: photo("photo-1519710164239-da123dc03ef4"), alt: "Platform bed" },
  },
];

export function createShowcaseData(): ShowcaseData {
  return {
    mode: "products",
    design: "classic",
    eyebrow: "Our collection",
    heading: "Products",
    intro: "Hand-finished furniture and lighting, made to last.",
    headerAlign: "center",
    columns: 4,
    mobileColumns: 1,
    imageAspect: "4:3",
    showImage: true,
    showName: true,
    showSummary: true,
    showPrice: true,
    showCategory: true,
    showBadge: true,
    showButton: true,
    defaultLink: { label: "Enquire", href: "/contact" },
    categories: CATEGORIES.map((category) => ({ ...category })),
    products: PRODUCTS.map((product) => ({ ...product })),
  };
}

export type ShowcasePreset = {
  key: string;
  label: string;
  description: string;
  data: () => Partial<ShowcaseData>;
};

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    key: "showcase-classic",
    label: "Products · Classic cards",
    description: "Photo on top, category, name, summary, then price and an enquiry link.",
    data: createShowcaseData,
  },
  {
    key: "showcase-tabs",
    label: "Products · Category tabs",
    description: "Filter tabs above the grid, one per category, plus an All tab.",
    data: () => ({ ...createShowcaseData(), mode: "tabs", design: "minimal", showCategory: false, imageAspect: "1:1" }),
  },
  {
    key: "showcase-grouped",
    label: "Products · Grouped by category",
    description: "Each category gets its own heading and grid of products.",
    data: () => ({
      ...createShowcaseData(),
      mode: "grouped",
      design: "horizontal",
      columns: 2,
      showCategory: false,
      headerAlign: "left",
    }),
  },
  {
    key: "showcase-overlay",
    label: "Products · Photo overlay",
    description: "Large photos with the name and price set over a soft shade.",
    data: () => ({ ...createShowcaseData(), design: "overlay", columns: 3, imageAspect: "3:4", showSummary: false }),
  },
  {
    key: "showcase-spotlight",
    label: "Products · Spotlight",
    description: "Centred product cards on a tinted stage, with the price in a pill.",
    data: () => ({ ...createShowcaseData(), design: "spotlight", imageAspect: "1:1", imageFit: "cover", showCategory: false }),
  },
  {
    key: "showcase-catalogue",
    label: "Products · Price list",
    description: "Compact rows with a thumbnail and dotted leaders to the price, like a menu.",
    data: () => ({
      ...createShowcaseData(),
      mode: "grouped",
      design: "catalogue",
      columns: 2,
      showButton: false,
      showCategory: false,
      summaryLines: 2,
    }),
  },
  {
    key: "showcase-categories-tiles",
    label: "Categories · Photo tiles",
    description: "One tile per category with the name over the photo.",
    data: () => ({
      ...createShowcaseData(),
      mode: "categories",
      categoryDesign: "tiles",
      heading: "Shop by category",
      eyebrow: "",
      columns: 4,
      imageAspect: "3:4",
      showCount: true,
      showCategoryDescription: false,
    }),
  },
  {
    key: "showcase-categories-cards",
    label: "Categories · Cards",
    description: "Photo, name, a short description and the number of products.",
    data: () => ({
      ...createShowcaseData(),
      mode: "categories",
      categoryDesign: "cards",
      heading: "Browse our range",
      columns: 4,
      showCount: true,
    }),
  },
  {
    key: "showcase-categories-circles",
    label: "Categories · Circles",
    description: "Round photos with the category name underneath.",
    data: () => ({
      ...createShowcaseData(),
      mode: "categories",
      categoryDesign: "circles",
      heading: "Explore categories",
      eyebrow: "",
      intro: "",
      columns: 4,
      mobileColumns: 2,
      showCategoryDescription: false,
    }),
  },
  {
    key: "showcase-categories-pills",
    label: "Categories · Chips",
    description: "A compact row of category chips with small photos.",
    data: () => ({
      ...createShowcaseData(),
      mode: "categories",
      categoryDesign: "pills",
      heading: "Find what you need",
      eyebrow: "",
      intro: "",
      showCount: true,
    }),
  },
];
