"use client";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { site } from "@/data/site";
import { initial, reducer, type Win } from "./windows";
import { Terminal } from "./Terminal";
import { AsciiWallpaper } from "./AsciiWallpaper";
import { DocView } from "@/components/DocView";
import { asset } from "@/lib/asset";
import { sound, setSoundEnabled, getSoundEnabled } from "./sound";
import "./os.css";

type Mode = "desktop" | "terminal";

function Content({ id, open, close }: { id: string; open: (id: string) => void; close: () => void }): ReactNode {
  if (id.startsWith("project:")) {
    const p = site.projects.find((p) => p.id === id.slice(8));
    if (!p) return null;
    return (
      <div className="pad">
        <h2 className="h">{p.name}{p.status === "in-progress" && <span className="tag">in progress</span>}</h2>
        {"demo" in p && p.demo && (
          <figure className="demo">
            <video src={asset(p.demo.src)} poster={asset(p.demo.poster)} controls preload="none" playsInline />
            {p.demo.note && <figcaption>{p.demo.note}</figcaption>}
          </figure>
        )}
        <p>{p.why}</p>
        <p>{p.detail}</p>
        {p.context && <p className="dim">{p.context}</p>}
        {p.stack.length > 0 && <p className="dim">{p.stack.join(" / ")}</p>}
        {"repo" in p && p.repo && (
          <p><a href={p.repo} target="_blank" rel="noopener">View on GitHub</a></p>
        )}
      </div>
    );
  }
  const d = site.docs.find((d) => d.id === id);
  if (d) return <div className="pad"><DocView blocks={d.blocks} /></div>;
  switch (id) {
    case "projects": {
      const feat = site.projects.filter((p) => "featured" in p && p.featured);
      const more = site.projects.filter((p) => !("featured" in p && p.featured));
      const row = (p: (typeof site.projects)[number]) => (
        <li key={p.id}>
          <button className="row" onClick={() => { sound.click(); open(`project:${p.id}`); }}>
            <b>{p.name}</b>
            <span>{p.summary}</span>
          </button>
        </li>
      );
      return (
        <ul className="list">
          {feat.map(row)}
          <li className="sep">More</li>
          {more.map(row)}
        </ul>
      );
    }
    case "resume":
      return (
        <div className="pad">
          <object className="pdf-embed" data={`${asset("/resume.pdf")}#view=FitH&toolbar=0`} type="application/pdf" aria-label="Resume, PDF">
            <p>This browser can not show the PDF inline.</p>
          </object>
          <p>
            <a href={asset("/resume.pdf")} download="srikalyanippili_resume.pdf" onClick={() => sound.click()}>Download PDF</a>
            {" / "}
            {site.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" onClick={() => sound.click()}>{l.label}</a>
            )).reduce<ReactNode[]>((a, e, i) => (i ? [...a, " / ", e] : [e]), [])}
          </p>
        </div>
      );
    case "terminal":
      return <Terminal onOpen={open} onExit={close} />;
    case "trash":
      return <div className="pad"><p>{site.trashJoke}</p></div>;
  }
  return null;
}

