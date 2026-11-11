import { useEffect, useState } from "react";
import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  Label,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { parseDate, today } from "@internationalized/date";
import { Calendar as CalendarIcon, TicketPercent } from "lucide-react";
import {
  adminHostingApi,
  type CreateHostingCouponInput,
  type HostingCoupon,
  type HostingCouponDiscountType,
  type UpdateHostingCouponInput,
} from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { paiseToRupeesInput, rupeesInputToPaise } from "../../utils/hosting-pricing.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";

const TYPE_OPTIONS: { value: HostingCouponDiscountType; label: string }[] = [
  { value: "PERCENT", label: "Percent off" },
  { value: "FIXED_PAISE", label: "Fixed ₹ off" },
];

const IST = "Asia/Kolkata";

type FormState = {
  code: string;
  discountType: HostingCouponDiscountType;
  discountValue: string;
  expiresAt: string;
  maxUses: string;
};

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

/** Keep the coupon valid through the end of the chosen India calendar day. */
export function expiryToIso(dateOnly: string): string {
  return `${dateOnly}T23:59:59.999+05:30`;
}

export function isoToDateOnly(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function parseExpiryDate(dateOnly: string): DateValue | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  try {
    return parseDate(dateOnly);
  } catch {
    return null;
  }
}

function emptyForm(): FormState {
  return {
    code: "",
    discountType: "PERCENT",
    discountValue: "10",
    expiresAt: "",
    maxUses: "",
  };
}

function formFromCoupon(coupon: HostingCoupon): FormState {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue:
      coupon.discountType === "PERCENT"
        ? String(coupon.discountValue)
        : paiseToRupeesInput(coupon.discountValue),
    expiresAt: coupon.expiresAt ? isoToDateOnly(coupon.expiresAt) : "",
    maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : "",
  };
}

function parseDiscountValue(
  discountType: HostingCouponDiscountType,
  discountValue: string,
): { value: number } | { error: string } {
  if (discountType === "PERCENT") {
    const value = Number(discountValue);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      return { error: "Percent must be a whole number from 1 to 100." };
    }
    return { value };
  }
  const paise = rupeesInputToPaise(discountValue);
  if (paise === null || Number.isNaN(paise) || paise < 1) {
    return { error: "Enter a rupee amount greater than 0." };
  }
  return { value: paise };
}

function parseMaxUses(maxUses: string): { value: number | null } | { error: string } {
  if (!maxUses.trim()) return { value: null };
  const value = Number(maxUses);
  if (!Number.isInteger(value) || value < 1) {
    return { error: "Max uses must be a whole number ≥ 1, or blank for unlimited." };
  }
  return { value };
}

type CouponFormModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  coupon?: HostingCoupon | null;
  onClose: () => void;
  onSaved: (coupon: HostingCoupon) => void;
};

