import { readFileSync } from "node:fs";
import { join } from "node:path";

let colors: Map<string, string> | undefined;

/** Resolve CSS tokens for email clients and metadata, which cannot use var(). */
export function getColorValue(token: string): string {
  if (!colors) {
    const css = readFileSync(join(process.cwd(), "app/theme/colors.css"), "utf8");
    colors = new Map(
      Array.from(css.matchAll(/(--palette-[\w-]+):\s*([^;]+);/g), (match) => [
        match[1],
        match[2].trim(),
      ]),
    );
  }

  const value = colors.get(token);
  if (!value) throw new Error(`Unknown color token: ${token}`);
  return value;
}
