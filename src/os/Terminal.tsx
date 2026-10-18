"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { sound } from "./sound";
import { docLines } from "@/components/DocView";

type Seg = { text: string; open?: string };
type Line = Seg[];

const FILES = [
  ...site.docs.filter((d) => d.id !== "notes").map((d) => ({ name: d.filename, open: d.id })),
  { name: "notes.txt", open: "notes" },
  { name: "resume.pdf", open: "resume" },
  ...site.projects.map((p) => ({ name: `${p.id}/`, open: `project:${p.id}` })),
];

const t = (text: string): Line => [{ text }];

function resolve(arg: string): string | null {
  const a = arg.toLowerCase().replace(/\/$/, "");
  const p = site.projects.find((p) => p.id === a || p.name.toLowerCase() === a);
  if (p) return `project:${p.id}`;
  const d = site.docs.find((d) => d.id === a || d.filename === a || d.title.toLowerCase() === a);
  if (d) return d.id;
  const map: Record<string, string> = { resume: "resume", "resume.pdf": "resume", projects: "projects", terminal: "terminal", trash: "trash" };
  return map[a] ?? null;
}

function run(input: string, onOpen: (id: string) => void, onExit: () => void): Line[] | "clear" {
  const [cmd, ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd) {
    case "":
      return [];
    case "help":
      return site.terminalCommands.map((c) => [{ text: c.usage.padEnd(14) }, { text: c.description }]);
    case "ls":
      return Array.from({ length: Math.ceil(FILES.length / 4) }, (_, r) =>
        FILES.slice(r * 4, r * 4 + 4).flatMap((f) => [{ text: f.name.padEnd(20), open: f.open }]),
      );
    case "whoami":
      return [t(`${site.person.name} (${site.person.handle})`), t(site.person.tagline), t(site.person.status)];
    case "resume":
      onOpen("resume");
      return [t("opening resume")];
    case "contact":
      return [t(site.person.email), ...site.links.map((l) => t(l.display))];
    case "now": {
      const d = site.docs.find((d) => d.id === "now");
      return d ? docLines(d.blocks).map(t) : [];
    }
    case "hire":
      return [t(site.person.status), t(site.person.email)];
    case "projects":
      return site.projects.map((p) => [{ text: p.name.padEnd(14), open: `project:${p.id}` }, { text: p.summary }]);
    case "open": {
      if (!arg) return [t("usage: open <name>")];
      const id = resolve(arg);
      if (!id) return [t(`open: ${arg}: not found. Try ls.`)];
      onOpen(id);
      return [t(`opening ${arg}`)];
    }
    case "cat": {
      if (!arg) return [t("usage: cat <file>")];
      const a = arg.toLowerCase();
      const d = site.docs.find((d) => d.filename === a || d.id === a);
      if (d) return docLines(d.blocks).map(t);
      const p = site.projects.find((p) => a === p.id || a === `${p.id}/`);
      if (p) return [t(p.why), t(p.detail), ...(p.stack.length ? [t(p.stack.join(" / "))] : [])];
      if (a === "resume.pdf") return [t("cat: resume.pdf: binary file. Try open resume.")];
      return [t(`cat: ${arg}: no such file`)];
    }
    case "clear":
      return "clear";
    case "exit":
      onExit();
      return [t("bye")];
    default:
      sound.error();
      return [t(`${cmd}: command not found. Try help.`)];
  }
}

export function Terminal({ onOpen, onExit }: { onOpen: (id: string) => void; onExit: () => void }) {
  const [lines, setLines] = useState<Line[]>([t(`${site.osName} terminal. Type help, or click anything highlighted.`)]);
  const [val, setVal] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    box.current?.scrollTo(0, box.current.scrollHeight);
  }, [lines]);

  function submit() {
    const out = run(val, onOpen, onExit);
    if (out === "clear") setLines([]);
    else setLines((l) => [...l, [{ text: `> ${val}` }], ...out]);
    setVal("");
  }

  return (
    <div className="term" ref={box} onClick={() => input.current?.focus()}>
      {lines.map((line, i) => (
        <div key={i} className={`term-line${line.length === 2 && line[0].open ? " term-row" : ""}`}>
          {line.map((s, j) =>
            s.open ? (
              <button key={j} className="term-link" onClick={(e) => { e.stopPropagation(); sound.click(); onOpen(s.open!); }}>
                {s.text}
              </button>
            ) : (
              <span key={j} style={{ whiteSpace: "pre" }}>{s.text}</span>
            ),
          )}
        </div>
      ))}
      <label className="term-prompt">
        <span aria-hidden>&gt; </span>
        <input
          ref={input}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            else if (e.key.length === 1) sound.key();
          }}
          aria-label="Terminal input"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </label>
    </div>
  );
}
