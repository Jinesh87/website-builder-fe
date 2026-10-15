import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATS, CAT_LABEL, STYLES, TPLS } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import TemplateCard from "./TemplateCard.tsx";
import "./templates-gallery.css";

export default function TemplatesPage() {
  const location = useLocation();
  const { shortlist, toggleShortlist } = useMarketing();

  const [selectedCat, setSelectedCat] = useState<string>(() => {
    const stateCat = (location.state as { cat?: string } | null)?.cat;
    return stateCat && CATS.includes(stateCat as (typeof CATS)[number]) ? stateCat : "All";
  });
  const [styleFilter, setStyleFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"pop" | "az" | "new">("pop");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TPLS.length };
    for (const c of CATS) {
      if (c === "All") continue;
      counts[c] = TPLS.filter((t) => t.c === c).length;
    }
    return counts;
  }, []);

  // Filtered and sorted templates list
  const filteredIndices = useMemo(() => {
    const result = TPLS.map((_, i) => i).filter((i) => {
      const t = TPLS[i];
      if (selectedCat !== "All" && t.c !== selectedCat) return false;
      if (styleFilter && t.style !== styleFilter) return false;
      return true;
    });

    if (sortOrder === "az") {
      result.sort((a, b) => TPLS[a].n.localeCompare(TPLS[b].n));
    } else if (sortOrder === "new") {
      result.reverse();
    }
    // "pop" maintains the default curated order where row 1 and row 2 match the reference UI!

    return result;
  }, [selectedCat, styleFilter, sortOrder]);

  return (
    <div className="gallery-view" data-view="templates">
      <div className="gallery-wrap">
        {/* Title */}
        <div className="gallery-head">
          <h1 className="gallery-title">All templates</h1>

          {/* Category Chips with Counts */}
          <div className="gallery-chips" role="group" aria-label="Filter templates by category">
            {CATS.map((c) => {
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
            {filteredIndices.length} {filteredIndices.length === 1 ? "template" : "templates"}
            {selectedCat !== "All" ? ` in ${CAT_LABEL[selectedCat] ?? selectedCat}` : ""}
            {styleFilter ? ` · ${styleFilter} style` : ""}
          </span>

          <div className="gallery-filters">
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
          {filteredIndices.length > 0 ? (
            filteredIndices.map((index) => (
              <TemplateCard
                key={index}
                index={index}
                isShortlisted={shortlist.includes(index)}
                onToggleShortlist={toggleShortlist}
              />
            ))
          ) : (
            <div className="gallery-empty">
              <p>No templates match your selected filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCat("All");
                  setStyleFilter("");
                  setSortOrder("pop");
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
