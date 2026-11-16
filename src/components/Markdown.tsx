import type { ReactNode } from 'react';

// Tiny markdown renderer for tutor messages: paragraphs, lists, tables, **bold**, *italic*, `code`.
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="prose-chat">
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-*] /.test(l)))
          return (
            <ul key={bi}>
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*[-*] /, ''))}</li>
              ))}
            </ul>
          );
        if (lines.every((l) => /^\s*\d+\. /.test(l)))
          return (
            <ol key={bi}>
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*\d+\. /, ''))}</li>
              ))}
            </ol>
          );
        if (lines.length >= 2 && lines.every((l) => l.trim().startsWith('|'))) {
          const rows = lines.filter((l) => !/^\|\s*-/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
          const [head, ...body] = rows;
          return (
            <table key={bi}>
              <thead>
                <tr>{head.map((h, i) => <th key={i}>{inline(h)}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          );
        }
        // mixed: paragraph lines followed by a list
        const firstList = lines.findIndex((l) => /^\s*([-*]|\d+\.) /.test(l));
        if (firstList > 0) {
          return (
            <div key={bi}>
              <p>{inline(lines.slice(0, firstList).join(' '))}</p>
              <Markdown text={lines.slice(firstList).join('\n')} />
            </div>
          );
        }
        return <p key={bi}>{inline(lines.join(' '))}</p>;
      })}
    </div>
  );
}
