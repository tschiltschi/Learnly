// Rule-based flashcard extraction. This is NOT AI: it looks for "Term: definition" lines
// and simple "X is Y." sentences; the term becomes the front of the card. A real AI provider can replace it via services/ai.
export interface ExtractedCard {
  front: string;
  back: string;
}

const SEPARATORS = [/^(.{2,80}?)\s*[:：]\s+(.{3,})$/, /^(.{2,80}?)\s+[–—-]\s+(.{3,})$/, /^(.{2,80}?)\s*=\s*(.{3,})$/];

export function extractCards(text: string, max = 30): ExtractedCard[] {
  const out: ExtractedCard[] = [];
  const seen = new Set<string>();
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•*\-\d.)]+/, '').trim())
    .filter(Boolean);

  for (const line of lines) {
    let matched = false;
    for (const re of SEPARATORS) {
      const m = line.match(re);
      if (m) {
        const term = m[1].trim();
        const def = m[2].trim();
        if (!seen.has(term.toLowerCase())) {
          seen.add(term.toLowerCase());
          out.push({ front: term, back: capitalize(def) });
        }
        matched = true;
        break;
      }
    }
    if (matched) continue;
    // "X is/are Y." sentences, in English or German ("X ist Y.", "X bezeichnet Y.")
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      const m = sentence.match(/^([A-ZÄÖÜ][^,;]{1,60}?)\s+(is|are|was|were|means|refers to|ist|sind|war|waren|bedeutet|bezeichnet|nennt man)\s+(.{8,})[.!?]?$/);
      if (m && !seen.has(m[1].toLowerCase())) {
        seen.add(m[1].toLowerCase());
        out.push({ front: m[1], back: capitalize(m[3].replace(/[.!?]$/, '')) });
      }
    }
    if (out.length >= max) break;
  }
  return out.slice(0, max);
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