function Window({ w, focused, d, open }: { w: Win; focused: boolean; d: React.Dispatch<import("./windows").Action>; open: (id: string) => void }) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const size = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const close = () => { sound.click(); d({ t: "close", id: w.id }); };
  return (
    <section
      className={`win${focused ? " focused" : ""}`}
      style={{ left: w.x, top: w.y, width: w.w, height: w.rolled ? undefined : w.h, zIndex: w.z }}
      onPointerDown={() => d({ t: "focus", id: w.id })}
      aria-label={w.title}
    >
      <header
        className="title"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          d({ t: "move", id: w.id, x: Math.max(0, e.clientX - drag.current.dx), y: Math.max(22, e.clientY - drag.current.dy) });
        }}
        onPointerUp={() => (drag.current = null)}
        onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest("button")) d({ t: "roll", id: w.id }); }}
      >
        <button className="close" aria-label={`Close ${w.title}`} onClick={close} />
        <span className="stripes" aria-hidden />
        <span className="ttl">{w.title}</span>
        <span className="stripes" aria-hidden />
      </header>
      {!w.rolled && <div className="body">{<Content id={w.id} open={open} close={close} />}</div>}
      {!w.rolled && (
        <span
          className="grip"
          role="separator"
          aria-label={`Resize ${w.title}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            d({ t: "focus", id: w.id });
            size.current = { x: e.clientX, y: e.clientY, w: w.w, h: w.h };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!size.current) return;
            const maxW = window.innerWidth - w.x - 4;
            const maxH = window.innerHeight - w.y - 4;
            d({ t: "resize", id: w.id, w: Math.min(maxW, size.current.w + e.clientX - size.current.x), h: Math.min(maxH, size.current.h + e.clientY - size.current.y) });
          }}
          onPointerUp={() => (size.current = null)}
        />
      )}
    </section>
  );
}

export function OS({ onShutdown, initialMode = "desktop", initialOpen }: { onShutdown: () => void; initialMode?: Mode; initialOpen?: string }) {
  const [st, d] = useReducer(reducer, undefined, initial);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [snd, setSnd] = useState(getSoundEnabled);
  const [clock, setClock] = useState("");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const i = setInterval(tick, 15000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (initialOpen) {
      d({ t: "open", id: initialOpen });
    } else if (initialMode === "terminal") {
      d({ t: "open", id: "terminal", big: true });
    } else {
      // Pre-laid desktop: tile the boot windows in two columns, left of the icon grid.
      const W = window.innerWidth, H = window.innerHeight;
      const ids = site.bootWindows;
      if (W < 900) ids.forEach((id) => d({ t: "open", id }));
      else {
        const left = 16, top = 36, gap = 12;
        const availW = W - 190 - left, availH = H - top - 16;
        const cw = Math.floor((availW - gap) / 2), ch = Math.min(Math.floor((availH - gap) / 2), 400);
        ids.forEach((id, i) => d({ t: "open", id, at: { x: left + (i % 2) * (cw + gap), y: top + Math.floor(i / 2) * (ch + gap), w: cw, h: ch } }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (id: string) => d({ t: "open", id });
  const setView = (m: Mode) => {
    sound.click();
    setMenu(false);
    setMode(m);
    if (m === "terminal") { d({ t: "close", id: "terminal" }); d({ t: "open", id: "terminal", big: true }); }
    else d({ t: "close", id: "terminal" });
  };

  return (
    <div className="os" onKeyDown={(e) => { if (e.key === "Escape" && st.focus) d({ t: "close", id: st.focus }); }}>
      <nav className="menubar" aria-label="System menu">
        <span className="glyph" aria-hidden>K</span>
        <b>{site.osName}</b>
        <div className="menu">
          <button aria-expanded={menu} onClick={() => { sound.click(); setMenu(!menu); }}>View: {mode}</button>
          {menu && (
            <div className="drop">
              <button onClick={() => setView("desktop")}>{mode === "desktop" ? "* " : "  "}Desktop</button>
              <button onClick={() => setView("terminal")}>{mode === "terminal" ? "* " : "  "}Terminal</button>
              <Link href="/simple" onClick={() => sound.click()}>{"  "}Simple view</Link>
            </div>
          )}
        </div>
        <button className="snd-btn" onClick={() => { const n = !snd; setSoundEnabled(n); setSnd(n); if (n) sound.click(); }}>
          Sound: {snd ? "on" : "off"}
        </button>
        <span className="spacer" />
        <span aria-label="Time">{clock}</span>
        <button onClick={() => { sound.click(); onShutdown(); }}>Shut down</button>
      </nav>

      <AsciiWallpaper />

      <ul className="icons" aria-label="Desktop">
        {site.desktopIcons.map((ic) => (
          <li key={ic.id}>
            <button onClick={() => { sound.click(); open(ic.id); }}>
              <span className={`ico ico-${ic.id}`} aria-hidden />
              <span className="lbl">{ic.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {st.wins.map((w) => (
        <Window key={w.id} w={w} focused={st.focus === w.id} d={d} open={open} />
      ))}
    </div>
  );
}
