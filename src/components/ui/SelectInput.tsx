import { Button, Dropdown, Label } from "@heroui/react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption<T extends string> = { value: T; label: string };

type SelectInputProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  ariaLabel?: string;
  className?: string;
  /** Shows the same red asterisk as required text fields. */
  isRequired?: boolean;
  error?: string;
};

export default function SelectInput<T extends string>({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  className = "",
  isRequired = false,
  error,
}: SelectInputProps<T>) {
  const selectedOption =
    options.find((opt) => opt.value === value) ?? options[0];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-ink">
          {label}
          {isRequired && (
            <span className="ms-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </span>
      )}
      <Dropdown>
        <Button
          aria-label={label ?? ariaLabel ?? "Select option"}
          aria-invalid={error ? true : undefined}
          variant="secondary"
          className={`flex h-9 w-full items-center justify-between rounded-lg border bg-surface px-3 text-left text-sm font-normal text-ink shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong hover:bg-surface focus-visible:border-ed-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-accent/15 ${
            error ? "border-ed-danger" : "border-ed-border"
          }`}
        >
          <span className="truncate">
            {selectedOption?.label ?? String(value)}
          </span>
          <ChevronDown className="size-4 shrink-0 text-ink-muted" />
        </Button>
        <Dropdown.Popover className="min-w-(--trigger-width) rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
          <Dropdown.Menu
            selectionMode="single"
            selectedKeys={new Set([String(value)])}
            onAction={(key) => {
              const option = options.find(
                (opt) => String(opt.value) === String(key),
              );
              if (option) onChange(option.value);
            }}
            className="flex flex-col gap-0.5 outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Dropdown.Item
                  key={String(option.value)}
                  id={String(option.value)}
                  textValue={option.label}
                  className={`group flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors duration-150 select-none ${
                    isSelected
                      ? "bg-ed-accent-soft font-medium text-ed-accent"
                      : "text-ink hover:bg-canvas"
                  }`}
                >
                  <div className="flex size-4 shrink-0 items-center justify-center">
                    {isSelected ? (
                      <Check className="size-3.5 text-ed-accent" />
                    ) : null}
                  </div>
                  <Label className="flex-1 cursor-pointer truncate font-inherit">
                    {option.label}
                  </Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      {error && <p className="text-xs text-ed-danger">{error}</p>}
    </div>
  );
}
