import { ChevronLeft, ChevronRight } from "lucide-react";
import SelectInput from "./SelectInput.tsx";

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Plural noun for the rows, e.g. "calls". */
  itemLabel?: string;
  isDisabled?: boolean;
};

/** Page numbers to show: always the first and last, the current page and its neighbours, with gaps as null. */
function pageNumbers(page: number, totalPages: number): (number | null)[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? [null, n] : [n]));
}

export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel = "rows",
  isDisabled = false,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const navButton =
    "grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-body">
      <div className="flex items-center gap-3">
        <span className="text-ink-muted">Rows per page</span>
        <SelectInput
          ariaLabel="Rows per page"
          value={String(pageSize)}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
          className="w-20"
        />
        <span className="text-ink-muted">
          {first}–{last} of {total.toLocaleString()} {itemLabel}
        </span>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={isDisabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${navButton} border-line bg-surface text-ink hover:bg-canvas`}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          {pageNumbers(page, totalPages).map((n, index) =>
            n === null ? (
              <span key={`gap-${index}`} className="px-1 text-ink-muted">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                disabled={isDisabled}
                onClick={() => n !== page && onPageChange(n)}
                className={`${navButton} ${
                  n === page ? "border-brand bg-brand font-semibold text-white" : "border-line bg-surface text-ink hover:bg-canvas"
                }`}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={isDisabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={`${navButton} border-line bg-surface text-ink hover:bg-canvas`}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}
