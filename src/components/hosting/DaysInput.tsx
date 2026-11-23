/** Small numeric "N days" input used by hosting settings and the renewal reminder email. */
export default function DaysInput({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  isDisabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  isDisabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex h-9 w-36 items-center rounded-lg border bg-surface shadow-ed-xs focus-within:ring-2 ${
          error ? "border-ed-danger" : "border-ed-border focus-within:border-ed-accent focus-within:ring-ed-accent/15"
        }`}
      >
        <input
          id={id}
          inputMode="numeric"
          value={value}
          disabled={isDisabled}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))}
          className="w-full min-w-0 bg-transparent px-3 text-sm text-ink focus:outline-none"
        />
        <span className="pr-3 text-xs text-ink-muted" aria-hidden>
          days
        </span>
      </div>
      {error ? <p className="mt-1 text-xs text-ed-danger">{error}</p> : hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
