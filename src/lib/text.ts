/**
 * Keep the last two words together so a leftover word never sits alone.
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
