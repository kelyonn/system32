/* eslint-disable react-hooks/immutability -- three.js objects are mutable by design */
"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { site } from "@/data/site";
import { LIGHTS, type LightMode } from "./lights";
import { SPOTS, DECOR } from "./layout";
import { asset } from "@/lib/asset";

export const ZOOM_SECONDS = 1.2;
export const APPROACH_SECONDS = 1.9;

const C = {
  bg: "#14110E",
  wall: "#231E1A",
  wood: "#4A3222",
  body: "#D8D0BF",
  lamp: "#FFC48A",
  paper: "#EFEADC",
  ink: "#1C1B19",
};

// Three camera stages: 0 wide establishing shot, 1 close on the desk, 2 filling the screen.
const WIDE = new THREE.Vector3(2.45, 1.4, 3.35);
const WIDE_LOOK = new THREE.Vector3(0, -0.34, 0.12);
const HOME = new THREE.Vector3(0, 0.46, 1.6);
const HOME_LOOK = new THREE.Vector3(0, 0.2, 0.05);
const SCREEN = new THREE.Vector3(0, 0.215, 0.152);
const SCREEN_W = 0.22;
const SCREEN_H = 0.165;

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const MODEL_URL = asset("/models/desk.glb");
useGLTF.setDecoderPath(asset("/draco/"));

const deskSkin = new THREE.MeshBasicMaterial({ toneMapped: false, fog: false });
const furnSkin = new THREE.MeshBasicMaterial({ toneMapped: false, fog: false });
const floorSkin = new THREE.MeshBasicMaterial({ toneMapped: false, fog: false, transparent: true, depthWrite: false });

/** Materials of the movable props. They all share one baked atlas per light mode. */
const propMats = new Set<THREE.MeshBasicMaterial>();
let propsTex: THREE.Texture | null = null;

function prep(t: THREE.Texture, aniso: number) {
  t.flipY = false; // glTF UV convention
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

/** Per-mode baked textures (blender/build_desk.py). Everything static is drawn unlit. */
function Skins({ light }: { light: LightMode }) {
  const gl = useThree((s) => s.gl);
  const aniso = Math.min(16, gl.capabilities.getMaxAnisotropy());
  const [desk, furn, floor, props] = useTexture([asset(`/models/desk_${light}.jpg`), asset(`/models/furniture_${light}.jpg`), asset(`/models/floor_${light}.jpg`), asset(`/models/props_${light}.jpg`)]);
  const shadow = LIGHTS[light].shadow;
  useEffect(() => {
    deskSkin.map = prep(desk, aniso);
    furnSkin.map = prep(furn, aniso);
    deskSkin.needsUpdate = furnSkin.needsUpdate = true;
  }, [desk, furn, aniso]);
  useEffect(() => {
    propsTex = prep(props, aniso);
    propMats.forEach((m) => {
      m.map = propsTex;
      m.needsUpdate = true;
    });
  }, [props, aniso]);
  useEffect(() => {
    // The floor bake is lit floor. Turn it into a soft shadow: dark where light is missing,
    // transparent elsewhere, faded out toward the edge so no square shows over the void.
    const img = floor.image as HTMLImageElement;
    const n = 1024;
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, n, n);
    const d = g.getImageData(0, 0, n, n);
    const hist = new Uint32Array(256);
    for (let i = 0; i < d.data.length; i += 4) hist[d.data[i]]++;
    let acc = 0;
    let ref = 255;
    for (let v = 255; v >= 0; v--) {
      acc += hist[v];
      if (acc > n * n * 0.04) { ref = Math.max(v, 1); break; }
    }
    const col = new THREE.Color(shadow);
    const [r, gr, b] = [col.r, col.g, col.b].map((x) => Math.round(Math.pow(x, 1 / 2.2) * 255));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = (y * n + x) * 4;
        const lum = d.data[i];
        const rad = Math.hypot(x / n - 0.5, y / n - 0.5);
        const fade = 1 - THREE.MathUtils.smoothstep(rad, 0.26, 0.42);
        d.data[i] = r; d.data[i + 1] = gr; d.data[i + 2] = b;
        d.data[i + 3] = Math.round(255 * THREE.MathUtils.clamp(1 - lum / ref, 0, 1) * 0.9 * fade);
      }
    }
    g.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    floorSkin.map = t;
    floorSkin.needsUpdate = true;
  }, [floor, shadow]);
  return null;
}

