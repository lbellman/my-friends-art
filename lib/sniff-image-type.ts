/**
 * When Storage serves downloads as application/octet-stream, infer image MIME + extension from magic bytes.
 */
export function sniffImageMimeAndExt(
  buf: ArrayBuffer,
): { mime: string; ext: string } | null {
  const u8 = new Uint8Array(buf.byteLength < 16 ? buf : buf.slice(0, 16));
  if (u8.length >= 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    u8.length >= 8 &&
    u8[0] === 0x89 &&
    u8[1] === 0x50 &&
    u8[2] === 0x4e &&
    u8[3] === 0x47
  ) {
    return { mime: "image/png", ext: "png" };
  }
  if (
    u8.length >= 12 &&
    u8[0] === 0x52 &&
    u8[1] === 0x49 &&
    u8[2] === 0x46 &&
    u8[3] === 0x46 &&
    u8[8] === 0x57 &&
    u8[9] === 0x45 &&
    u8[10] === 0x42 &&
    u8[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (
    u8.length >= 4 &&
    u8[0] === 0x49 &&
    u8[1] === 0x49 &&
    u8[2] === 0x2a &&
    u8[3] === 0x00
  ) {
    return { mime: "image/tiff", ext: "tif" };
  }
  if (
    u8.length >= 4 &&
    u8[0] === 0x4d &&
    u8[1] === 0x4d &&
    u8[2] === 0x00 &&
    u8[3] === 0x2a
  ) {
    return { mime: "image/tiff", ext: "tif" };
  }
  return null;
}

/** Prefer Storage-reported image/* type; otherwise sniff bytes (Storage often returns octet-stream). */
export function resolveDownloadImageType(
  blob: Blob,
  buffer: ArrayBuffer,
): { mime: string; ext: string } {
  const t = blob.type?.trim() ?? "";
  if (t.startsWith("image/")) {
    const sub = t.split("/")[1]?.split(";")[0]?.trim().toLowerCase() ?? "";
    const ext = sub === "jpeg" ? "jpg" : sub || "img";
    return { mime: t, ext };
  }
  const sniffed = sniffImageMimeAndExt(buffer);
  if (sniffed) return sniffed;
  return { mime: t || "application/octet-stream", ext: "bin" };
}
