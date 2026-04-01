"use client";

import QualityChip from "@/components/atoms/quality-chip/QualityChip";
import SingleSelect, {
  type SingleSelectOptionType,
} from "@/components/atoms/single-select/SingleSelect";
import {
  dimensionValueFromRow,
  getPrintDimensionRows,
  hasValidImagePixelDimensions,
  type PrintDimensionRow
} from "@/lib/print-dimensions";
import { useMemo } from "react";

function DimensionOptionLabel({ row }: { row: PrintDimensionRow }) {
  return (
    <span className="flex w-full min-w-0 items-center justify-between gap-3">
      <span>{`${row.width_in} × ${row.height_in}"`}</span>
      <QualityChip tier={row.quality} />
    </span>
  );
}

/** Canonical value for storage/submit when `value` may be empty or not in the option list. */
export function resolveDimensionSelectValue(
  value: string,
  pxWidth?: number | null,
  pxHeight?: number | null,
): string {
  const rows = getPrintDimensionRows(pxWidth, pxHeight);
  const keys = new Set([
    ...rows.map((r) => dimensionValueFromRow(r)),
    "custom",
  ]);
  if (keys.has(value)) {
    return value;
  }
  return rows.length > 0 ? dimensionValueFromRow(rows[0]) : "custom";
}

export type DimensionsSingleSelectProps = {
  value: string;
  onChange: (key: string) => void;
  pxWidth?: number | null;
  pxHeight?: number | null;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** When false, the “missing pixels” helper line is hidden (e.g. dialog shows its own copy). */
  showMissingPixelsMessage?: boolean;
};

export default function DimensionsSingleSelect({
  value,
  onChange,
  pxWidth,
  pxHeight,
  id,
  label,
  placeholder = "Select a print size",
  required,
  disabled,
  showMissingPixelsMessage = true,
}: DimensionsSingleSelectProps) {
  const dimensionRows = useMemo(
    () => getPrintDimensionRows(pxWidth, pxHeight),
    [pxWidth, pxHeight],
  );

  const validPixels = useMemo(
    () => hasValidImagePixelDimensions(pxWidth, pxHeight),
    [pxWidth, pxHeight],
  );

  const dimensionSelectOptions = useMemo<SingleSelectOptionType[]>(() => {
    const fromRows = dimensionRows.map((row) => ({
      key: dimensionValueFromRow(row),
      label: `${row.width_in} × ${row.height_in}"`,
    }));
    return [...fromRows, { key: "custom", label: "Custom" }];
  }, [dimensionRows]);

  const selectValue = useMemo(
    () => resolveDimensionSelectValue(value, pxWidth, pxHeight),
    [value, pxWidth, pxHeight],
  );

  return (
    <div className="space-y-3 w-full">
      {showMissingPixelsMessage && !validPixels ? (
        <p className="body2 text-muted-foreground">
          Print size options are unavailable because image pixel dimensions are
          missing for this piece. You can still choose Custom and describe the
          size in your message.
        </p>
      ) : null}
      <SingleSelect
        id={id}
        value={selectValue}
        onChange={onChange}
        options={dimensionSelectOptions}
        placeholder={placeholder}
        label={label}
        required={required}
        disabled={disabled}
        renderOption={(option) => {
          if (option.key === "custom") {
            return <span>Custom</span>;
          }
          const row = dimensionRows.find(
            (r) => dimensionValueFromRow(r) === option.key,
          );
          if (!row) {
            return <span>{option.label}</span>;
          }
          return <DimensionOptionLabel row={row} />;
        }}
      />
    </div>
  );
}
