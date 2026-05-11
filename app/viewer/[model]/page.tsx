"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

const MODEL_MAP: Record<string, string> = {
  vijecnica: "/models/glb/vijecnica.glb",
  sebilj: "/models/glb/sebilj.glb",
  "multicultural-man": "/models/glb/multicultural-man.glb",
  "monument-children": "/models/glb/monument-children.glb",
  "eternal-flame": "/models/glb/eternal-flame.glb",
  "clock-tower": "/models/glb/clock-tower.glb",
};

export default function ViewerPage() {
  const params = useParams();
  const modelKey = Array.isArray(params.model) ? params.model[0] : params.model ?? "";
  const src = MODEL_MAP[modelKey] ?? MODEL_MAP["vijecnica"];

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#07040D", margin: 0, padding: 0, overflow: "hidden" }}>
      {/* @ts-expect-error — model-viewer is a custom element loaded via CDN */}
      <model-viewer
        src={src}
        auto-rotate
        camera-controls
        shadow-intensity="1.2"
        exposure="1.1"
        camera-orbit="0deg 75deg 140%"
        min-camera-orbit="auto auto 80%"
        max-camera-orbit="auto auto 200%"
        field-of-view="30deg"
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          "--poster-color": "transparent",
        } as React.CSSProperties}
      />
    </div>
  );
}