function Model({ name }: { name: string }) {
  const { nodes } = useGLTF(MODEL_URL);
  const o = nodes[name];
  useEffect(() => {
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      if (name === "Desk" || name === "Furniture" || name === "Floor") {
        m.material = name === "Desk" ? deskSkin : name === "Furniture" ? furnSkin : floorSkin;
        m.castShadow = m.receiveShadow = false;
        if (name === "Floor") m.renderOrder = -1;
      } else {
        // A movable prop: unlit, textured from the shared baked atlas. One material per mesh
        // so hover can tint each prop separately.
        const mat = new THREE.MeshBasicMaterial({ map: propsTex, toneMapped: false, fog: false, side: THREE.DoubleSide });
        propMats.add(mat);
        m.material = mat;
        m.castShadow = m.receiveShadow = false;
      }
    });
  }, [o, name]);
  return <primitive object={o} />;
}

const ORBIT_TARGET: [number, number, number] = [0, -0.34, 0.12];

/**
 * Owns the camera between stages. On stage 0 the visitor can orbit freely (OrbitControls), and the
 * rig only takes over to tween: the wide pose is wherever the orbit left the camera.
 */
function CameraRig({ stage, orbit, instant, onArrive }: { stage: 0 | 1 | 2; orbit: boolean; instant: boolean; onArrive: (stage: number) => void }) {
  const { camera, pointer, size } = useThree();
  const t = useRef<number>(stage);
  const moving = useRef(false);
  const par = useRef(new THREE.Vector2());
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const end = useMemo(() => new THREE.Vector3(), []);
  const wide = useRef(WIDE.clone());
  const home = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(...ORBIT_TARGET), []);
  // Portrait screens (phones) pull the camera back so the desk still fits across the narrow width.
  const aspectNow = size.width / size.height;
  const fitWide = Math.min(2, Math.max(1, 1.2 / aspectNow));
  const fitHome = Math.min(2.3, Math.max(1, 1.0 / aspectNow));
  const prevFit = useRef(1);
  useEffect(() => {
    const ratio = fitWide / prevFit.current;
    prevFit.current = fitWide;
    if (ratio === 1) return;
    wide.current.sub(target).multiplyScalar(ratio).add(target);
    if (t.current === 0) camera.position.copy(wide.current);
  }, [fitWide, camera, target]);
  useEffect(() => {
    moving.current = true;
  }, [stage]);

  const marked = useRef(false);
  useFrame((_, dt) => {
    if (!marked.current) {
      marked.current = true;
      performance.mark("desk-first-frame");
    }
    const target = stage;
    if (instant) t.current = target;
    else {
      const dur = t.current < 1 || (t.current === 1 && target < 1) ? APPROACH_SECONDS : ZOOM_SECONDS;
      t.current += Math.sign(target - t.current) * Math.min(Math.abs(target - t.current), dt / dur);
    }

    const cam = camera as THREE.PerspectiveCamera;
    if (t.current === 0 && target === 0) {
      // Orbit controls own the camera; remember where it is for the next tween.
      wide.current.copy(cam.position);
      if (moving.current) {
        moving.current = false;
        onArrive(0);
      }
      return;
    }

    // Distance at which the screen covers the viewport.
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const aspect = size.width / size.height;
    const d = Math.min(SCREEN_H / (2 * tan), SCREEN_W / (2 * tan * aspect));
    end.copy(SCREEN).add(new THREE.Vector3(0, 0, d));

    if (t.current <= 1) {
      const e = easeInOutCubic(t.current);
      home.set(HOME.x, HOME.y + (fitHome - 1) * 0.1, HOME.z * fitHome);
      pos.lerpVectors(wide.current, home, e);
      look.lerpVectors(WIDE_LOOK, HOME_LOOK, e);
    } else {
      const e = easeInOutCubic(t.current - 1);
      home.set(HOME.x, HOME.y + (fitHome - 1) * 0.1, HOME.z * fitHome);
      pos.lerpVectors(home, end, e);
      look.lerpVectors(HOME_LOOK, SCREEN, e);
    }

    // Idle parallax: small and slow, strongest on the close desk shot, gone on the screen.
    if (!instant) par.current.lerp(pointer, 1 - Math.pow(0.001, dt));
    const k = t.current <= 1 ? t.current : 2 - t.current;
    pos.x += par.current.x * 0.07 * k;
    pos.y += par.current.y * 0.035 * k;
    cam.position.copy(pos);
    cam.lookAt(look);

    if (moving.current && t.current === target) {
      moving.current = false;
      onArrive(target);
    }
  });
  return (
    <OrbitControls
      makeDefault
      enabled={orbit}
      target={ORBIT_TARGET}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.9}
      zoomSpeed={0.6}
      minDistance={1.9}
      maxDistance={7.5 * fitWide}
      minPolarAngle={0.2}
      maxPolarAngle={1.5}
    />
  );
}

