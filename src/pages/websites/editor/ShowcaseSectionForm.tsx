import type {
  GridColumns,
  ShowcaseCategory,
  ShowcaseCategoryDesign,
  ShowcaseData,
  ShowcaseImageAspect,
  ShowcaseMode,
  ShowcaseProduct,
  ShowcaseProductDesign,
} from "../../../site-kit/index.ts";
import { SHOWCASE_MAX_CATEGORIES, SHOWCASE_MAX_PRODUCTS, SHOWCASE_SUMMARY_LINES_MAX } from "../../../site-kit/index.ts";
import {
  clampSummaryLines,
  productsIn,
  resolveShowcaseDisplay,
  showcaseCategoryDesign,
  showcaseDesign,
  showcaseImageAspect,
  showcaseMode,
} from "../../../site-kit/showcase-layout.ts";
import {
  CheckboxField,
  FormGroup,
  ImageField,
  ItemList,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";
import { cardImageSize } from "./media-dimensions.ts";
import { RichTextField } from "./RichTextField.tsx";

type Props = { data: ShowcaseData; onChange: (data: ShowcaseData) => void };

const MODE_OPTIONS: { value: ShowcaseMode; label: string }[] = [
  { value: "products", label: "Products · One grid" },
  { value: "tabs", label: "Products · Category tabs" },
  { value: "grouped", label: "Products · Grouped under category headings" },
  { value: "categories", label: "Categories only" },
];

const DESIGN_OPTIONS: { value: ShowcaseProductDesign; label: string }[] = [
  { value: "classic", label: "Classic · Bordered card, price and button in footer" },
  { value: "minimal", label: "Minimal · Photo and text, no card" },
  { value: "overlay", label: "Overlay · Text over the photo" },
  { value: "horizontal", label: "Horizontal · Photo beside the text" },
  { value: "spotlight", label: "Spotlight · Centred, tinted stage, price pill" },
  { value: "catalogue", label: "Price list · Rows with dotted leader to price" },
];

const CATEGORY_DESIGN_OPTIONS: { value: ShowcaseCategoryDesign; label: string }[] = [
  { value: "tiles", label: "Photo tiles · Name over the photo" },
  { value: "cards", label: "Cards · Photo, name, description" },
  { value: "circles", label: "Circles · Round photo, name below" },
  { value: "pills", label: "Chips · Compact row of small chips" },
];

const ASPECT_OPTIONS: { value: ShowcaseImageAspect; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "16:9", label: "Wide (16:9)" },
];

