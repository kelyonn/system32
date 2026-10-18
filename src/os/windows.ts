import { site } from "@/data/site";

export type WinKind = string; // "projects" | "about" | "resume" | "terminal" | "trash" | "project:<id>"

export type Win = {
  id: WinKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  rolled: boolean;
};

export type State = { wins: Win[]; zTop: number; focus: WinKind | null };

export type Action =
  | { t: "open"; id: WinKind; big?: boolean; at?: { x: number; y: number; w: number; h: number } }
  | { t: "close"; id: WinKind }
  | { t: "focus"; id: WinKind }
  | { t: "move"; id: WinKind; x: number; y: number }
  | { t: "resize"; id: WinKind; w: number; h: number }
  | { t: "roll"; id: WinKind }
  | { t: "reset" };

export function titleFor(id: WinKind): string {
  if (id.startsWith("project:")) {
    const p = site.projects.find((p) => p.id === id.slice(8));
    return p ? p.name : id;
  }
  const d = site.docs.find((d) => d.id === id);
  if (d) return d.title;
  return ({ projects: "Projects", resume: "Resume", terminal: "Terminal", trash: "Trash" } as Record<string, string>)[id] ?? id;
}

const OPEN_SCALE = 1.25;
export const MIN_W = 260;
export const MIN_H = 140;

const SIZES: Record<string, [number, number]> = {
  projects: [420, 340],
  about: [480, 380],
  resume: [540, 600],
  terminal: [520, 340],
  trash: [300, 160],
};

export function initial(): State {
  return { wins: [], zTop: 1, focus: null };
}

export function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "reset":
      return initial();
    case "open": {
      const z = s.zTop + 1;
      const ex = s.wins.find((w) => w.id === a.id);
      if (ex) {
        return { ...s, zTop: z, focus: a.id, wins: s.wins.map((w) => (w.id === a.id ? { ...w, z, rolled: false } : w)) };
      }
      const hasDemo = a.id.startsWith("project:") && site.projects.some((p) => p.id === a.id.slice(8) && "demo" in p);
      const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
      const vh = typeof window === "undefined" ? 800 : window.innerHeight;
      const base = a.big ? [760, 460] : hasDemo ? [620, 560] : SIZES[a.id] ?? [440, 340];
      // Windows open 25 percent larger than their base size, but never bigger than the screen.
      const [w, h] = a.at ? [a.at.w, a.at.h] : [Math.min(Math.round(base[0] * OPEN_SCALE), vw - 16), Math.min(Math.round(base[1] * OPEN_SCALE), vh - 44)];
      const n = s.wins.length;
      // Phones: windows take the screen width and stack just below the menu bar.
      if (!a.at && vw < 700) {
        const pw = vw - 16;
        const ph = Math.min(vh - 56, Math.round(base[1] * OPEN_SCALE * 1.4));
        const py = 32 + (n % 4) * 12;
        const mw: Win = { id: a.id, title: titleFor(a.id), x: 8, y: Math.min(py, Math.max(32, vh - ph - 12)), w: pw, h: ph, z, rolled: false };
        return { wins: [...s.wins, mw], zTop: z, focus: a.id };
      }
      // Keep new windows fully on screen (below the icon rows when there is room).
      const x0 = a.at ? a.at.x : 120 + (n % 6) * 28;
      const y0 = a.at ? a.at.y : 230 + (n % 6) * 24;
      const x = Math.max(8, Math.min(x0, vw - w - 8));
      const y = Math.max(32, Math.min(y0, vh - h - 12));
      const win: Win = { id: a.id, title: titleFor(a.id), x, y, w, h, z, rolled: false };
      return { wins: [...s.wins, win], zTop: z, focus: a.id };
    }
    case "close": {
      const wins = s.wins.filter((w) => w.id !== a.id);
      const top = wins.reduce<Win | null>((m, w) => (!m || w.z > m.z ? w : m), null);
      return { ...s, wins, focus: top ? top.id : null };
    }
    case "focus": {
      if (s.focus === a.id) return s;
      const z = s.zTop + 1;
      return { ...s, zTop: z, focus: a.id, wins: s.wins.map((w) => (w.id === a.id ? { ...w, z } : w)) };
    }
    case "move":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) };
    case "resize":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, w: Math.max(MIN_W, a.w), h: Math.max(MIN_H, a.h) } : w)) };
    case "roll":
      return { ...s, wins: s.wins.map((w) => (w.id === a.id ? { ...w, rolled: !w.rolled } : w)) };
  }
}
