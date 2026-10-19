/** Resolve colors before passing them to image exporters or saving design data. */
export function resolveCssColor(color: string): string {
  const match = color.match(/^var\((--[\w-]+)\)$/);
  if (!match || typeof document === "undefined") return color;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  if (!value) throw new Error(`Unknown color token: ${match[1]}`);
  return value;
}

/** Keep token syntax out of the design editor's visible color label. */
export function colorLabel(color: string): string {
  const match = color.match(/^var\(--palette-([\w-]+)\)$/);
  return match ? match[1].replace(/^design-/, "").replaceAll("-", " ") : color.toUpperCase();
}
