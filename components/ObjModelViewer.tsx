"use client";

/**
 * ObjModelViewer — renders a local OBJ+MTL model using Three.js / react-three-fiber.
 * Import this component ONLY via next/dynamic with { ssr: false }.
 *
 * Optimisations:
 *  - ErrorBoundary catches loader/WebGL failures gracefully
 *  - IntersectionObserver delays mount until the canvas is visible
 *  - frameloop="demand" — only re-renders when the model is actually rotating
 *  - `powerPreference: "low-power"` to spare mobile GPUs
 *  - antialias disabled on mobile (detected via devicePixelRatio)
 */

import { Component, Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

// ── Error boundary ────────────────────────────────────────────────────────────

interface EBState { hasError: boolean }
class ModelErrorBoundary extends Component<{ children: React.ReactNode; emoji?: string; icon?: string }, EBState> {
  constructor(props: { children: React.ReactNode; emoji?: string; icon?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.warn("[ObjModelViewer] render error:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {this.props.icon
            ? <img src={this.props.icon} alt="" className="w-14 h-14 object-contain opacity-60" />
            : <span className="text-4xl opacity-60">{this.props.emoji ?? "🏛️"}</span>}
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Inner mesh ────────────────────────────────────────────────────────────────

function ObjMesh({
  objUrl,
  mtlUrl,
  autoRotate,
}: {
  objUrl: string;
  mtlUrl: string;
  autoRotate: boolean;
}) {
  const { camera, invalidate } = useThree();

  const materials = useLoader(MTLLoader, mtlUrl, (loader) => {
    loader.setResourcePath(mtlUrl.substring(0, mtlUrl.lastIndexOf("/") + 1));
  });

  const obj = useLoader(OBJLoader, objUrl, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    obj.position.sub(center);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.25;
    camera.position.set(0, size.y * 0.15, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [obj, camera, invalidate]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={obj} />
    </group>
  );
}

// ── Loading spinner (inside Canvas) ──────────────────────────────────────────

function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.2;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#d97706" wireframe />
    </mesh>
  );
}

// ── Exported viewer ───────────────────────────────────────────────────────────

export interface ObjModelViewerProps {
  objUrl: string;
  mtlUrl: string;
  /** emoji shown while loading and on error (overridden by icon if provided) */
  emoji?: string;
  /** Custom artwork image (webp/png). Takes priority over emoji in fallbacks. */
  icon?: string;
  className?: string;
}

export default function ObjModelViewer({
  objUrl,
  mtlUrl,
  emoji = "🏛️",
  icon,
  className = "",
}: ObjModelViewerProps) {
  // Only mount the heavy Canvas once the container scrolls into view
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Detect mobile to reduce quality
  const isMobile = typeof window !== "undefined" && window.devicePixelRatio <= 1.5;

  return (
    <div ref={wrapperRef} className={`w-full h-full ${className}`}>
      {!visible ? (
        /* Lightweight placeholder while off-screen */
        <div className="w-full h-full flex items-center justify-center">
          {icon
            ? <img src={icon} alt="" className="w-14 h-14 object-contain opacity-40" />
            : <span className="text-4xl opacity-40">{emoji}</span>}
        </div>
      ) : (
        <ModelErrorBoundary emoji={emoji} icon={icon}>
          <Canvas
            frameloop="always"
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: "low-power",
              precision: isMobile ? "lowp" : "mediump",
            }}
            camera={{ fov: 45, near: 0.01, far: 10000, position: [0, 0, 5] }}
            style={{ background: "transparent" }}
            dpr={Math.min(window.devicePixelRatio, 2)}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow={false} />
            <directionalLight position={[-4, 2, -4]} intensity={0.35} />

            <Suspense fallback={<LoadingMesh />}>
              <ObjMesh objUrl={objUrl} mtlUrl={mtlUrl} autoRotate={true} />
            </Suspense>

            <OrbitControls
              autoRotate
              autoRotateSpeed={0.5}
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

