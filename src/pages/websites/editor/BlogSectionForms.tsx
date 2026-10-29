import { useContext, useId } from "react";
import { Link } from "lucide-react";
import {
  type BlogContentSection,
  type BlogData,
  type BlogDetailData,
  type BlogDetailDesign,
  type BlogPostItem,
} from "../../../site-kit/index.ts";
import {
  CheckboxField,
  CommaListField,
  FormGroup,
  ImageField,
  ItemList,
  LinkTargetsContext,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";
import { MEDIA_HINT, MEDIA_SIZE } from "./media-dimensions.ts";

function BlogPostLinkField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const targets = useContext(LinkTargetsContext);
  const listId = useId();

  const cleanVal = value?.trim() || "";
  const normalizedVal = cleanVal.startsWith("/") ? cleanVal : `/${cleanVal}`;
  const matchedTarget = targets.find(
    (t) =>
      t.href === cleanVal ||
      t.href === normalizedVal ||
      t.href.replace(/^\//, "") === cleanVal.replace(/^\//, ""),
  );

  const isCustom = !matchedTarget && Boolean(cleanVal);

  const handleSelectPage = (selectedHref: string) => {
    if (selectedHref === "__custom__") return;
    onChange(selectedHref);
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-ed-border bg-ed-subtle/30 p-2.5">
      <div className="flex items-center justify-between">
        <label className="text-ed-2xs font-semibold text-ed-text flex items-center gap-1.5">
          <Link className="size-3 text-ed-accent" />
          Target Page / Redirection URL
        </label>
        {matchedTarget && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Linked to: {matchedTarget.label}
          </span>
        )}
      </div>

      {/* Quick Select from Website Pages */}
      {targets.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-ed-muted">
            Select from existing website pages:
          </span>
          <select
            value={
              matchedTarget ? matchedTarget.href : isCustom ? "__custom__" : ""
            }
            onChange={(e) => handleSelectPage(e.target.value)}
            className="w-full rounded-md border border-ed-border bg-white px-2 py-1.5 text-xs text-ed-text focus:border-ed-accent focus:outline-none dark:bg-zinc-800"
          >
            <option value="">-- Choose a page to open --</option>
            {targets.map((t) => (
              <option key={t.href} value={t.href}>
                📄 {t.label} ({t.href})
              </option>
            ))}
            <option value="__custom__">Custom / External URL…</option>
          </select>
        </div>
      )}

      {/* Editable URL / Slug field with autocomplete datalist */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-ed-muted">
          Or enter URL / slug directly:
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/blog1 or https://…"
          list={listId}
          className="w-full rounded-md border border-ed-border bg-white px-2 py-1.5 text-xs font-mono text-ed-text focus:border-ed-accent focus:outline-none dark:bg-zinc-800"
        />
        <datalist id={listId}>
          {targets.map((t) => (
            <option key={t.href} value={t.href}>
              {t.label}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  );
}

const BLOG_DESIGN_OPTIONS: { value: BlogDetailDesign; label: string }[] = [
  {
    value: "minimalist-editorial",
    label: "Design 1: Minimalist Editorial (Arkitect Style)",
  },
  { value: "split-hero", label: "Design 2: Split Hero Banner" },
  { value: "immersive-dark", label: "Design 3: Immersive Dark Mode Hero" },
  { value: "magazine-classic", label: "Design 4: Magazine Classic Gazette" },
  {
    value: "newsletter-tech",
    label: "Design 5: Newsletter / Substack Tech Style",
  },
  { value: "floating-card", label: "Design 6: Modernist Floating Card" },
  {
    value: "sticky-sidebar",
    label: "Design 7: Sticky Table of Contents Outline",
  },
  {
    value: "swiss-brutalist",
    label: "Design 8: Swiss Brutalist High-Contrast Grid",
  },
  { value: "visual-story", label: "Design 9: Cinematic Photo Essay Narrative" },
  {
    value: "glassmorphism-deck",
    label: "Design 10: Creative Glassmorphic Card Deck",
  },
];

const LAYOUT_OPTIONS = [
  { value: "grid-3", label: "3-Column Responsive Grid" },
  { value: "grid-2", label: "2-Column Wide Grid" },
];

const BLOG_VARIANT_OPTIONS = [
  { value: "default", label: "Standard Modern Grid" },
  { value: "vintage-journal", label: "Vintage Journal (Cutting Room / Editorial)" },
];

export function BlogForm({
  data,
  onChange,
}: {
  data: BlogData;
  onChange: (data: BlogData) => void;
}) {
  const update = <K extends keyof BlogData>(key: K, value: BlogData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <>
      <FormGroup title="Layout Design">
        <SelectField
          label="Style Variant"
          value={data.variant || "default"}
          options={BLOG_VARIANT_OPTIONS}
          onChange={(v) => update("variant", v as BlogData["variant"])}
        />
      </FormGroup>

      <FormGroup title="Header & Description">
        <TextField
          label="Eyebrow text"
          value={data.eyebrow || ""}
          onChange={(v) => update("eyebrow", v)}
          placeholder="e.g. THE VINTAGE REELS BLOG"
        />
        <TextField
          label="Section Title"
          value={data.title}
          onChange={(v) => update("title", v)}
          placeholder="e.g. Notes from the cutting room"
        />
        <TextField
          label="Italic accent word(s)"
          value={data.italicTitle || ""}
          onChange={(v) => update("italicTitle", v)}
          placeholder="e.g. cutting room"
          hint="Word(s) rendered in red italic serif in Vintage Journal"
        />
        <TextAreaField
          label="Subtitle description"
          value={data.subtitle || ""}
          onChange={(v) => update("subtitle", v)}
        />
      </FormGroup>

      <FormGroup title="Filter Categories">
        <CommaListField
          label="Categories (comma separated)"
          value={data.categories}
          onChange={(categories) => update("categories", categories)}
          placeholder="All, Design, Tips, Architecture, Growth"
        />
        <SelectField
          label="Grid Layout"
          value={data.layout || "grid-3"}
          options={LAYOUT_OPTIONS}
          onChange={(v) => update("layout", v as BlogData["layout"])}
        />
      </FormGroup>

      <FormGroup title="Blog Post Cards">
        <ItemList<BlogPostItem>
          label="Posts"
          items={data.posts || []}
          max={30}
          addLabel="Add blog card"
          create={() => ({
            id: crypto.randomUUID(),
            title: "New Blog Post",
            slug: `/blog/new-post-${Date.now().toString().slice(-4)}`,
            excerpt:
              "A brief excerpt summarizing what this article covers for readers.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
              alt: "Post cover",
            },
            category: "Design",
            authorName: "Author Name",
            date: "Today",
            readTime: "5 Min",
            readMoreLabel: "Read More →",
          })}
          itemTitle={(post) => post.title || "Untitled Post"}
          onChange={(posts) => update("posts", posts)}
          renderItem={(post, onPostChange) => (
            <div className="flex flex-col gap-2 p-1">
              <TextField
                label="Post Title"
                value={post.title}
                onChange={(title) => onPostChange({ ...post, title })}
              />
              <BlogPostLinkField
                value={post.slug}
                onChange={(slug) => onPostChange({ ...post, slug })}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Category tag"
                  value={post.category}
                  onChange={(category) => onPostChange({ ...post, category })}
                />
                <TextField
                  label="Read time"
                  value={post.readTime}
                  onChange={(readTime) => onPostChange({ ...post, readTime })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Author Name"
                  value={post.authorName}
                  onChange={(authorName) =>
                    onPostChange({ ...post, authorName })
                  }
                />
                <TextField
                  label="Date"
                  value={post.date}
                  onChange={(date) => onPostChange({ ...post, date })}
                />
              </div>
              <ImageField
                label="Cover Image"
                value={post.coverImage}
                onChange={(coverImage) =>
                  onPostChange({
                    ...post,
                    coverImage: coverImage || { url: "", alt: "" },
                  })
                }
                dimensionHint={MEDIA_SIZE.blogCover}
                hint={MEDIA_HINT.cropped}
              />
              <TextAreaField
                label="Excerpt summary"
                value={post.excerpt}
                onChange={(excerpt) => onPostChange({ ...post, excerpt })}
              />
              <TextField
                label="Button text"
                value={post.readMoreLabel || ""}
                onChange={(readMoreLabel) =>
                  onPostChange({ ...post, readMoreLabel })
                }
                placeholder="Read More →"
              />
              <CheckboxField
                label="Featured Hero Card (Widescreen banner)"
                checked={post.featured ?? false}
                onChange={(featured) => onPostChange({ ...post, featured })}
              />
            </div>
          )}
        />
      </FormGroup>

      <FormGroup title="Newsletter Box">
        <CheckboxField
          label="Show newsletter subscription box"
          checked={data.showNewsletterCard ?? false}
          onChange={(v) => update("showNewsletterCard", v)}
        />
        {data.showNewsletterCard && (
          <>
            <TextField
              label="Newsletter title"
              value={data.newsletterTitle || ""}
              onChange={(v) => update("newsletterTitle", v)}
              placeholder="Get new articles in your inbox"
            />
            <TextField
              label="Input placeholder"
              value={data.newsletterPlaceholder || ""}
              onChange={(v) => update("newsletterPlaceholder", v)}
              placeholder="Your email address"
            />
            <TextField
              label="Button label"
              value={data.newsletterButtonText || ""}
              onChange={(v) => update("newsletterButtonText", v)}
              placeholder="SUBSCRIBE"
            />
          </>
        )}
      </FormGroup>
    </>
  );
}

export function BlogDetailForm({
  data,
  onChange,
}: {
  data: BlogDetailData;
  onChange: (data: BlogDetailData) => void;
}) {
  const update = <K extends keyof BlogDetailData>(
    key: K,
    value: BlogDetailData[K],
  ) => {
    onChange({ ...data, [key]: value });
  };

  const contentSections = data.content || [];

  return (
    <>
      <FormGroup title="Layout Design (10 Modern Layouts)">
        <SelectField
          label="Page Layout Design"
          value={data.design || "minimalist-editorial"}
          options={BLOG_DESIGN_OPTIONS}
          onChange={(v) => update("design", v as BlogDetailDesign)}
        />
      </FormGroup>

      <FormGroup title="Header & Meta">
        <TextField
          label="Category tag"
          value={data.category}
          onChange={(v) => update("category", v)}
          placeholder="e.g. DESIGN"
        />
        <TextField
          label="Article Title"
          value={data.title}
          onChange={(v) => update("title", v)}
          placeholder="e.g. The influence of modern architecture"
        />
        <TextAreaField
          label="Lead Subtitle / Deck"
          value={data.subtitle || ""}
          onChange={(v) => update("subtitle", v)}
        />
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Date"
            value={data.date}
            onChange={(v) => update("date", v)}
            placeholder="e.g. July 21, 2024"
          />
          <TextField
            label="Reading time"
            value={data.readTime}
            onChange={(v) => update("readTime", v)}
            placeholder="e.g. 12 Min"
          />
        </div>
      </FormGroup>

      <FormGroup title="Featured Cover Image">
        <ImageField
          label="Cover Image"
          value={data.coverImage}
          onChange={(v) => update("coverImage", v || { url: "", alt: "" })}
          dimensionHint={MEDIA_SIZE.blogArticleCover}
          hint={MEDIA_HINT.cropped}
        />
        <TextField
          label="Image caption (optional)"
          value={data.coverImageCaption || ""}
          onChange={(v) => update("coverImageCaption", v)}
          placeholder="e.g. Skyscrapers rising against a clear horizon."
        />
      </FormGroup>

      <FormGroup title="Author Profile">
        <TextField
          label="Author Name"
          value={data.authorName}
          onChange={(v) => update("authorName", v)}
          placeholder="e.g. Jakob Gronberg"
        />
        <TextField
          label="Author Role"
          value={data.authorRole || ""}
          onChange={(v) => update("authorRole", v)}
          placeholder="e.g. Lead Architectural Designer"
        />
        <ImageField
          label="Author Avatar"
          value={data.authorAvatar || { url: "", alt: "" }}
          onChange={(v) => update("authorAvatar", v || { url: "", alt: "" })}
          dimensionHint={MEDIA_SIZE.avatar}
          hint={MEDIA_HINT.avatar}
        />
        <TextAreaField
          label="Author Bio"
          value={data.authorBio || ""}
          onChange={(v) => update("authorBio", v)}
        />
      </FormGroup>

      <FormGroup title="Article Body Sections">
        <ItemList<BlogContentSection>
          label="Sections"
          items={contentSections}
          max={20}
          addLabel="Add article section"
          create={() => ({
            heading: "Section Heading",
            paragraphs: ["Write the paragraph content for this section."],
          })}
          itemTitle={(sec) => sec.heading || "Untitled Section"}
          onChange={(content) => update("content", content)}
          renderItem={(sec, onSecChange) => (
            <div className="flex flex-col gap-2 p-1">
              <TextField
                label="Heading"
                value={sec.heading || ""}
                onChange={(heading) => onSecChange({ ...sec, heading })}
              />
              <TextField
                label="Subheading"
                value={sec.subheading || ""}
                onChange={(subheading) => onSecChange({ ...sec, subheading })}
              />
              <TextAreaField
                label="Paragraphs (separate with blank lines)"
                value={(sec.paragraphs || []).join("\n\n")}
                onChange={(text) => {
                  const paragraphs = text
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean);
                  onSecChange({ ...sec, paragraphs });
                }}
              />
              <TextField
                label="Pull Quote (optional)"
                value={sec.quote || ""}
                onChange={(quote) => onSecChange({ ...sec, quote })}
              />
              {sec.quote && (
                <TextField
                  label="Quote Author"
                  value={sec.quoteAuthor || ""}
                  onChange={(quoteAuthor) =>
                    onSecChange({ ...sec, quoteAuthor })
                  }
                />
              )}
              <TextField
                label="Callout Highlight Box"
                value={sec.callout || ""}
                onChange={(callout) => onSecChange({ ...sec, callout })}
              />
            </div>
          )}
        />
      </FormGroup>

      <FormGroup title="Tags & Display Toggles">
        <CommaListField
          label="Tags (comma separated)"
          value={data.tags}
          onChange={(tags) => update("tags", tags)}
          placeholder="Architecture, Design Systems, Modernism"
        />
        <CheckboxField
          label="Show social share buttons"
          checked={data.showShareButtons !== false}
          onChange={(v) => update("showShareButtons", v)}
        />
        <CheckboxField
          label="Show author bio box"
          checked={data.showAuthorBio !== false}
          onChange={(v) => update("showAuthorBio", v)}
        />
      </FormGroup>
    </>
  );
}
