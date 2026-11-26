import type { BlogData, BlogPostItem } from "./types.ts";

function photo(id: string, alt: string) {
  return { url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`, alt };
}

const POSTS: Omit<BlogPostItem, "authorName" | "date" | "readTime">[] = [
  {
    id: "inset-post-1",
    category: "Guides",
    title: "What to bring to your first consultation",
    slug: "/blog/first-consultation-checklist",
    excerpt: "A short checklist so your first meeting is quick, clear and gets straight to the point.",
    coverImage: photo("photo-1450101499163-c8848c66ca85", "Signing documents at a desk"),
  },
  {
    id: "inset-post-2",
    category: "Know your rights",
    title: "Five questions to ask before you sign",
    slug: "/blog/questions-before-you-sign",
    excerpt: "Simple checks that help you spot problems in a contract before they cost you.",
    coverImage: photo("photo-1589829545856-d10d557cf95f", "Scales of justice and law books"),
  },
  {
    id: "inset-post-3",
    category: "News",
    title: "Our office hours are changing this season",
    slug: "/blog/new-office-hours",
    excerpt: "Evening appointments are now available two days a week. Here's how to book one.",
    coverImage: photo("photo-1497215728101-856f4ea42174", "Bright modern office"),
  },
  {
    id: "inset-post-4",
    category: "Guides",
    title: "How to prepare for a small claims hearing",
    slug: "/blog/small-claims-hearing",
    excerpt: "What the day looks like, what to bring, and how to present your side calmly.",
    coverImage: photo("photo-1454165804606-c3d57bc86b40", "Reviewing paperwork with a laptop"),
  },
  {
    id: "inset-post-5",
    category: "Know your rights",
    title: "Renting? Your rights in plain language",
    slug: "/blog/tenant-rights-plain-language",
    excerpt: "Deposits, repairs and notice periods explained in a few minutes of reading.",
    coverImage: photo("photo-1521791136064-7986c2920216", "Two people shaking hands"),
  },
  {
    id: "inset-post-6",
    category: "News",
    title: "Meet the newest member of our team",
    slug: "/blog/meet-our-new-team-member",
    excerpt: "A quick hello from the person who'll be answering many of your calls.",
    coverImage: photo("photo-1507679799987-c73779587ccf", "Professional in a suit"),
  },
];

/** Sample content for the Blog "Inset cards" layout. */
export function insetBlogData(): BlogData {
  return {
    variant: "inset-cards",
    eyebrow: "From our blog",
    title: "Helpful articles and updates",
    subtitle: "Plain-language guides, news and answers to the questions we hear most.",
    categories: [],
    layout: "grid-3",
    posts: POSTS.map((post) => ({ ...post, authorName: "", date: "", readTime: "", readMoreLabel: "Read article" })),
  };
}