function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    draw(g);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return { t, g, c };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function IdleScreen({ hot }: { hot: boolean }) {
  const { t, g } = useCanvasTexture(512, 384, () => {});
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const on = Math.floor(clock.elapsedTime * 2) % 2 === 0;
    const key = (on ? 1 : 0) + (hot ? 2 : 0);
    if (key === last.current) return;
    last.current = key;
    g.fillStyle = C.paper;
    g.fillRect(0, 0, 512, 384);
    g.fillStyle = C.ink;
    g.font = "bold 40px monospace";
    g.textAlign = "center";
    g.fillText("SRI KALYAN IPPILI", 256, 170);
    g.font = "26px monospace";
    g.fillText(`click to boot${on ? "_" : " "}`, 256, 225);
    g.lineWidth = 6;
    g.strokeStyle = C.ink;
    g.strokeRect(3, 3, 506, 378);
    g.fillStyle = "rgba(28,27,25,0.07)";
    for (let y = 0; y < 384; y += 4) g.fillRect(0, y, 512, 1); // faint scanlines
    t.needsUpdate = true;
  });
  const glass = useCanvasTexture(256, 192, (c) => {
    const lg = c.createLinearGradient(0, 0, 256, 192);
    lg.addColorStop(0, "rgba(255,255,255,0.32)");
    lg.addColorStop(0.38, "rgba(255,255,255,0.05)");
    lg.addColorStop(0.55, "rgba(255,255,255,0)");
    lg.addColorStop(1, "rgba(255,255,255,0.1)");
    c.fillStyle = lg;
    c.fillRect(0, 0, 256, 192);
    const rg = c.createRadialGradient(128, 96, 60, 128, 96, 170);
    rg.addColorStop(0, "rgba(0,0,0,0)");
    rg.addColorStop(1, "rgba(20,18,14,0.28)");
    c.fillStyle = rg;
    c.fillRect(0, 0, 256, 192);
    // faint fingerprints and smudges on the glass
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 18; i++) {
      c.fillStyle = `rgba(255,255,255,${0.025 + rnd() * 0.05})`;
      c.beginPath();
      c.ellipse(20 + rnd() * 216, 16 + rnd() * 160, 5 + rnd() * 12, 4 + rnd() * 9, rnd() * 3, 0, Math.PI * 2);
      c.fill();
    }
  });
  return (
    <>
      <mesh position={[0, 0.215, 0.1525]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={t} toneMapped={false} color={hot ? "#ffffff" : "#ecebe6"} />
      </mesh>
      <mesh position={[0, 0.215, 0.1531]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={glass.t} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function Badge() {
  const { t } = useCanvasTexture(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = "#6f675a";
    g.font = "bold 48px monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("K", 32, 34);
  });
  return (
    <mesh position={[0, 0.045, 0.1515]}>
      <planeGeometry args={[0.03, 0.03]} />
      <meshBasicMaterial map={t} transparent />
    </mesh>
  );
}

function Computer({ onBoot, enabled }: { onBoot: () => void; enabled: boolean }) {
  const [hot, setHot] = useState(false);
  return (
    <group
      onPointerOver={(e) => { if (!enabled) return; e.stopPropagation(); setHot(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { if (!enabled) return; setHot(false); document.body.style.cursor = ""; }}
      onClick={(e) => { if (!enabled) return; e.stopPropagation(); onBoot(); }}
    >
      <Model name="Computer" />
      <IdleScreen hot={hot} />
      <Badge />
    </group>
  );
}

function Interactive({ id, label, position, rotation, enabled, onPick, children }: { id: string; label: string; position: [number, number, number]; rotation?: [number, number, number]; enabled: boolean; onPick: (id: string) => void; children: React.ReactNode }) {
  const [hot, setHot] = useState(false);
  const g = useRef<THREE.Group>(null);
  const [tip, setTip] = useState<[number, number, number]>([0, 0.12, 0]);
  const tint = useMemo(() => new THREE.Color(), []);

  // Pin the label just above the object itself (its own bounding box), not at a fixed height.
  useEffect(() => {
    const grp = g.current;
    if (!grp) return;
    grp.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(grp);
    if (box.isEmpty()) return;
    const top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + 0.022, (box.min.z + box.max.z) / 2);
    grp.worldToLocal(top);
    setTip([top.x, top.y, top.z]);
  }, []);

  useFrame(() => {
    tint.setRGB(hot ? 1.35 : 1, hot ? 1.25 : 1, hot ? 1.1 : 1);
    g.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
      if (m && m.isMeshBasicMaterial && propMats.has(m)) m.color.lerp(tint, 0.25);
    });
  });
  return (
    <group
      ref={g}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { if (!enabled) return; e.stopPropagation(); setHot(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { if (!enabled) return; setHot(false); document.body.style.cursor = ""; }}
      onClick={(e) => { if (!enabled) return; e.stopPropagation(); onPick(id); }}
    >
      {children}
      {enabled && (
        <Html position={tip} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
          <div className={`desk-tip${hot ? " hot" : ""}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

function ClockFace() {
  const { t, g } = useCanvasTexture(288, 128, () => {});
  const last = useRef("");
  useFrame(() => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
    const key = time + date;
    if (key === last.current) return;
    last.current = key;
    g.fillStyle = "#1f2220";
    g.fillRect(0, 0, 288, 128);
    g.fillStyle = C.paper;
    g.textAlign = "center";
    g.font = "bold 62px monospace";
    g.fillText(time, 144, 66);
    g.font = "bold 26px monospace";
    g.fillText(date, 144, 106);
    t.needsUpdate = true;
  });
  return (
    <mesh position={[0, 0.034, 0.0216]}>
      <planeGeometry args={[0.092, 0.0408]} />
      <meshBasicMaterial map={t} toneMapped={false} />
    </mesh>
  );
}

function Lamp({ glow }: { glow: boolean }) {
  return (
    <group position={[-0.62, 0, -0.12]}>
      <Model name="Lamp" />
      {glow && (
        <mesh position={[0.311, 0.299, 0]}>
          <sphereGeometry args={[0.023, 16, 16]} />
          <meshBasicMaterial color={C.lamp} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function World({ phase, light, stage, orbit, onBoot, onPick, instant, onArrive, onEnterDesk }: SceneProps) {
  const live = phase === "desk";
  const L = LIGHTS[light];
  const { nodes } = useGLTF(MODEL_URL);
  return (
    <>
      <Skins light={light} />
      <Model name="Furniture" />
      <Model name="Floor" />

      {/* While exploring, clicking anything on the desk (not a drag) pulls the camera in. */}
      <group
        onPointerOver={(e) => { if (phase !== "explore") return; e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { if (phase === "explore") document.body.style.cursor = ""; }}
        onClick={(e) => { if (phase !== "explore" || e.delta > 6) return; e.stopPropagation(); document.body.style.cursor = ""; onEnterDesk(); }}
      >
      <Model name="Desk" />
      <Lamp glow={L.glow} />
      <Computer onBoot={onBoot} enabled={live} />

      {/* desk objects, data-driven from site.deskObjects */}
      {site.deskObjects.map((o) => {
        const spot = SPOTS[o.id];
        if (!spot || !nodes[o.id]) return null; // skip props the baked model does not contain yet
        return (
          <Interactive key={o.id} id={o.id} label={o.label} position={spot.pos} rotation={spot.rot} enabled={live} onPick={onPick}>
            <Model name={o.id} />
          </Interactive>
        );
      })}

      {Object.entries(DECOR).map(([id, spot]) => (
        <group key={id} position={spot.pos} rotation={spot.rot}>
          <Model name={id} />
          {id === "clock" && <ClockFace />}
        </group>
      ))}
      </group>

      <CameraRig stage={stage} orbit={orbit} instant={instant} onArrive={onArrive} />
    </>
  );
}

export type Phase = "explore" | "approach" | "desk" | "retreat" | "zooming" | "booting" | "os" | "leaving";
export type SceneProps = {
  phase: Phase;
  light: LightMode;
  stage: 0 | 1 | 2;
  /** Free orbit around the room. */
  orbit: boolean;
  instant: boolean;
  onBoot: () => void;
  onPick: (id: string) => void;
  onArrive: (stage: number) => void;
  onEnterDesk: () => void;
};

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      frameloop={props.phase === "os" ? "never" : "always"}
      dpr={[1, typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2]}
      camera={{ fov: 35, position: WIDE.toArray(), near: 0.05, far: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "fixed", inset: 0 }}
    >
      <Suspense fallback={null}>
        <World {...props} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
for (const k of ["desk", "furniture", "floor", "props"]) useTexture.preload(asset(`/models/${k}_studio.jpg`)); // the default light mode
