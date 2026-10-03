import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#F2621B";
const GOLD = "#FFC542";
const FOV = 40;
const CAMZ = 6;
const VIS_H = 2 * CAMZ * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // world units visible top to bottom
const { clamp, damp } = THREE.MathUtils;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ribbon colours. For the video's blue, use ["#0b3d91", "#1e6bff", "#29c7ff", "#1e6bff"]
const STOPS = ["#7a1d05", ACCENT, GOLD, ACCENT].map((c) => new THREE.Color(c));
const _c = new THREE.Color();
const gradient = (t) => {
  const x = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  return _c.copy(STOPS[i]).lerp(STOPS[i + 1], x - i);
};

const UP = new THREE.Vector3(0, 1, 0);
const _d = new THREE.Vector3();
function span(mesh, a, b) {
  _d.subVectors(b, a);
  const len = Math.max(_d.length(), 0.001);
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, _d.normalize());
  mesh.scale.set(1, len, 1);
}

/* where each Home section sits on the page (re-measured as images load) */
function useSections() {
  const [m, setM] = useState(null);
  useEffect(() => {
    const measure = () => {
      const els = [...document.querySelectorAll("[data-bg-section]")];
      if (els.length < 2) return;
      const sections = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
      });
      const sig = sections.map((s) => `${Math.round(s.top / 25)}:${Math.round(s.bottom / 25)}`).join("|") + window.innerWidth;
      setM((prev) => (prev && prev.sig === sig ? prev : { sig, sections }));
    };
    measure();
    const id = setInterval(measure, 1200);
    window.addEventListener("resize", measure);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return m ? m.sections : null; // <- the only changed line (was: return m;)
}

