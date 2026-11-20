import type { GalleryData, GalleryItem } from "./types.ts";

const photo = (id: string, name: string, category: string): GalleryItem => ({
  url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`,
  alt: name,
  name,
  category,
});

const PROJECT_PHOTOS: GalleryItem[] = [
  photo("1556911220-bff31c812dba", "Kitchen Project 1", "Kitchen"),
  photo("1556909114-f6e7ad7d3136", "Kitchen Project 2", "Kitchen"),
  photo("1565538810643-b5bdb714032a", "Kitchen Project 3", "Kitchen"),
  photo("1586023492125-27b2c045efd7", "Living Room Project 1", "Living Room"),
  photo("1555041469-a586c61ea9bc", "Living Room Project 2", "Living Room"),
  photo("1493809842364-78817add7ffb", "Living Room Project 3", "Living Room"),
  photo("1552321554-5fefe8c9ef14", "Bathroom Project 1", "Bathroom"),
  photo("1584622650111-993a426fbf0a", "Bathroom Project 2", "Bathroom"),
  photo("1620626011761-996317b8d101", "Bathroom Project 3", "Bathroom"),
];

export type GalleryPreset = { key: string; label: string; description: string; data: () => Partial<GalleryData> };

export const GALLERY_PRESETS: GalleryPreset[] = [
  {
    key: "gallery-reveal-filters",
    label: "Gallery · Hover reveal with filters",
    description: "Category tabs above a photo grid; each photo darkens and shows its title on hover.",
    data: () => ({
      eyebrow: "",
      heading: "Project Gallery",
      intro: "See how our clients have transformed their spaces.",
      columns: 3,
      mobileColumns: 1,
      cardStyle: "reveal",
      imageAspect: "4:3",
      filters: true,
      images: PROJECT_PHOTOS.map((item) => ({ ...item })),
    }),
  },
];
