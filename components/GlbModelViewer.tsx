"use client";

/**
 * GlbModelViewer — renders a Draco-compressed GLB file using react-three-fiber + @react-three/drei.
 * Import ONLY via next/dynamic with { ssr: false }.
 *
 * GLB is a single binary that embeds geometry + materials + textures.
 * Draco compression reduces geometry by ~90% vs OBJ.
 *
 * Optimisations:
 *  - ErrorBoundary: catches loader / WebGL failures, shows emoji fallback
 *  - IntersectionObserver: Canvas never mounts until visible in viewport
 *  - frameloop="demand": GPU only renders on pointer move / invalidate(), not 60fps idle
 *  - powerPreference="low-power": uses integrated GPU on mobile
 *  - Draco decoder is loaded from CDN (drei default) — no extra bundle weight
 */

import { Component, Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Error boundary ────────────────────────────────────────────────────────────

interface EBState { hasError: boolean }
class ModelErrorBoundary extends Component<
  { children: React.ReactNode; emoji?: string; icon?: string },
  EBState
> {
  constructor(props: { children: React.ReactNode; emoji?: string; icon?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.warn("[GlbModelViewer] render error:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {this.props.icon
            ? <img src={this.props.icon} alt="" className="w-16 h-16 object-contain opacity-50" />
            : <span className="text-5xl opacity-50">{this.props.emoji ?? "🏛️"}</span>}
          <span className="text-white/20 text-[10px] uppercase tracking-widest">Model unavailable</span>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Draco-decoded GLB mesh ────────────────────────────────────────────────────

function GlbMesh({ glbUrl }: { glbUrl: string }) {
  const { scene } = useGLTF(glbUrl);
  const { camera, invalidate } = useThree();

  // Clone so the cached scene isn't mutated between instances
  const cloned = scene.clone(true);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    cloned.position.sub(center);

    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
    camera.position.set(0, size.y * 0.15, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [cloned, camera, invalidate]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={cloned} />
    </group>
  );
}

// ── Spinning box shown while model is downloading ─────────────────────────────

function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.2;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

// ── Exported component ────────────────────────────────────────────────────────

export interface GlbModelViewerProps {
  glbUrl: string;
  /** Shown while off-screen and on error — overridden by icon when provided */
  emoji?: string;
  /** Custom artwork image (webp/png). Takes priority over emoji in fallbacks. */
  icon?: string;
  className?: string;
}

export default function GlbModelViewer({
  glbUrl,
  emoji = "🏛️",
  icon,
  className = "",
}: GlbModelViewerProps) {
  // Lazy mount — don't even create the Canvas until visible
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isMobile =
    typeof window !== "undefined" && window.devicePixelRatio <= 1.5;

  return (
    <div ref={wrapperRef} className={`w-full h-full ${className}`}>
      {!visible ? (
        <div className="w-full h-full flex items-center justify-center">
          {icon
            ? <img src={icon} alt="" className="w-16 h-16 object-contain opacity-40 animate-pulse" />
            : <span className="text-5xl opacity-30 animate-pulse">{emoji}</span>}
        </div>
      ) : (
        <ModelErrorBoundary emoji={emoji} icon={icon}>
          <Canvas
            frameloop="demand"
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: "low-power",
              precision: isMobile ? "lowp" : "mediump",
            }}
            camera={{ fov: 45, near: 0.01, far: 10000, position: [0, 0, 5] }}
            dpr={Math.min(window.devicePixelRatio, 2)}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.65} />
            <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow={false} />
            <directionalLight position={[-4, 2, -4]} intensity={0.3} />

            <Suspense fallback={<LoadingMesh />}>
              <GlbMesh glbUrl={glbUrl} />
            </Suspense>

            <OrbitControls
              autoRotate
              autoRotateSpeed={0.6}
              enableZoom={true}
              enablePan={false}
              minPolarAngle={Math.PI * 0.1}
              maxPolarAngle={Math.PI * 0.85}
            />
          </Canvas>
        </ModelErrorBoundary>
      )}
    </div>
  );
}