/* the ribbon's path: crosses from side to side through every section, with some depth */
function buildCurve(sections, ppu, vwU, H) {
  const toY = (p) => -p / ppu;
  const amp = vwU * 0.3;
  const pts = [new THREE.Vector3(amp, toY(sections[0].top - 0.2 * H), 0)];
  sections.forEach((s, k) => {
    const cy = (s.top + s.bottom) / 2;
    pts.push(new THREE.Vector3((k % 2 === 0 ? 1 : -1) * amp, toY(cy), k % 2 ? -0.8 : 0));
    const next = sections[k + 1];
    if (next) pts.push(new THREE.Vector3(0, toY((cy + (next.top + next.bottom) / 2) / 2), k % 2 ? 0.5 : -0.7));
  });
  pts.push(new THREE.Vector3(-0.2 * amp, toY(sections[sections.length - 1].bottom), 0));
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

// soft glow: the same tube, pushed outward along its normals, additive and see-through
const halo = (push, opacity) => {
  const m = new THREE.MeshBasicMaterial({
    color: ACCENT, transparent: true, opacity, side: THREE.BackSide,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normal * ${push.toFixed(3)};`);
  };
  return m;
};

function Drone({ rotors }) {
  return (
    <group>
      <mesh scale={[1, 0.38, 1]}>
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshStandardMaterial color="#1d1d21" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.018, 8, 40]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <mesh position={[0, -0.02, 0.28]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz], i) => (
        <group key={i}>
          <mesh position={[sx * 0.21, 0.03, sz * 0.21]} rotation={[0, Math.atan2(sx, sz), 0]}>
            <boxGeometry args={[0.04, 0.04, 0.6]} />
            <meshStandardMaterial color="#2a2a30" metalness={0.5} roughness={0.4} />
          </mesh>
          <group position={[sx * 0.42, 0.07, sz * 0.42]}>
            <mesh>
              <cylinderGeometry args={[0.17, 0.17, 0.008, 24]} />
              <meshBasicMaterial color={GOLD} transparent opacity={0.18} />
            </mesh>
            <group ref={(el) => (rotors.current[i] = el)}>
              <mesh>
                <boxGeometry args={[0.34, 0.01, 0.03]} />
                <meshBasicMaterial color={ACCENT} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

function World({ amb }) {
  const sections = useSections();
  const size = useThree((s) => s.size);
  const world = useRef();
  const light = useRef();
  const drone = useRef();
  const rotors = useRef([]);
  const laptop = useRef();
  const lid = useRef();
  const screenMat = useRef();
  const pad = useRef();
  const cable = useRef();
  const u = useRef(0);
  const T = useRef({
    a: new THREE.Vector3(), b: new THREE.Vector3(), hover: new THREE.Vector3(),
    seat: new THREE.Vector3(), carry: new THREE.Vector3(), pos: new THREE.Vector3(), lastX: 0,
  });

  const built = useMemo(() => {
    if (!sections) return null;
    const ppu = size.height / VIS_H;
    const vwU = size.width / ppu;
    const curve = buildCurve(sections, ppu, vwU, size.height);
    const radius = clamp(vwU * 0.055, 0.14, 0.3);
    const segs = clamp(Math.round(curve.getLength() * 22), 120, 700);
    const geo = new THREE.TubeGeometry(curve, segs, radius, 24, false);
    const uv = geo.attributes.uv;
    const col = new Float32Array(uv.count * 3);
    for (let i = 0; i < uv.count; i++) {
      const t = Math.abs((uv.getX(i) * 2.2) % 2 - 1); // triangle wave: no hard seam
      gradient(t).toArray(col, i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { curve, geo, radius };
  }, [sections, size.width, size.height]);

  const halos = useMemo(
    () => (built ? [halo(built.radius * 0.7, 0.1), halo(built.radius * 1.7, 0.045)] : []),
    [built]
  );
  useEffect(() => () => built?.geo.dispose(), [built]);

  useFrame((state, dt) => {
    if (!built) return;
    const { curve, geo } = built;
    const H = state.size.height;
    const ppu = H / VIS_H;
    const vwU = state.size.width / ppu;
    const s = clamp(vwU / 3.2, 0.8, 1.1);
    const sy = window.scrollY;
    const toY = (p) => -p / ppu;
    const cam = state.camera;

    // the canvas is fixed, the world is locked to the page: the camera simply rides the scroll
    cam.position.y = toY(sy + H / 2);
    light.current.position.set(2, cam.position.y + 1.5, 3);
    world.current.position.x = amb.x.get() * 0.15;
    world.current.rotation.y = amb.x.get() * 0.06;

    // the ribbon draws itself down to just above the bottom of the screen
    const head = sy + H * 0.9;
    const startPage = sections[0].top - 0.2 * H;
    const targetY = toY(head);
    let lo = 0, hi = 1;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) / 2;
      if (curve.getPointAt(mid).y > targetY) lo = mid;
      else hi = mid;
    }
    u.current = damp(u.current, head <= startPage ? 0 : lo, 7, dt);
    geo.setDrawRange(0, Math.floor((u.current * geo.index.count) / 3) * 3);

    // the drone rides the head of the ribbon
    const t = T.current;
    const ribbon = curve.getPointAt(Math.min(u.current, 0.999));
    ribbon.z += 0.25;
    ribbon.y += 0.12 * s;

    // delivery to the landing pad in the Services section, driven by where the pad is on screen
    const padPage = sections[0].top + 0.12 * H; // tweak the 0.12 to move the pad up or down the section
    const padX = -0.28 * vwU; // tweak to move it sideways
    const padY = toY(padPage);
    const f = (padPage - sy) / H;
    const d = clamp((1 - f) / 0.7, 0, 1);
    const approach = smooth(0, 0.3, d) * (1 - smooth(0.7, 1, d));
    const lower = smooth(0.3, 0.62, d);
    const release = smooth(0.58, 0.68, d);
    const open = smooth(0.62, 0.82, d);

    t.hover.set(padX, padY + 0.95 * s, 0);
    t.pos.copy(ribbon).lerp(t.hover, approach);
    drone.current.position.copy(t.pos);
    drone.current.scale.setScalar(s);
    const vx = t.pos.x - t.lastX;
    t.lastX = t.pos.x;
    drone.current.rotation.z = damp(drone.current.rotation.z, clamp(-vx * 6, -0.4, 0.4), 6, dt);
    rotors.current.forEach((r) => r && (r.rotation.y += dt * 40));

    t.carry.copy(t.pos);
    t.carry.y -= 0.55 * s;
    t.seat.set(padX, padY + 0.05 * s, 0);
    laptop.current.position.copy(t.carry).lerp(t.seat, lower);
    laptop.current.scale.setScalar(s);
    lid.current.rotation.x = -1.9 * open;
    screenMat.current.emissiveIntensity = 1.2 * open;

    t.a.copy(t.pos);
    t.a.y -= 0.1 * s;
    t.b.copy(laptop.current.position);
    t.b.y += 0.05 * s;
    t.b.lerp(t.a, release); // the cable reels back into the drone
    span(cable.current, t.a, t.b);
    cable.current.visible = release < 0.98;

    pad.current.position.set(padX, padY, 0);
    pad.current.scale.setScalar(s);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight ref={light} color={GOLD} intensity={14} distance={14} />

      <group ref={world}>
        {built && (
          <>
            <mesh geometry={built.geo}>
              <meshPhysicalMaterial
                vertexColors roughness={0.28} metalness={0.1} clearcoat={1} clearcoatRoughness={0.15}
                emissive="#3a0f02" emissiveIntensity={0.6}
              />
            </mesh>
            {halos.map((m, i) => (
              <mesh key={i} geometry={built.geo} material={m} />
            ))}
          </>
        )}

        {/* landing pad */}
        <group ref={pad} rotation={[0.45, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55, 48]} />
            <meshStandardMaterial color="#17171a" roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <ringGeometry args={[0.55, 0.62, 48]} />
            <meshBasicMaterial color={GOLD} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* laptop */}
        <group ref={laptop} rotation={[0.45, -0.35, 0]}>
          <mesh position={[0, 0.0175, 0]}>
            <boxGeometry args={[0.7, 0.035, 0.5]} />
            <meshStandardMaterial color="#c9c9cc" metalness={0.7} roughness={0.3} />
          </mesh>
          <group ref={lid} position={[0, 0.035, -0.25]}>
            <mesh position={[0, 0.0125, 0.25]}>
              <boxGeometry args={[0.7, 0.025, 0.5]} />
              <meshStandardMaterial color="#c9c9cc" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.001, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.64, 0.44]} />
              <meshStandardMaterial ref={screenMat} color="#050506" emissive={ACCENT} emissiveIntensity={0} />
            </mesh>
          </group>
        </group>

        {/* drone + cable */}
        <group ref={drone} rotation={[0.3, 0, 0]}>
          <Drone rotors={rotors} />
        </group>
        <mesh ref={cable}>
          <cylinderGeometry args={[0.006, 0.006, 1, 6]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
      </group>
    </>
  );
}

export default function HomeScene({ amb, active }) {
  const lite = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0, CAMZ], fov: FOV }}
      gl={{ alpha: true, antialias: !lite, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <World amb={amb} />
    </Canvas>
  );
}