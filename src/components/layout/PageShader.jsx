import { GrainGradient } from "@paper-design/shaders-react";

export default function PageShader({ v, mobile, paused }) {
  return (
    <GrainGradient
      style={{ width: "100%", height: "100%" }}
      colors={v.colors}
      colorBack="#141416"
      softness={v.softness ?? 0.85}
      intensity={v.intensity ?? 0.45}
      noise={0.35}
      shape={v.shape}
      scale={v.scale ?? 1.1}
      offsetX={v.offsetX ?? 0}
      offsetY={v.offsetY ?? 0}
      rotation={v.rotation ?? 0}
      speed={paused ? 0 : mobile ? 0.18 : 0.25}
      maxPixelCount={mobile ? 600000 : 1400000}
    />
  );
}