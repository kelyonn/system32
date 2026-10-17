import type { Block } from "@/data/site";

export function DocView({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b) return <p key={i}>{b.p}</p>;
        if ("h" in b) return <h3 key={i} className="doc-h">{b.h}</h3>;
        if ("li" in b)
          return (
            <ul key={i} className="doc-li">
              {b.li.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          );
        return (
          <ul key={i} className="doc-links">
            {b.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

export function docLines(blocks: readonly Block[]): string[] {
  return blocks.flatMap((b) => {
    if ("p" in b) return [b.p];
    if ("h" in b) return [b.h.toUpperCase()];
    if ("li" in b) return b.li.map((t) => `- ${t}`);
    return b.links.map((l) => l.label);
  });
}
