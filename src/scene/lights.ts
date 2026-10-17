export type LightMode = "day" | "evening" | "studio";

export const LIGHT_MODES: LightMode[] = ["studio", "day", "evening"];

export const LIGHTS: Record<
  LightMode,
  {
    label: string;
    /** Page background behind the transparent canvas: centre, mid, edge. */
    voidColors: [string, string, string];
    /** Tint of the baked floor shadow. */
    shadow: string;
    hemi: [string, string, number];
    spot: number;
    /** Realtime key for the movable props. Mirrors the Blender key light. */
    fill: { pos: [number, number, number]; color: string; intensity: number };
    /** Soft studio environment for reflections on the props. */
    env: number;
    glow: boolean;
    vignette: number;
  }
> = {
  studio: {
    label: "Studio",
    voidColors: ["#d6d5da", "#bebdc4", "#9f9ea6"],
    shadow: "#1d1b24",
    hemi: ["#ffffff", "#a9a8b0", 0.55],
    spot: 0,
    fill: { pos: [1.5, 2.8, 2.4], color: "#ffffff", intensity: 1.6 },
    env: 0.9,
    glow: false,
    vignette: 0.12,
  },
  day: {
    label: "Day",
    voidColors: ["#f0e4cf", "#dac9a9", "#b8a47f"],
    shadow: "#2b2013",
    hemi: ["#fff6e8", "#a38d6c", 0.6],
    spot: 0,
    fill: { pos: [-2.6, 2.4, 1.6], color: "#ffebd0", intensity: 1.9 },
    env: 0.8,
    glow: false,
    vignette: 0.12,
  },
  evening: {
    label: "Evening",
    voidColors: ["#322a24", "#1a1511", "#0b0908"],
    shadow: "#000000",
    hemi: ["#3a2f28", "#0c0a08", 0.3],
    spot: 2.6,
    fill: { pos: [-1, 0.8, 2], color: "#ffc48a", intensity: 0.2 },
    env: 0.15,
    glow: true,
    vignette: 0.35,
  },
};
