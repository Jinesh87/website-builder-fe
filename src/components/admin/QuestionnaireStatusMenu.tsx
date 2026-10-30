import { Dropdown, Label } from "@heroui/react";
import { Check, ChevronDown } from "lucide-react";
import type { QuestionnaireStatus } from "../../features/questionnaire/api.ts";
import { QUESTIONNAIRE_STATUSES, STATUS_META } from "./questionnaire-labels.ts";

type QuestionnaireStatusMenuProps = {
  status: QuestionnaireStatus;
  onChange: (status: QuestionnaireStatus) => void;
  isDisabled?: boolean;
};

/** The status pill doubles as the control to change it. */
export default function QuestionnaireStatusMenu({
  status,
  onChange,
  isDisabled = false,
}: QuestionnaireStatusMenuProps) {
  const current = STATUS_META[status] ?? STATUS_META.NEW;

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`Status: ${current.label}. Change status`}
        isDisabled={isDisabled}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60 ${current.pill}`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${current.dot}`} aria-hidden />
        {current.label}
        <ChevronDown className="size-3.5 opacity-70" aria-hidden />
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-60 rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={new Set([status])}
          onAction={(key) => key !== status && onChange(key as QuestionnaireStatus)}
          className="flex flex-col gap-0.5 outline-none"
        >
          {QUESTIONNAIRE_STATUSES.map((option) => {
            const meta = STATUS_META[option];
            const selected = option === status;
            return (
              <Dropdown.Item
                key={option}
                id={option}
                textValue={meta.label}
                aria-label={`${meta.label}: ${meta.hint}`}
                className={`flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 outline-none transition-colors select-none ${
                  selected ? "bg-canvas" : "hover:bg-canvas"
                }`}
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <Label className="block cursor-pointer text-sm font-medium text-ink">
                    {meta.label}
                  </Label>
                  <span className="block text-xs text-ink-muted">{meta.hint}</span>
                </span>
                {selected && <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

