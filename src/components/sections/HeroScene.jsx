import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import heroImg from "../../assets/images/heroimg.webp";

const ACCENT = "#F2621B";
const W = 2.4, H = 3, R = 0.14; // 4:5 to match the photo

function roundedPlate() {
  const x = -W / 2, y = -H / 2;
  const s = new THREE.Shape();
  s.moveTo(x + R, y);
  s.lineTo(x + W - R, y); s.quadraticCurveTo(x + W, y, x + W, y + R);
  s.lineTo(x + W, y + H - R); s.quadraticCurveTo(x + W, y + H, x + W - R, y + H);
  s.lineTo(x + R, y + H); s.quadraticCurveTo(x, y + H, x, y + H - R);
  s.lineTo(x, y + R); s.quadraticCurveTo(x, y, x + R, y);
  const g = new THREE.ShapeGeometry(s, 8);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W + 0.5, p.getY(i) / H + 0.5);
  return g;
}

function Photo() {
  const tex = useTexture(heroImg);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const geo = useMemo(roundedPlate, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* offset outline frame, gives real depth when the plate tilts */}
      <lineSegments geometry={edges} position={[0.18, -0.18, -0.35]} scale={1.03}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.7} />
      </lineSegments>
      <lineSegments geometry={edges} position={[0, 0, -0.7]} scale={1.1}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.25} />
      </lineSegments>
    </>
  );
}

function Orbit() {
  const g = useRef();
  useFrame((_, dt) => { g.current.rotation.z += dt * 0.25; });
  return (
    <group ref={g} rotation={[1.15, 0.2, 0]} position={[0, 0, -0.2]}>
      <mesh>
        <torusGeometry args={[2.2, 0.006, 8, 160]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.5} />
      </mesh>
      <mesh position={[2.2, 0, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <mesh position={[-2.2, 0, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#FFC542" />
      </mesh>
    </group>
  );
}

function Rig({ children }) {
  const g = useRef();
  useFrame((state, dt) => {
    const { x, y } = state.pointer; // stays 0 on touch, Float handles idle motion
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, x * 0.38, 4, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -y * 0.22, 4, dt);
  });
  return <group ref={g}>{children}</group>;
}

function Ready({ onReady }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

export default function HeroScene({ onReady, active }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.9], fov: 35 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Rig>
          <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
            <Photo />
          </Float>
          <Orbit />
        </Rig>
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}