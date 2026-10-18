// Where each model sits on the desk. Mirrors PLACE in blender/build_desk.py,
// because the desk bake includes their shadows. Change both together.
export type Spot = { pos: [number, number, number]; rot?: [number, number, number] };

export const SPOTS: Record<string, Spot> = {
  camera: { pos: [-0.4, 0.03, 0.48], rot: [0, 0.5, 0] },
  notebook: { pos: [0.28, 0.008, 0.46], rot: [0, -0.35, 0] },
  headphones: { pos: [-0.44, 0, 0.17], rot: [0, 0.4, 0] },
  binoculars: { pos: [0.66, 0, 0.4], rot: [0, 0.5, 0] },
  note: { pos: [0.31, 0.19, -0.389] },
  note2: { pos: [0.45, 0.14, -0.389] },
  envelope: { pos: [-0.21, 0, 0.52], rot: [0, -0.3, 0] },
  walkie: { pos: [0.66, 0, -0.16], rot: [0, 0.35, 0] },
  folder: { pos: [0.5, 0, 0.26], rot: [0, -0.2, 0] },
};

/** Models that are decoration only. */
export const DECOR: Record<string, Spot> = {
  corkboard: { pos: [0.4, 0, -0.4] },
  clock: { pos: [-0.32, 0, -0.05], rot: [0, 0.25, 0] },
  plant: { pos: [0.76, 0, -0.3] },
  mug: { pos: [0.56, 0.045, 0.12] },
  pencup: { pos: [0.24, 0, -0.26] },
};
