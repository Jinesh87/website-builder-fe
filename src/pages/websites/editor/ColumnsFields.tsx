import type { GridColumns } from "../../../site-kit/index.ts";
import { SelectField } from "./fields.tsx";

export const COLUMN_OPTIONS: { value: GridColumns; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

/** Desktop and mobile column pickers for grid sections. */
export function ColumnsFields<T extends { columns: GridColumns; mobileColumns: GridColumns }>({
  data,
  onChange,
}: {
  data: T;
  onChange: (data: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        label="Columns"
        value={data.columns}
        options={COLUMN_OPTIONS}
        onChange={(columns) => onChange({ ...data, columns })}
      />
      <SelectField
        label="On mobile"
        value={data.mobileColumns}
        options={COLUMN_OPTIONS.slice(0, 2)}
        onChange={(mobileColumns) => onChange({ ...data, mobileColumns })}
      />
    </div>
  );
}