export default function CouponFormModal({
  isOpen,
  mode,
  coupon = null,
  onClose,
  onSaved,
}: CouponFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    setForm(mode === "edit" && coupon ? formFromCoupon(coupon) : emptyForm());
  }, [isOpen, mode, coupon]);

  function handleClose() {
    if (saving) return;
    onClose();
  }

  async function handleSave() {
    setFeedback(null);

    const discount = parseDiscountValue(form.discountType, form.discountValue);
    if ("error" in discount) {
      setFeedback({ status: "danger", message: discount.error });
      return;
    }

    const maxUses = parseMaxUses(form.maxUses);
    if ("error" in maxUses) {
      setFeedback({ status: "danger", message: maxUses.error });
      return;
    }

    if (mode === "create") {
      const trimmedCode = form.code.trim().toUpperCase();
      if (trimmedCode.length < 3) {
        setFeedback({ status: "danger", message: "Code needs at least 3 characters." });
        return;
      }
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const input: CreateHostingCouponInput = {
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: discount.value,
          expiresAt: form.expiresAt ? expiryToIso(form.expiresAt) : null,
          maxUses: maxUses.value,
        };
        onSaved(await adminHostingApi.createCoupon(input));
      } else if (coupon) {
        const input: UpdateHostingCouponInput = {
          discountType: form.discountType,
          discountValue: discount.value,
          expiresAt: form.expiresAt ? expiryToIso(form.expiresAt) : null,
          maxUses: maxUses.value,
        };
        onSaved(await adminHostingApi.updateCoupon(coupon.id, input));
      }
      onClose();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  const minExpiry = (() => {
    const todayIst = today(IST);
    if (mode !== "edit" || !form.expiresAt) return todayIst;
    const current = parseExpiryDate(form.expiresAt);
    if (current && current.compare(todayIst) < 0) return current;
    return todayIst;
  })();

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      headerDetails={{
        icon: <TicketPercent className="size-4.5" />,
        title: mode === "create" ? "Create coupon" : "Edit coupon",
        description:
          mode === "create"
            ? "Clients apply this at hosting checkout. Each client can use it once."
            : "Update discount, expiry, or usage limit. The code cannot be changed.",
      }}
      iconTone="brand"
      size="md"
      primaryAction={{
        label: mode === "create" ? "Create coupon" : "Save changes",
        onPress: () => void handleSave(),
        isPending: saving,
        isDisabled: saving,
      }}
      secondaryAction={{ label: "Cancel", onPress: handleClose, isDisabled: saving }}
    >
      <div className="flex flex-col gap-4">
        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
        <TextInput
          label="Code"
          name="coupon-code"
          value={form.code}
          onChange={(code) => setForm((current) => ({ ...current, code }))}
          placeholder="SAVE20"
          isDisabled={saving || mode === "edit"}
          isRequired
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Type"
            value={form.discountType}
            onChange={(discountType) =>
              setForm((current) => ({
                ...current,
                discountType,
                discountValue: discountType === "PERCENT" ? "10" : "500",
              }))
            }
            options={TYPE_OPTIONS}
          />
          <TextInput
            label={form.discountType === "PERCENT" ? "Percent" : "Rupees off"}
            name="coupon-value"
            value={form.discountValue}
            onChange={(discountValue) => setForm((current) => ({ ...current, discountValue }))}
            placeholder={form.discountType === "PERCENT" ? "10" : "500"}
            isDisabled={saving}
            isRequired
          />
        </div>
        <DatePicker
          className="w-full text-ink"
          name="coupon-expires"
          granularity="day"
          value={parseExpiryDate(form.expiresAt)}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              expiresAt: value ? value.toString() : "",
            }))
          }
          minValue={minExpiry}
          isDisabled={saving}
        >
          <Label className="mb-1 block text-sm font-medium text-ink">Expires (optional)</Label>
          <DateField.Group
            fullWidth
            className="h-9 rounded-lg border border-ed-border bg-surface text-sm text-ink shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15"
          >
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger className="text-ink-muted hover:text-ink">
                <DatePicker.TriggerIndicator className="text-ink-muted">
                  <CalendarIcon className="size-4" />
                </DatePicker.TriggerIndicator>
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <Description className="mt-1 block text-xs text-ink-muted">
            Valid through the end of this day (IST). Leave empty for no expiry.
          </Description>
          <DatePicker.Popover
            placement="top"
            className="z-(--z-ed-popover) border border-ed-border bg-surface text-ink shadow-ed-pop"
          >
            <Calendar aria-label="Coupon expiry date" className="text-ink">
              <Calendar.Header>
                <Calendar.YearPickerTrigger className="text-ink">
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell className="text-ink-muted">{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => <Calendar.Cell date={date} className="text-ink" />}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} className="text-ink" />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
        <TextInput
          label="Max uses (optional)"
          name="coupon-max"
          value={form.maxUses}
          onChange={(maxUses) => setForm((current) => ({ ...current, maxUses }))}
          placeholder="Unlimited"
          isDisabled={saving}
        />
      </div>
    </CommonModal>
  );
}