const COLUMN_OPTIONS: { value: GridColumns; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

const SUMMARY_LINE_OPTIONS = Array.from({ length: SHOWCASE_SUMMARY_LINES_MAX + 1 }, (_, lines) => ({
  value: lines,
  label: lines === 0 ? "Show full text" : `${lines} ${lines === 1 ? "line" : "lines"}`,
}));

const ALL = "__all__";
const NONE = "__none__";

const newId = () => crypto.randomUUID();

export default function ShowcaseSectionForm({ data, onChange }: Props) {
  const set = (patch: Partial<ShowcaseData>) => onChange({ ...data, ...patch });
  const mode = showcaseMode(data);
  const display = resolveShowcaseDisplay(data);
  const listsCategories = mode === "categories";
  const aspect = showcaseImageAspect(data);
  const categoryOptions = data.categories.map((category) => ({ value: category.id, label: category.name || "Untitled" }));

  return (
    <>
      <FormGroup title="Layout" description="Choose what this section lists and how it looks.">
        <SelectField label="Show" value={mode} options={MODE_OPTIONS} onChange={(next) => set({ mode: next })} />
        {listsCategories ? (
          <SelectField
            label="Category design"
            value={showcaseCategoryDesign(data)}
            options={CATEGORY_DESIGN_OPTIONS}
            onChange={(categoryDesign) => set({ categoryDesign })}
          />
        ) : (
          <SelectField
            label="Product design"
            value={showcaseDesign(data)}
            options={DESIGN_OPTIONS}
            onChange={(design) => set({ design })}
          />
        )}
        {mode === "products" && (
          <SelectField
            label="Products from"
            value={data.categoryId && data.categories.some((c) => c.id === data.categoryId) ? data.categoryId : ALL}
            options={[{ value: ALL, label: "All categories" }, ...categoryOptions]}
            onChange={(id) => set({ categoryId: id === ALL ? undefined : id })}
            hint="Pick one category to make a page for just that category."
          />
        )}
        {!(listsCategories && showcaseCategoryDesign(data) === "pills") && (
          <div className="grid grid-cols-3 gap-2">
            <SelectField label="Desktop" value={data.columns} options={COLUMN_OPTIONS} onChange={(columns) => set({ columns })} />
            <SelectField
              label="Tablet"
              value={data.tabletColumns ?? (Math.min(2, data.columns) as GridColumns)}
              options={COLUMN_OPTIONS}
              onChange={(tabletColumns) => set({ tabletColumns })}
            />
            <SelectField
              label="Phone"
              value={data.mobileColumns}
              options={COLUMN_OPTIONS.slice(0, 2)}
              onChange={(mobileColumns) => set({ mobileColumns })}
            />
          </div>
        )}
        <SelectField label="Photo shape" value={aspect} options={ASPECT_OPTIONS} onChange={(imageAspect) => set({ imageAspect })} />
        {!listsCategories && (
          <SelectField
            label="Photo fit"
            value={data.imageFit ?? "cover"}
            options={[
              { value: "cover", label: "Fill the frame (crop)" },
              { value: "contain", label: "Show whole photo (for cut-out product shots)" },
            ]}
            onChange={(imageFit) => set({ imageFit })}
          />
        )}
      </FormGroup>

      <FormGroup title="Heading">
        <RichTextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => set({ eyebrow })} maxLength={100} />
        <RichTextField label="Heading" value={data.heading} onChange={(heading) => set({ heading })} maxLength={200} />
        <RichTextField multiline label="Intro" value={data.intro} onChange={(intro) => set({ intro })} maxLength={500} />
        <SelectField
          label="Heading alignment"
          value={data.headerAlign ?? "center"}
          options={[
            { value: "center", label: "Centre" },
            { value: "left", label: "Left" },
          ]}
          onChange={(headerAlign) => set({ headerAlign })}
        />
      </FormGroup>

      <FormGroup title="What to show" description="Turn parts of each card on or off.">
        {listsCategories ? (
          <>
            <CheckboxField label="Photo" checked={display.image} onChange={(showImage) => set({ showImage })} />
            <CheckboxField
              label="Description"
              checked={display.categoryDescription}
              onChange={(showCategoryDescription) => set({ showCategoryDescription })}
            />
            <CheckboxField label="Number of products" checked={display.count} onChange={(showCount) => set({ showCount })} />
          </>
        ) : (
          <>
            <CheckboxField label="Photo" checked={display.image} onChange={(showImage) => set({ showImage })} />
            <CheckboxField label="Product name" checked={display.name} onChange={(showName) => set({ showName })} />
            <CheckboxField label="Summary" checked={display.summary} onChange={(showSummary) => set({ showSummary })} />
            {display.summary && (
              <SelectField
                label="Summary length"
                value={clampSummaryLines(data.summaryLines)}
                options={SUMMARY_LINE_OPTIONS}
                onChange={(summaryLines) => set({ summaryLines })}
              />
            )}
            <CheckboxField label="Price" checked={display.price} onChange={(showPrice) => set({ showPrice })} />
            <CheckboxField label="Category name" checked={display.category} onChange={(showCategory) => set({ showCategory })} />
            <CheckboxField label="Badge" checked={display.badge} onChange={(showBadge) => set({ showBadge })} />
            <CheckboxField
              label="Button"
              checked={display.button}
              onChange={(showButton) => set({ showButton })}
              hint="Off: the product name links instead, when the product has a link."
            />
            {display.button && (
              <OptionalLinkField
                label="Default button"
                value={data.defaultLink}
                onChange={(defaultLink) => set({ defaultLink })}
                fallback={{ label: "Enquire", href: "/contact" }}
              />
            )}
            {mode === "grouped" && (
              <CheckboxField
                label="Category descriptions"
                checked={display.categoryDescription}
                onChange={(showCategoryDescription) => set({ showCategoryDescription })}
              />
            )}
            {mode === "tabs" && (
              <TextField label="First tab label" value={data.allLabel} placeholder="All" onChange={(allLabel) => set({ allLabel })} maxLength={40} />
            )}
            {(mode === "tabs" || mode === "grouped") && (
              <TextField
                label="Label for products without a category"
                value={data.otherLabel}
                placeholder="Other"
                onChange={(otherLabel) => set({ otherLabel })}
                maxLength={60}
              />
            )}
          </>
        )}
        <TextField
          label="Message when empty"
          value={data.emptyMessage}
          placeholder={listsCategories ? "No categories yet." : "No products yet."}
          onChange={(emptyMessage) => set({ emptyMessage })}
          maxLength={200}
        />
      </FormGroup>

      <FormGroup title="Categories" description="Group products by category. Removing one leaves its products without a category.">
        <ItemList<ShowcaseCategory>
          label="Categories"
          items={data.categories}
          onChange={(categories) => set({ categories })}
          create={() => ({ id: newId(), name: "New category" })}
          itemTitle={(category) => `${category.name || "Untitled"} · ${productsIn(data, category.id).length}`}
          max={SHOWCASE_MAX_CATEGORIES}
          addLabel="Add category"
          renderItem={(category, update) => (
            <>
              <TextField label="Name" value={category.name} onChange={(name) => update({ ...category, name })} maxLength={80} required />
              <TextAreaField
                label="Description"
                value={category.description}
                onChange={(description) => update({ ...category, description })}
                maxLength={300}
                rows={2}
              />
              <ImageField
                label="Photo"
                optional
                value={category.image}
                onChange={(image) => update({ ...category, image })}
                dimensionHint={cardImageSize(aspect)}
              />
              <OptionalLinkField
                label="Link"
                value={category.link}
                onChange={(link) => update({ ...category, link })}
                fallback={{ label: category.name || "View", href: "/" }}
              />
            </>
          )}
        />
      </FormGroup>

      <FormGroup title="Products" badge={`${data.products.length} / ${SHOWCASE_MAX_PRODUCTS}`}>
        <ItemList<ShowcaseProduct>
          label="Products"
          items={data.products}
          onChange={(products) => set({ products })}
          create={() => ({
            id: newId(),
            name: "New product",
            categoryId: data.categoryId ?? data.categories[0]?.id,
          })}
          itemTitle={(product) => product.name || "Untitled"}
          max={SHOWCASE_MAX_PRODUCTS}
          addLabel="Add product"
          renderItem={(product, update) => (
            <>
              <TextField label="Name" value={product.name} onChange={(name) => update({ ...product, name })} maxLength={120} required />
              <SelectField
                label="Category"
                value={product.categoryId && data.categories.some((c) => c.id === product.categoryId) ? product.categoryId : NONE}
                options={[{ value: NONE, label: "No category" }, ...categoryOptions]}
                onChange={(id) => update({ ...product, categoryId: id === NONE ? undefined : id })}
              />
              <ImageField
                label="Photo"
                optional
                value={product.image}
                onChange={(image) => update({ ...product, image })}
                dimensionHint={cardImageSize(aspect)}
              />
              <TextAreaField
                label="Summary"
                value={product.summary}
                onChange={(summary) => update({ ...product, summary })}
                maxLength={500}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Price"
                  value={product.price}
                  placeholder="e.g. $49 or On request"
                  onChange={(price) => update({ ...product, price })}
                  maxLength={60}
                />
                <TextField
                  label="Badge"
                  value={product.badge}
                  placeholder="e.g. NEW"
                  onChange={(badge) => update({ ...product, badge })}
                  maxLength={30}
                />
              </div>
              <OptionalLinkField
                label="Own button"
                value={product.link}
                onChange={(link) => update({ ...product, link })}
                fallback={{ label: data.defaultLink?.label || "View details", href: data.defaultLink?.href || "/" }}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}
