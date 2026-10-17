// Tiny synthesized sound kit. Nothing loud; AudioContext starts on first gesture.
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}
export function getSoundEnabled() {
  return enabled;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, vol: number, type: OscillatorType = "square", at = 0) {
  const c = ac();
  if (!c || !enabled) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sound = {
  click() {
    blip(1400, 0.035, 0.04);
    blip(700, 0.03, 0.03, "square", 0.012);
  },
  key() {
    blip(900 + Math.random() * 500, 0.025, 0.025);
  },
  /** Original chord: Dmaj9-ish, soft triangles, slight stagger. */
  chime() {
    [146.83, 220, 293.66, 369.99, 440, 659.25].forEach((f, i) => blip(f, 1.8, 0.05, "triangle", i * 0.03));
  },
  error() {
    blip(180, 0.12, 0.05, "square");
  },
};
