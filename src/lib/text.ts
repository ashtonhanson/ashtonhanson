/**
 * Keep short words and the last few words together so a line never
 * holds a single leftover word.
 */
export function preventOrphan(text: string): string {
  const nbsp = "\u00A0";
  return text
    .split(/(\n+)/)
    .map((part) => {
      if (/^\n+$/.test(part)) return part;
      const leading = part.match(/^\s*/)?.[0] ?? "";
      const trailing = part.match(/\s*$/)?.[0] ?? "";
      const words = part.trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) return part;
      const pieces: string[] = [];
      for (let i = 0; i < words.length; i++) {
        pieces.push(words[i]!);
        if (i >= words.length - 1) break;
        const cur = words[i]!;
        const next = words[i + 1]!;
        const nearEnd = i >= words.length - 3;
        const glue =
          nearEnd ||
          cur.length <= 2 ||
          next.length <= 2 ||
          /^(a|an|the|and|or|of|to|in|on|for|with|by|as)$/i.test(cur);
        pieces.push(glue ? nbsp : " ");
      }
      return leading + pieces.join("") + trailing;
    })
    .join("");
}
