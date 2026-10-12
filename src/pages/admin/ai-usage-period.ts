import type { SelectOption } from "../../components/ui/SelectInput.tsx";

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth() + 1;

export const MONTH_OPTIONS: SelectOption<string>[] = [
  { value: "", label: "All months" },
  ...["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
    (label, index) => ({ value: String(index + 1), label }),
  ),
];

export const YEAR_OPTIONS: SelectOption<string>[] = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  value: String(y),
  label: String(y),
}));
