// --- constants ----------------------------------------------------------------

/** Longest side (inches) of any enumerated print size. */
export const MAX_PRINT_INCHES = 48;

/** Do not list sizes smaller than this on the longest side (inches). */
export const MIN_PRINT_INCHES = 5;

/**
 * Max |log(pxW/pxH) − log(r)| to the nearest standard aspect (see {@link ASPECT_RATIO_TO_DIMENSIONS_OPTIONS}).
 * Above this, the image is treated as custom.
 */
export const MAX_ASPECT_LOG_DISTANCE = 0.03;

export const ASPECT_RATIO_TO_DIMENSIONS_OPTIONS = {
  "1:1": [
    { width: 5, height: 5 },
    { width: 8, height: 8 },
    { width: 10, height: 10 },
    { width: 12, height: 12 },
    { width: 16, height: 16 },
    { width: 20, height: 20 },
  ],
  "2:3": [
    { width: 4, height: 6 },
    { width: 8, height: 12 },
    { width: 12, height: 18 },
    { width: 16, height: 24 },
    { width: 20, height: 30 },
  ],
  "3:4": [
    { width: 6, height: 8 },
    { width: 9, height: 12 },
    { width: 12, height: 16 },
    { width: 18, height: 24 },
    { width: 24, height: 32 },
  ],
  "4:5": [
    { width: 8, height: 10 },
    { width: 11, height: 14 },
    { width: 16, height: 20 },
    { width: 20, height: 25 },
    { width: 24, height: 30 },
  ],
  "5:7": [
    { width: 5, height: 7 },
    { width: 10, height: 14 },
    { width: 20, height: 28 },
  ],
} as const;

export type StandardPrintAspectKey = keyof typeof ASPECT_RATIO_TO_DIMENSIONS_OPTIONS;

// --- gcd ----------------------------------------------------------------------

