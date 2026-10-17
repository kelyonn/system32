"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

// A 5x7 block font, just enough for the wordmark.
const GLYPHS: Record<string, string[]> = {
  s: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  t: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  e: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  m: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
};

function wordmark(text: string): string {
  const rows = Array.from({ length: 7 }, () => "");
  for (const ch of text.toLowerCase()) {
    const g = GLYPHS[ch];
    if (!g) continue;
    for (let r = 0; r < 7; r++) rows[r] += g[r].replace(/#/g, "@@").replace(/\./g, "  ") + "  ";
  }
  return rows.map((r) => r.replace(/\s+$/, "")).join("\n");
}

const RAMP = " .,:;-~=+*";

/** Soft contour field: a few drifting sines turned into stepped bands, so it reads as terrain. */
function field(cols: number, rows: number): string {
  const out: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const u = x / 62;
      const v = y / 19;
      const h =
        Math.sin(u * 1.3 + Math.sin(v * 1.1) * 1.4) +
        Math.sin(v * 1.7 - u * 0.6 + 1.2) * 0.8 +
        Math.sin((u + v) * 0.9 + 2.4) * 0.6;
      const band = ((h + 2.4) / 4.8) * 9;
      const contour = Math.abs(band - Math.round(band));
      // Thin contour lines get a character; the space between stays empty.
      line += contour < 0.14 ? RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(band)))] : " ";
    }
    out.push(line);
  }
  return out.join("\n");
}

export function AsciiWallpaper() {
  const box = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const draw = () => {
      const cols = Math.ceil(el.clientWidth / 6.1) + 1;
      const rows = Math.ceil(el.clientHeight / 11) + 1;
      setText(field(cols, rows));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="ascii-wall" ref={box} aria-hidden>
      <pre>{text}</pre>
      <pre className="banner">{wordmark(site.osName)}</pre>
      <pre className="tag">{`${site.person.name.toLowerCase()} / ${new Date().getFullYear()}`}</pre>
    </div>
  );
}
