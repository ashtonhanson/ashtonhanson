/**
 * Keep the last two words of each paragraph together so a single
 * word never sits alone on the final line.
 */
export function preventOrphan(text: string): string {
  return text
    .split(/(\n+)/)
    .map((part) => {
      if (/^\n+$/.test(part)) return part;
      return part.replace(/(\S+)\s+(\S+)\s*$/u, "$1\u00A0$2");
    })
    .join("");
}
