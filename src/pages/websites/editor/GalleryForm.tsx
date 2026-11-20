import { useId } from "react";
import type { GalleryAspect, GalleryCardStyle, GalleryData, SectionAlign } from "../../../site-kit/index.ts";
import { galleryTabs } from "../../../site-kit/gallery-filters.ts";
import { ColumnsFields } from "./ColumnsFields.tsx";
import { CheckboxField, FormGroup, ImageField, ItemList, OptionalLinkField, SelectField, TextAreaField, TextField } from "./fields.tsx";
import { MEDIA_SIZE } from "./media-dimensions.ts";
import { RichTextField } from "./RichTextField.tsx";

/** Editor form for the gallery section: headings, layout, optional category filter and the photos. */
export default function GalleryForm({ data, onChange }: { data: GalleryData; onChange: (data: GalleryData) => void }) {
  const categories = galleryTabs(data).slice(1).map((tab) => tab.label);
  const categoryListId = useId();
  return (
    <>
      <datalist id={categoryListId}>
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <FormGroup title="Content & Headings">
        <TextField
          label="Eyebrow / Badge (optional)"
          value={data.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          placeholder="e.g. PORTFOLIO or HOW WE WORK"
        />
        <RichTextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <TextAreaField
          label="Intro / Description (optional)"
          value={data.intro ?? data.description ?? ""}
          onChange={(intro) => onChange({ ...data, intro, description: intro })}
          rows={3}
          hint="Cards, banners, boards and branding we've printed for businesses."
        />
        <OptionalLinkField
          label="Read more / Bottom CTA button"
          value={data.cta}
          onChange={(cta) => onChange({ ...data, cta })}
          fallback={{ label: "View all our work", href: "/portfolio" }}
        />
      </FormGroup>

      <FormGroup title="Layout & Styling">
        <ColumnsFields data={data} onChange={onChange} />
        <SelectField
          label="Card style"
          value={data.cardStyle ?? "default"}
          options={[
            { value: "default", label: "Clean photo & caption (Default)" },
            { value: "surface", label: "Surface card (Tinted background & soft padding)" },
            { value: "overlay", label: "Overlay (Text overlay over image with gradient)" },
            { value: "reveal", label: "Hover reveal (Photo darkens and shows its title on hover)" },
          ]}
          onChange={(cardStyle) => onChange({ ...data, cardStyle: cardStyle as GalleryCardStyle })}
        />
        <SelectField
          label="Image aspect ratio"
          value={data.imageAspect ?? "4:3"}
          options={[
            { value: "4:3", label: "Classic standard (4:3)" },
            { value: "1:1", label: "Square / Instagram (1:1)" },
            { value: "16:9", label: "Widescreen banner (16:9)" },
            { value: "3:4", label: "Portrait / Poster (3:4)" },
            { value: "auto", label: "Natural height (Auto)" },
          ]}
          onChange={(imageAspect) => onChange({ ...data, imageAspect: imageAspect as GalleryAspect })}
        />
        <SelectField
          label="Image corner radius"
          value={data.imageRadius ?? "default"}
          options={[
            { value: "default", label: "Rounded corners (Default)" },
            { value: "soft", label: "Soft subtle radius" },
            { value: "pill", label: "Extra rounded / Pill (24px)" },
            { value: "sharp", label: "Sharp / Square edges" },
          ]}
          onChange={(imageRadius) => onChange({ ...data, imageRadius: imageRadius as "default" | "soft" | "pill" | "sharp" })}
        />
        <SelectField
          label="Content alignment"
          value={data.align ?? "center"}
          options={[
            { value: "center", label: "Center" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ]}
          onChange={(align) => onChange({ ...data, align: align as SectionAlign })}
        />
      </FormGroup>

      <FormGroup title="Category filter">
        <CheckboxField
          label="Show category filter tabs"
          checked={Boolean(data.filters)}
          onChange={(filters) => onChange({ ...data, filters })}
          hint={
            categories.length >= 2
              ? `Tabs: ${data.allLabel?.trim() || "All"}, ${categories.join(", ")}`
              : "Give your photos a category below (e.g. Kitchen, Bathroom). Tabs appear once there are two or more."
          }
        />
        {data.filters && (
          <TextField
            label="“Show everything” tab label"
            value={data.allLabel ?? ""}
            onChange={(allLabel) => onChange({ ...data, allLabel })}
            placeholder="All"
            maxLength={40}
          />
        )}
      </FormGroup>

      <FormGroup title="Images">
        <ItemList
          label="Images"
          items={data.images}
          max={48}
          onChange={(images) => onChange({ ...data, images })}
          create={() => ({ url: "", alt: "", name: "", badge: "", description: "" })}
          itemTitle={(image, index) => image.name || image.title || image.alt || `Image ${index + 1}`}
          addLabel="Add image"
          renderItem={(image, update) => (
            <div className="flex flex-col gap-3">
              <ImageField
                label="Image"
                value={image}
                onChange={(next) => update({ ...image, ...(next ?? { url: "", alt: "" }) })}
                dimensionHint={MEDIA_SIZE.galleryImage}
              />
              <TextField
                label="Name / Title (optional)"
                value={image.name ?? image.title ?? ""}
                onChange={(name) => update({ ...image, name, title: name })}
                placeholder="e.g. Print Factory brand poster"
              />
              <TextField
                label="Category (optional)"
                value={image.category ?? ""}
                onChange={(category) => update({ ...image, category })}
                placeholder="e.g. Kitchen"
                maxLength={60}
                list={categoryListId}
                hint="Photos with the same category share a filter tab."
              />
              <TextField
                label="Badge / Tag (optional)"
                value={image.badge ?? ""}
                onChange={(badge) => update({ ...image, badge })}
                placeholder="e.g. BRANDING"
              />
              <TextAreaField
                label="Description / Caption (optional)"
                value={image.description ?? ""}
                onChange={(description) => update({ ...image, description })}
                rows={2}
                hint="Brief caption or details about this work sample."
              />
              <TextField
                label="Link URL (optional)"
                value={image.link ?? ""}
                onChange={(link) => update({ ...image, link })}
                placeholder="https://... or /contact"
              />
            </div>
          )}
        />
      </FormGroup>
    </>
  );
}
