"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { site } from "@/data/site";
import { OS } from "@/os/OS";
import { DocView } from "@/components/DocView";
import { sound, setSoundEnabled, getSoundEnabled } from "@/os/sound";
import type { Phase } from "./Scene";
import { LIGHTS, LIGHT_MODES, type LightMode } from "./lights";
import "./experience.css";

function BootLog({ fast }: { fast: boolean }) {
  const lines = site.bootLog;
  const [n, setN] = useState(fast ? lines.length : 1);
  useEffect(() => {
    if (fast) return;
    const i = setInterval(() => setN((c) => Math.min(lines.length, c + 1)), 230);
    return () => clearInterval(i);
  }, [fast, lines.length]);
  return (
    <div className="splash" role="status" aria-label={`Starting ${site.osName}`}>
      <pre>
        {lines.slice(0, n).join("\n")}
        <span className="caret">_</span>
      </pre>
    </div>
  );
}

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Low-memory devices and no-WebGL browsers get the simple view. Phones get the full desk. */
function shouldSkip3D(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2;
  let gl = false;
  try {
    gl = !!document.createElement("canvas").getContext("webgl2");
  } catch {}
  return !gl || weak;
}

export function Experience() {
  const router = useRouter();
  const force = useSearchParams().has("desk");
  const [phase, setPhase] = useState<Phase>("explore");
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [card, setCard] = useState<string | null>(null);
  const [initialOpen, setInitialOpen] = useState<string | undefined>();
  const [snd, setSnd] = useState(true);
  const [osKey, setOsKey] = useState(0);
  const [light, setLight] = useState<LightMode>("studio");
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!force && shouldSkip3D()) router.replace("/simple");
  }, [force, router]);

  const boot = useCallback((open?: string) => {
    sound.click();
    setCard(null);
    setInitialOpen(open);
    setOsKey((k) => k + 1);
    setPhase("zooming");
  }, []);

  // Free look around the room; clicking the desk pulls the camera in.
  const enterDesk = useCallback(() => {
    setPhase((p) => {
      if (p !== "explore") return p;
      sound.click();
      return "approach";
    });
  }, []);
  const leaveDesk = useCallback(() => {
    setPhase((p) => {
      if (p !== "desk") return p;
      sound.click();
      setCard(null);
      return "retreat";
    });
  }, []);
  const [lightOpen, setLightOpen] = useState(false);
  useEffect(() => {
    if (!lightOpen) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(".lightmenu")) setLightOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [lightOpen]);

  const onArrive = useCallback((stage: number) => {
    setPhase((p) => {
      if (stage === 1 && (p === "approach" || p === "leaving")) return "desk";
      if (stage === 0 && p === "retreat") return "explore";
      if (stage === 2 && p === "zooming") {
        sound.chime();
        return "booting";
      }
      return p;
    });
  }, []);

  useEffect(() => {
    if (phase !== "booting") return;
    const t = setTimeout(() => setPhase("os"), reduced ? 500 : 1700);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const stage: 0 | 1 | 2 = phase === "explore" || phase === "retreat" ? 0 : phase === "zooming" || phase === "booting" || phase === "os" ? 2 : 1;
  const voidColors = LIGHTS[light].voidColors;
  const picked = site.deskObjects.find((o) => o.id === card);
  const inlineDoc = picked?.inline ? site.docs.find((d) => d.id === picked.opens) : undefined;

  return (
    <>
      <div className="stage" data-light={light} hidden />
      <div
        className="void"
        style={{ background: `radial-gradient(ellipse at 50% 42%, ${voidColors[0]} 0%, ${voidColors[1]} 55%, ${voidColors[2]} 100%)` }}
        aria-hidden
      />
      <Scene
        phase={phase}
        light={light}
        stage={stage}
        orbit={phase === "explore"}
        instant={reduced}
        onBoot={() => boot()}
        onPick={(id) => { sound.click(); setCard(id); }}
        onArrive={onArrive}
        onEnterDesk={enterDesk}
      />

      {phase !== "booting" && phase !== "os" && (
        <aside className="hud" aria-label="About">
          <p className="hud-kicker">{site.person.handle} / {site.osName}</p>
          <h1 className="hud-name">{site.person.name}</h1>
          <p className="hud-tag">{site.person.tagline}</p>
          <p className="hud-status"><span className="hud-dot" aria-hidden />{site.person.status}</p>
          <div className="hud-row">
            <span className="hud-clock" suppressHydrationWarning>{clock || "--:--:--"}</span>
            <button
              className="hud-btn"
              aria-label={snd ? "Mute sound" : "Unmute sound"}
              aria-pressed={snd}
              onClick={() => { const n = !getSoundEnabled(); setSoundEnabled(n); setSnd(n); if (n) sound.click(); }}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden><path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />{snd ? <path d="M11 5.5c1.3 1.4 1.3 3.6 0 5M12.8 3.8c2.2 2.4 2.2 6.2 0 8.6" stroke="currentColor" fill="none" strokeWidth="1.2" /> : <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.2" />}</svg>
            </button>
          </div>
        </aside>
      )}

      {(phase === "desk" || phase === "zooming" || phase === "approach" || phase === "explore" || phase === "retreat") && <div className="grain" aria-hidden />}

      {(phase === "desk" || phase === "zooming" || phase === "approach" || phase === "explore" || phase === "retreat") && (
        <div className="vignette" style={{ ["--v" as string]: LIGHTS[light].vignette }} aria-hidden />
      )}

      {phase !== "booting" && phase !== "os" && (
        <div className="lightmenu" onKeyDown={(e) => { if (e.key === "Escape") setLightOpen(false); }}>
          <button className="lm-btn" aria-haspopup="menu" aria-expanded={lightOpen} onClick={() => { sound.click(); setLightOpen((o) => !o); }}>
            <span className="lm-k">Light</span> {LIGHTS[light].label} <span aria-hidden>{lightOpen ? "\u25B4" : "\u25BE"}</span>
          </button>
          {lightOpen && (
            <ul className="lm-list" role="menu">
              {LIGHT_MODES.map((m) => (
                <li key={m} role="none">
                  <button
                    role="menuitemradio"
                    aria-checked={light === m}
                    className="lm-item"
                    onClick={() => { sound.click(); setLight(m); setLightOpen(false); }}
                  >
                    <span className="lm-dot" style={{ background: LIGHTS[m].voidColors[1] }} aria-hidden />
                    {LIGHTS[m].label}
                    {light === m && <span className="lm-check" aria-hidden>{"\u2713"}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {phase === "explore" && <p className="cam-hint" aria-live="polite"><span className="h-mouse">Drag to look around. Scroll to zoom. Click the desk to move in.</span><span className="h-touch">Drag to look around. Pinch to zoom. Tap the desk to move in.</span></p>}

      {phase === "desk" && (
        <>
          <button className="chip hint" onClick={() => boot()}><span className="h-mouse">Click the computer to boot</span><span className="h-touch">Tap the computer to boot</span></button>
          <button className="chip back-btn" onClick={leaveDesk}>Back to room</button>
        </>
      )}

      {phase === "desk" && (
        <ul className="kb" aria-label="Desk objects">
          {site.deskObjects.map((o) => (
            <li key={o.id}>
              <button className="chip" onClick={() => { sound.click(); setCard(o.id); }}>{o.label}</button>
            </li>
          ))}
        </ul>
      )}

      {picked && phase === "desk" && (
        <div className="card" role="dialog" aria-label={picked.label}>
          <b>{picked.label}</b>
          {picked.inline && inlineDoc ? (
            <div className="card-doc"><DocView blocks={inlineDoc.blocks} /></div>
          ) : (
            <p>{picked.blurb}</p>
          )}
          <div>
            {!picked.inline && <button className="chip" onClick={() => boot(picked.opens)}>Boot and open</button>}
            <button className="chip" onClick={() => { sound.click(); setCard(null); }}>Close</button>
          </div>
        </div>
      )}

      {phase === "booting" && <BootLog fast={reduced} />}

      {phase === "os" && (
        <div className="os-wrap">
          <OS key={osKey} initialOpen={initialOpen} onShutdown={() => setPhase("leaving")} />
        </div>
      )}

      <Link href="/simple" className="chip simple-btn">Simple view</Link>
    </>
  );
}
