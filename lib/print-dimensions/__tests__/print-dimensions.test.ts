import {
  classifyPixelAspectToStandardOrCustom,
  dpiToPrintQuality,
  gcdPositive,
  getPrintDimensionRows,
  MAX_PRINT_INCHES,
  MIN_PRINT_INCHES,
  snapPixelAspectToCommonAspect,
} from "..";

describe("gcdPositive", () => {
  it("reduces 3600 and 4800", () => {
    expect(gcdPositive(3600, 4800)).toBe(1200);
  });

  it("handles coprime pair", () => {
    expect(gcdPositive(3, 4)).toBe(1);
  });
});

describe("dpiToPrintQuality", () => {
  it("maps boundary bands", () => {
    expect(dpiToPrintQuality(99.9)).toBe("low");
    expect(dpiToPrintQuality(100)).toBe("good");
    expect(dpiToPrintQuality(149.99)).toBe("good");
    expect(dpiToPrintQuality(150)).toBe("high");
    expect(dpiToPrintQuality(219.99)).toBe("high");
    expect(dpiToPrintQuality(220)).toBe("highest");
    expect(dpiToPrintQuality(299.99)).toBe("highest");
    expect(dpiToPrintQuality(300)).toBe("highest");
    expect(dpiToPrintQuality(301)).toBe("highest");
  });
});

describe("classifyPixelAspectToStandardOrCustom", () => {
  it("maps near-3:4 pixels to 3:4", () => {
    expect(classifyPixelAspectToStandardOrCustom(3600, 4800)).toBe("3:4");
    expect(classifyPixelAspectToStandardOrCustom(4000, 5300)).toBe("3:4");
  });

  it("returns custom for ratios far from the five standards", () => {
    expect(classifyPixelAspectToStandardOrCustom(1920, 1080)).toBe("custom");
  });
});

describe("snapPixelAspectToCommonAspect", () => {
  it("maps near-3:4 pixel ratios like 40:53 to 3:4", () => {
    expect(snapPixelAspectToCommonAspect(40, 53)).toEqual({
      aspectW: 3,
      aspectH: 4,
    });
    expect(snapPixelAspectToCommonAspect(4000, 5300)).toEqual({
      aspectW: 3,
      aspectH: 4,
    });
  });
});

describe("getPrintDimensionRows", () => {
  it("returns empty for invalid pixels", () => {
    expect(getPrintDimensionRows(null, 100)).toEqual([]);
    expect(getPrintDimensionRows(100, 0)).toEqual([]);
    expect(getPrintDimensionRows(-1, 100)).toEqual([]);
  });

  it("returns empty when aspect is custom", () => {
    expect(getPrintDimensionRows(1920, 1080)).toEqual([]);
  });

  it("uses 3:4 presets from ASPECT_RATIO_TO_DIMENSIONS_OPTIONS for 3600×4800", () => {
    const rows = getPrintDimensionRows(3600, 4800);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      k: 1,
      width_in: 6,
      height_in: 8,
      effective_dpi: 600,
      quality: "highest",
    });
    const last = rows[rows.length - 1];
    expect(Math.max(last.width_in, last.height_in)).toBeLessThanOrEqual(
      MAX_PRINT_INCHES,
    );
  });

  it("stops before exceeding max print size", () => {
    const rows = getPrintDimensionRows(3600, 4800);
    const maxLongest = Math.max(
      ...rows.map((r) => Math.max(r.width_in, r.height_in)),
    );
    expect(maxLongest).toBeLessThanOrEqual(MAX_PRINT_INCHES);
  });

  it("uses 3:4 presets for near-3:4 pixels (e.g. 4000×5300)", () => {
    const rows = getPrintDimensionRows(4000, 5300);
    expect(rows[0]).toMatchObject({
      width_in: 6,
      height_in: 8,
    });
  });

  it("does not list sizes under MIN_PRINT_INCHES on the longest side", () => {
    const rows = getPrintDimensionRows(3600, 4800);
    for (const r of rows) {
      expect(Math.max(r.width_in, r.height_in)).toBeGreaterThanOrEqual(
        MIN_PRINT_INCHES,
      );
    }
  });
});
