import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Phone, PhoneOff } from "lucide-react";

// ---- look ----
const BG = "#0f0f11"; // match your Tailwind `bg` color
const ACCENT = "#F2621B";
const BODY = "#1c1c20";
const WOOD = "#8a5a3b";

// ---- timeline (seconds) ----
const T = {
  driveEnd: 1.3, // truck arrives and brakes
  liftStart: 1.45, // boom lifts laptop off the truck bed
  placeEnd: 2.5, // laptop lands on the bench
  stowEnd: 3.0, // boom swings back
  lidStart: 2.6,
  lidEnd: 3.15,
  ring: 3.15, // "Incoming call"
  connected: 3.95,
  zoomStart: 4.2,
  end: 5.0,
};
export const INTRO_MS = T.end * 1000;

// ---- layout (world units, ground is y = 0) ----
const TRUCK_Z = -1.5;
const TRUCK_START_X = -10;
const BED_X = -0.9; // laptop spot on the truck bed (truck-local x)
const BED_TOP = 1.02;
const MAST = new THREE.Vector3(0.35, 2.05, 0); // boom pivot (truck-local)
const BENCH_Z = 1.25;
const BENCH_TOP = 0.9;
const WHEEL_R = 0.42;
const HOOK_DROP = 0.85; // cable length while carrying

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const prog = (t, a, b) => clamp01((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _d = new THREE.Vector3();

// stretch a unit-height cylinder mesh between two world points
function span(mesh, from, to) {
  _d.subVectors(to, from);
  const len = Math.max(_d.length(), 0.001);
  mesh.position.addVectors(from, to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, _d.normalize());
  mesh.scale.set(1, len, 1);
}

function Wheel({ position, wheelRef }) {
  return (
    <group position={position} ref={wheelRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.32, 28]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.34, 20]} />
        <meshStandardMaterial color="#9c9c98" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* spoke so you can see it roll */}
      <mesh>
        <boxGeometry args={[0.4, 0.06, 0.35]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
}

function Truck({ truckRef, bodyRef, wheels }) {
  const wx = [-1.55, 1.35];
  const wz = [-0.78, 0.78];
  return (
    <group ref={truckRef} position={[TRUCK_START_X, 0, TRUCK_Z]}>
      {wx.flatMap((x, i) =>
        wz.map((z, j) => (
          <Wheel key={`${i}${j}`} position={[x, WHEEL_R, z]} wheelRef={(el) => (wheels.current[i * 2 + j] = el)} />
        ))
      )}
      <group ref={bodyRef}>
        {/* chassis */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <boxGeometry args={[4.4, 0.22, 1.5]} />
          <meshStandardMaterial color={BODY} roughness={0.6} />
        </mesh>
        {/* cab */}
        <RoundedBox args={[1.35, 1.25, 1.55]} radius={0.12} position={[1.45, 1.35, 0]} castShadow>
          <meshStandardMaterial color={ACCENT} roughness={0.45} />
        </RoundedBox>
        {/* windscreen + side windows */}
        <mesh position={[2.13, 1.6, 0]}>
          <boxGeometry args={[0.02, 0.5, 1.3]} />
          <meshStandardMaterial color="#20262c" metalness={0.8} roughness={0.15} />
        </mesh>
        <mesh position={[1.55, 1.6, 0.78]}>
          <boxGeometry args={[0.7, 0.45, 0.02]} />
          <meshStandardMaterial color="#20262c" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* headlights */}
        {[-0.55, 0.55].map((z) => (
          <mesh key={z} position={[2.13, 0.95, z]}>
            <boxGeometry args={[0.03, 0.14, 0.24]} />
            <meshStandardMaterial color="#fff6e0" emissive="#ffd9a0" emissiveIntensity={2} />
          </mesh>
        ))}
        {/* flatbed */}
        <mesh position={[-0.75, 0.86, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 0.16, 1.55]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.7} />
        </mesh>
        {/* boom mast */}
        <mesh position={[MAST.x, (0.94 + MAST.y) / 2, 0]} castShadow>
          <boxGeometry args={[0.22, MAST.y - 0.94, 0.22]} />
          <meshStandardMaterial color={ACCENT} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Bench() {
  const legs = [
    [-1.4, -0.38],
    [1.4, -0.38],
    [-1.4, 0.38],
    [1.4, 0.38],
  ];
  return (
    <group position={[0, 0, BENCH_Z]}>
      <RoundedBox args={[3.3, 0.12, 1.0]} radius={0.03} position={[0, BENCH_TOP - 0.06, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD} roughness={0.75} />
      </RoundedBox>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (BENCH_TOP - 0.12) / 2, z]} castShadow>
          <boxGeometry args={[0.1, BENCH_TOP - 0.12, 0.1]} />
          <meshStandardMaterial color="#2b2b2e" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#2b2b2e" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function CallScreen({ phase, avatar }) {
  const ring = phase === 1;
  return (
    <div
      style={{
        width: 260,
        height: 166,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: "#0b0b0d",
        color: "#f4f4f2",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes li-ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.9);opacity:0}}
        @keyframes li-pulse{50%{transform:scale(1.18)}}
        @keyframes li-bar{0%,100%{height:6px}25%{height:18px}50%{height:8px}75%{height:14px}}
      `}</style>
      <div style={{ position: "relative", width: 48, height: 48 }}>
        {ring &&
          [0, 0.5].map((d) => (
            <span
              key={d}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `1px solid ${ACCENT}`,
                animation: `li-ping 1.4s ${d}s infinite`,
              }}
            />
          ))}
        <img src={avatar} alt="" style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", objectFit: "cover", background: "#222" }} />
      </div>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>Leo Zuze</p>
      <p style={{ margin: 0, fontFamily: "ui-monospace, monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9c9c98" }}>
        {ring ? "Incoming call…" : "Connected"}
      </p>
      {ring ? (
        <div style={{ display: "flex", gap: 16, marginTop: 2 }}>
          <span style={{ display: "flex", padding: 7, borderRadius: "50%", border: "1px solid #2b2b2e", color: "#9c9c98" }}>
            <PhoneOff size={13} />
          </span>
          <span style={{ display: "flex", padding: 7, borderRadius: "50%", background: ACCENT, color: "#0b0b0d", animation: "li-pulse .8s infinite" }}>
            <Phone size={13} />
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 20, marginTop: 2 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ width: 4, height: 6, borderRadius: 4, background: ACCENT, animation: `li-bar .9s ${i * 0.1}s infinite` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Laptop({ laptopRef, lidRef, glowRef, phase, avatar }) {
  const W = 1.3;
  const D = 0.9;
  return (
    <group ref={laptopRef}>
      {/* base */}
      <RoundedBox args={[W, 0.06, D]} radius={0.02} position={[0, 0.03, 0]} castShadow>
        <meshStandardMaterial color="#c9c9cc" metalness={0.7} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.061, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.86, D * 0.5]} />
        <meshStandardMaterial color="#26262a" roughness={0.8} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group ref={lidRef} position={[0, 0.06, -D / 2]}>
        <RoundedBox args={[W, 0.04, D]} radius={0.015} position={[0, 0.02, D / 2]} castShadow>
          <meshStandardMaterial color="#c9c9cc" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        {/* screen on the underside */}
        <mesh position={[0, -0.001, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.92, D * 0.88]} />
          <meshStandardMaterial ref={glowRef} color="#050506" emissive={ACCENT} emissiveIntensity={0} />
        </mesh>
        {phase > 0 && (
          <Html transform position={[0, -0.004, D / 2]} rotation={[Math.PI / 2, 0, 0]} distanceFactor={1.95} zIndexRange={[10, 0]}>
            <CallScreen phase={phase} avatar={avatar} />
          </Html>
        )}
      </group>
    </group>
  );
}

function Rig({ onDone, avatar }) {
  const t = useRef(0);
  const doneRef = useRef(false);
  const truck = useRef();
  const body = useRef();
  const wheels = useRef([]);
  const laptop = useRef();
  const lid = useRef();
  const glow = useRef();
  const boom = useRef();
  const cable = useRef();
  const hookBlock = useRef();
  const light = useRef();
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);

  useFrame(({ camera, size }, dt) => {
    t.current += Math.min(dt, 1 / 30);
    const s = t.current;

    // 1. truck drives in and brakes with a little nose dip
    const drive = easeOut(prog(s, 0, T.driveEnd));
    const tx = THREE.MathUtils.lerp(TRUCK_START_X, 0, drive);
    truck.current.position.x = tx;
    wheels.current.forEach((w) => w && (w.rotation.z = -(tx - TRUCK_START_X) / WHEEL_R));
    const since = s - T.driveEnd;
    body.current.rotation.z = since > 0 ? -0.035 * Math.exp(-since * 5) * Math.sin(since * 14) : 0;

    // 2. laptop: rides on the bed, then arcs over onto the bench
    _a.set(tx + BED_X, BED_TOP, TRUCK_Z);
    _b.set(0, BENCH_TOP, BENCH_Z);
    const lift = easeInOut(prog(s, T.liftStart, T.placeEnd));
    laptop.current.position.lerpVectors(_a, _b, lift);
    laptop.current.position.y += Math.sin(lift * Math.PI) * 1.1;
    laptop.current.rotation.y = Math.sin(lift * Math.PI) * 0.25;
    laptop.current.rotation.z = Math.sin(lift * Math.PI * 2) * 0.04;

    // 3. boom + cable follow the laptop, then swing back to rest
    const pivot = _d.set(tx + MAST.x, MAST.y, TRUCK_Z).clone();
    const carryHook = laptop.current.position.clone().add(new THREE.Vector3(0, 0.06 + HOOK_DROP, 0));
    const restHook = new THREE.Vector3(tx - 1.1, 2.2, TRUCK_Z);
    const stow = easeInOut(prog(s, T.placeEnd + 0.1, T.stowEnd));
    const hook = s < T.placeEnd + 0.1 ? carryHook : carryHook.clone().lerp(restHook, stow);
    span(boom.current, pivot, hook);
    const cableLen = s < T.placeEnd + 0.1 ? HOOK_DROP : THREE.MathUtils.lerp(HOOK_DROP, 0.25, stow);
    span(cable.current, hook.clone().sub(new THREE.Vector3(0, cableLen, 0)), hook);
    hookBlock.current.position.copy(hook).y -= cableLen;

    // 4. lid opens, screen lights up
    const open = easeOut(prog(s, T.lidStart, T.lidEnd));
    lid.current.rotation.x = -1.85 * open;
    glow.current.emissiveIntensity = 0.25 * open;
    light.current.intensity = 6 * open;

    const next = s >= T.connected ? 2 : s >= T.ring ? 1 : 0;
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
    }

    // 5. camera: slow drift, then push in to the screen
    const zoom = easeInOut(prog(s, T.zoomStart, T.end));
    const drift = Math.sin(s * 0.6) * 0.2;
    // pull the camera back on narrow / portrait screens so the whole truck fits
    const fit = Math.max(1, 1.5 / (size.width / size.height));
    camera.position.set(
      THREE.MathUtils.lerp((3.6 + drift) * fit, 0.15, zoom),
      THREE.MathUtils.lerp(2.9 * fit, 1.45, zoom),
      THREE.MathUtils.lerp(7.2 * fit, 2.6, zoom)
    );
    camera.lookAt(0, THREE.MathUtils.lerp(0.9, 1.3, zoom), THREE.MathUtils.lerp(0, BENCH_Z - 0.2, zoom));

    if (s >= T.end && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  });

  return (
    <>
      <Truck truckRef={truck} bodyRef={body} wheels={wheels} />
      <Bench />
      <Laptop laptopRef={laptop} lidRef={lid} glowRef={glow} phase={phase} avatar={avatar} />

      <mesh ref={boom} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1, 12]} />
        <meshStandardMaterial color={ACCENT} roughness={0.5} />
      </mesh>
      <mesh ref={cable}>
        <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
        <meshStandardMaterial color="#9c9c98" />
      </mesh>
      <mesh ref={hookBlock}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color="#555" metalness={0.6} />
      </mesh>

      <pointLight ref={light} position={[0, 1.6, BENCH_Z + 0.6]} color={ACCENT} intensity={0} distance={4} />
    </>
  );
}

export default function IntroScene({ onDone, onReady, avatar }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [3.6, 2.9, 7.2], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 9, 20]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#202024", 0.5]} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* ground + road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#141417" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, TRUCK_Z]} receiveShadow>
        <planeGeometry args={[60, 2.4]} />
        <meshStandardMaterial color="#1b1b1f" roughness={1} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-20 + i * 3, 0.004, TRUCK_Z - 1.05]}>
          <planeGeometry args={[1.2, 0.06]} />
          <meshBasicMaterial color="#3a3a3f" />
        </mesh>
      ))}

      <Rig onDone={onDone} avatar={avatar} />
    </Canvas>
  );
}
