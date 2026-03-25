/**
 * Hex palette aligned with `app/globals.css` :root (light theme).
 * Email clients do not support OKLCH/CSS variables — use these literals in inline styles.
 */
export const emailTheme = {
  pageBg: "#f7f5fa",
  cardBg: "#ffffff",
  foreground: "#454348",
  foregroundMuted: "#8a8490",
  primary: "#e8b4bf",
  primaryForeground: "#6b3040",
  border: "#ebe6ee",
  accentBar: "#e8b4bf",
  fontSans: "'Outfit', Helvetica, Arial, sans-serif",
  fontDisplay: "'Lacquer', Georgia, 'Times New Roman', serif",
} as const;

/**
 * Direct gstatic URLs — used by `<Font />` in email `<Head>` (link tags are often stripped).
 * @see https://fonts.googleapis.com/css2?family=Lacquer&display=swap
 * @see https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap
 */
export const emailWebFonts = {
  lacquer: {
    woff2:
      "https://fonts.gstatic.com/s/lacquer/v16/EYqzma1QwqpG4_BBN7iKXw.woff2",
  },
  outfit: {
    /** Latin subset — variable file covers 400–600 for most glyphs */
    woff2:
      "https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2",
  },
} as const;

export function getEmailSiteUrl(): string {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL?.trim()
      : undefined;
  return raw ? raw.replace(/\/$/, "") : "https://myfriendsart.ca";
}