/** Greatest common divisor for positive integers. */
export function gcdPositive(a: number, b: number): number {
  let x = Math.abs(Math.floor(a));
  let y = Math.abs(Math.floor(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

// --- dpi / quality ------------------------------------------------------------

export type PrintQualityTier =
  | "low"
  | "good"
  | "high"
  | "highest";

/**
 * Fixed DPI bands (lower bound inclusive, upper bound exclusive except last tier).
 * - [0, 100) → Low
 * - [100, 150) → Good
 * - [150, 220) → High
 * - [220, ∞) → Highest
 */
export function dpiToPrintQuality(effectiveDpi: number): PrintQualityTier {
  if (!Number.isFinite(effectiveDpi) || effectiveDpi < 0) {
    return "low";
  }
  if (effectiveDpi < 100) return "low";
  if (effectiveDpi < 150) return "good";
  if (effectiveDpi < 220) return "high";
  return "highest";
}

export const PRINT_QUALITY_LABELS: Record<PrintQualityTier, string> = {
  low: "Low",
  good: "Good",
  high: "High",
  highest: "Highest",
};

export type PrintQualityChartRow = {
  tier: PrintQualityTier;
  /** Human-readable DPI band (matches `dpiToPrintQuality` thresholds). */
  dpiRange: string;
  description: string;
};

/**
 * Rows for UI copy; bands align with {@link dpiToPrintQuality}.
 */
export const PRINT_QUALITY_CHART_ROWS: PrintQualityChartRow[] = [
  {
    tier: "low",
    dpiRange: "Under 100 DPI",
    description:
      "Noticeably soft or blurry; generally not suitable for physical prints.",
  },
  {
    tier: "good",
    dpiRange: "100–150 DPI",
    description:
      "Acceptable for large prints that will be viewed from a distance.",
  },
  {
    tier: "high",
    dpiRange: "150–220 DPI",
    description:
      "Solid quality; typical for many mid-size prints and posters.",
  },
  {
    tier: "highest",
    dpiRange: "220 DPI and above",
    description:
      "Sharp, high-quality output; 220–300 DPI is a common target for fine art prints, and gains beyond ~300 DPI are often subtle at typical viewing distances.",
  },
];

// --- aspect classification ----------------------------------------------------

export type AspectClassification = StandardPrintAspectKey | "custom";

export function hasValidImagePixelDimensions(
  pxWidth: number | null | undefined,
  pxHeight: number | null | undefined,
): boolean {
  const w = pxWidth != null ? Math.floor(Number(pxWidth)) : NaN;
  const h = pxHeight != null ? Math.floor(Number(pxHeight)) : NaN;
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
}

/**
 * Classifies pixel dimensions into one of the standard print aspects in
 * {@link ASPECT_RATIO_TO_DIMENSIONS_OPTIONS}, or `custom` when the ratio is too far from any of them.
 */
export function classifyPixelAspectToStandardOrCustom(
  pxWidth: number | null | undefined,
  pxHeight: number | null | undefined,
): AspectClassification {
  if (!hasValidImagePixelDimensions(pxWidth, pxHeight)) {
    return "custom";
  }

  const w = Math.floor(Number(pxWidth));
  const h = Math.floor(Number(pxHeight));
  const ratio = w / h;
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return "custom";
  }

  const keys = Object.keys(
    ASPECT_RATIO_TO_DIMENSIONS_OPTIONS,
  ) as StandardPrintAspectKey[];

  let bestKey: StandardPrintAspectKey = "1:1";
  let bestDist = Number.POSITIVE_INFINITY;

  for (const key of keys) {
    const [a, b] = key.split(":").map(Number);
    const r1 = a / b;
    const r2 = b / a;
    const dist = Math.min(
      Math.abs(Math.log(ratio) - Math.log(r1)),
      Math.abs(Math.log(ratio) - Math.log(r2)),
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key;
    }
  }

  if (bestDist > MAX_ASPECT_LOG_DISTANCE) {
    return "custom";
  }

  return bestKey;
}

// --- print dimension rows -----------------------------------------------------

export type PrintDimensionRow = {
  /** 1-based index within the filtered preset list for this aspect. */
  k: number;
  width_in: number;
  height_in: number;
  effective_dpi: number;
  quality: PrintQualityTier;
};

function mapPresetToPrintInches(
  width: number,
  height: number,
  imagePortrait: boolean,
): { width_in: number; height_in: number } {
  if (imagePortrait) {
    return { width_in: width, height_in: height };
  }
  return { width_in: height, height_in: width };
}

function rowsForStandardAspect(
  pxWidth: number,
  pxHeight: number,
  aspectKey: StandardPrintAspectKey,
): PrintDimensionRow[] {
  const presets = ASPECT_RATIO_TO_DIMENSIONS_OPTIONS[aspectKey];
  const imagePortrait = pxHeight >= pxWidth;

  const rows: PrintDimensionRow[] = [];
  let index = 0;

  for (const preset of presets) {
    const { width_in, height_in } = mapPresetToPrintInches(
      preset.width,
      preset.height,
      imagePortrait,
    );

    const longest = Math.max(width_in, height_in);
    if (longest > MAX_PRINT_INCHES) {
      continue;
    }
    if (longest < MIN_PRINT_INCHES) {
      continue;
    }

    const effectiveDpi = pxWidth / width_in;

    index += 1;
    rows.push({
      k: index,
      width_in,
      height_in,
      effective_dpi: effectiveDpi,
      quality: dpiToPrintQuality(effectiveDpi),
    });
  }

  return rows;
}

/**
 * Lists preset print sizes from {@link ASPECT_RATIO_TO_DIMENSIONS_OPTIONS} for the
 * image’s classified aspect (1:1, 2:3, 3:4, 4:5, 5:7). Returns `[]` when pixels are
 * invalid or the aspect is classified as `custom`.
 */
export function getPrintDimensionRows(
  pxWidth: number | null | undefined,
  pxHeight: number | null | undefined,
): PrintDimensionRow[] {
  const w = pxWidth != null ? Math.floor(Number(pxWidth)) : NaN;
  const h = pxHeight != null ? Math.floor(Number(pxHeight)) : NaN;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return [];
  }

  const classification = classifyPixelAspectToStandardOrCustom(w, h);
  if (classification === "custom") {
    return [];
  }

  return rowsForStandardAspect(w, h, classification);
}

export function dimensionValueFromRow(row: PrintDimensionRow): string {
  return `${row.width_in}x${row.height_in}`;
}

// --- legacy snap helper -------------------------------------------------------

/**
 * Maps pixel dimensions to a small integer width:height pair for the nearest
 * standard print aspect (see {@link ASPECT_RATIO_TO_DIMENSIONS_OPTIONS}), or 1:1 when classified as custom.
 */
export function snapPixelAspectToCommonAspect(
  pxWidth: number,
  pxHeight: number,
): { aspectW: number; aspectH: number } {
  const key = classifyPixelAspectToStandardOrCustom(pxWidth, pxHeight);
  if (key === "custom") {
    return { aspectW: 1, aspectH: 1 };
  }
  const [a, b] = key.split(":").map(Number);
  const g = gcdPositive(a, b);
  return { aspectW: a / g, aspectH: b / g };
}
