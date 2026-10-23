import { useDeferredValue, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATS, CAT_LABEL, STYLES } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import PlatformTemplateCard from "./PlatformTemplateCard.tsx";
import TemplateCard from "./TemplateCard.tsx";
import { useGalleryTemplates } from "./use-gallery-templates.ts";
import "./templates-gallery.css";

export default function TemplatesPage() {
  const location = useLocation();
  const { shortlist, toggleShortlist } = useMarketing();
  const templates = useGalleryTemplates();

  const [selectedCat, setSelectedCat] = useState<string>(() => {
    const stateCat = (location.state as { cat?: string } | null)?.cat;
    return stateCat && CATS.includes(stateCat as (typeof CATS)[number]) ? stateCat : "All";
  });
  const [styleFilter, setStyleFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"pop" | "az" | "new">("pop");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Known categories first, then any other category a platform template uses
  const categories = useMemo(() => {
    const known = new Set<string>(CATS);
    const extra = [...new Set(templates.map((t) => t.category))].filter((c) => !known.has(c));
    return [...CATS, ...extra];
  }, [templates]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: templates.length };
    for (const t of templates) counts[t.category] = (counts[t.category] ?? 0) + 1;
    return counts;
  }, [templates]);

  // Filtered and sorted templates list
  const filteredTemplates = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    const result = templates.filter((t) => {
      if (selectedCat !== "All" && t.category !== selectedCat) return false;
      if (styleFilter && t.style !== styleFilter) return false;
      if (query && !t.searchText.includes(query)) return false;
      return true;
    });

    if (sortOrder === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "new") {
      result.reverse();
    }
    // "pop" maintains the default curated order where row 1 and row 2 match the reference UI!

    return result;
  }, [templates, selectedCat, styleFilter, sortOrder, deferredSearchTerm]);

  return (
    <div className="gallery-view" data-view="templates">
      <div className="gallery-wrap">
        {/* Title */}
        <div className="gallery-head">
          <h1 className="gallery-title">All templates</h1>

          {/* Category Chips with Counts */}
          <div className="gallery-chips" role="group" aria-label="Filter templates by category">
            {categories.map((c) => {
              const isAll = c === "All";
              const label = isAll ? "All templates" : CAT_LABEL[c] ?? c;
              const count = categoryCounts[c] ?? 0;
              const isSelected = selectedCat === c;

              return (
                <button
                  key={c}
                  className="gallery-chip"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCat(c)}
                >
                  <span>{label}</span>
                  <span className="count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar (.gbar) */}
        <div className="gallery-bar">
          <span className="gallery-count" aria-live="polite">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? "template" : "templates"}
            {selectedCat !== "All" ? ` in ${CAT_LABEL[selectedCat] ?? selectedCat}` : ""}
            {styleFilter ? ` · ${styleFilter} style` : ""}
            {searchTerm.trim() ? ` · matching "${searchTerm.trim()}"` : ""}
          </span>

          <div className="gallery-filters">
            {/* Template Search */}
            <div className="gallery-search" role="search">
              <label htmlFor="templateSearch" className="gallery-filter-label">
                Search
              </label>
              <div className="gallery-search-field">
                <svg
                  className="gallery-search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="templateSearch"
                  className="gallery-search-input"
                  type="search"
                  inputMode="search"
                  placeholder="Search ID, name, type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchTerm("");
                  }}
                  aria-label="Search templates by ID, name or type"
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="gallery-search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Style Filter */}
            <div className="gallery-filter-group">
              <label htmlFor="styleSelect" className="gallery-filter-label">
                Style
              </label>
              <select
                id="styleSelect"
                className="gallery-select"
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
              >
                {STYLES.map((st) => (
                  <option key={st} value={st === "All styles" ? "" : st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="gallery-filter-group">
              <label htmlFor="sortSelect" className="gallery-filter-label">
                Sort
              </label>
              <select
                id="sortSelect"
                className="gallery-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "pop" | "az" | "new")}
              >
                <option value="pop">Most popular</option>
                <option value="az">Name A–Z</option>
                <option value="new">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Template Grid */}
        <div className="gallery-grid">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((t) =>
              t.kind === "curated" ? (
                <TemplateCard
                  key={t.key}
                  index={t.index}
                  isShortlisted={shortlist.includes(t.index)}
                  onToggleShortlist={toggleShortlist}
                />
              ) : (
                <PlatformTemplateCard key={t.key} template={t.template} />
              ),
            )
          ) : (
            <div className="gallery-empty">
              <p>No templates match your selected filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCat("All");
                  setStyleFilter("");
                  setSortOrder("pop");
                  setSearchTerm("");
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* AI Callout Banner below grid */}
        <div className="gallery-ai-cta">
          <div>
            <h3>Can't decide? Let AI build it for you.</h3>
            <p>Describe your business in one sentence and get an editable website draft in minutes.</p>
          </div>
          <Link to="/features" className="btn-ai">
            Try the AI builder
          </Link>
        </div>
      </div>
    </div>
  );
}
