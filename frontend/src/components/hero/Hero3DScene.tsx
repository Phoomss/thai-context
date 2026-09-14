"use client";
import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import BookModel from "./BookModel";
import type { Cinema, HeroState } from "./types";
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Scene({
  cinema,
  reducedMotion,
  onReady,
}: {
  cinema: Cinema;
  reducedMotion: boolean;
  onReady: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const { camera, size } = useThree();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    // CSS uses viewport width; canvas width excludes the reserved scrollbar gutter.
    const media = matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const phase = useRef(0);
  const target = useMemoVector();
  const pointer = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const hero = document.getElementById("hero");
    const media = matchMedia("(min-width: 1024px) and (pointer: fine)");
    pointer.current = { x: 0, y: 0 };
    const move = (event: PointerEvent) => {
      if (reducedMotion || !media.matches) return;
      const rect = hero!.getBoundingClientRect();
      pointer.current = { x: ((event.clientX - rect.left) / rect.width - .5) * 2, y: ((event.clientY - rect.top) / rect.height - .5) * 2 };
    };
    const reset = () => { pointer.current = { x: 0, y: 0 }; };
    media.addEventListener("change", reset);
    hero?.addEventListener("pointermove", move);
    hero?.addEventListener("pointerleave", reset);
    return () => { media.removeEventListener("change", reset); hero?.removeEventListener("pointermove", move); hero?.removeEventListener("pointerleave", reset); };
  }, [reducedMotion]);
  useEffect(() => {
    onReady();
  }, [onReady]);
  useFrame((_, delta) => {
    const distance = mobile ? 10.6 : 8.4;
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const worldHeight = 2 * Math.tan(fov / 2) * distance;
    const compact = size.width < 1024;
    const x = mobile ? 0 : worldHeight * (size.width / size.height) * (compact ? 0.27 : 0.245);
    // Keep decorative artwork inside the reserved top 340px as mobile copy grows.
    const y = mobile ? worldHeight * (0.5 - 195 / size.height) : 0.08;
    if (!document.hidden && !reducedMotion)
      phase.current += Math.min(delta, 0.05);
    const wave = (phase.current * Math.PI * 2) / 7;
    const interpolation = 1 - Math.exp(-Math.min(delta, .05) * 6);
    smoothed.current.x += ((reducedMotion ? 0 : pointer.current.x) - smoothed.current.x) * interpolation;
    smoothed.current.y += ((reducedMotion ? 0 : pointer.current.y) - smoothed.current.y) * interpolation;
    if (root.current) {
      root.current.position.set(
        x + smoothed.current.x * (worldHeight / size.height) * 4 * cinema.ambient,
        y + (Math.sin(wave) * 5 - smoothed.current.y * 3) * (worldHeight / size.height) * cinema.ambient,
        0,
      );
      root.current.rotation.set(
        0.12 + Math.sin(wave) * 0.013 * cinema.ambient,
        -0.25 + Math.sin(wave + 0.5) * 0.018 * cinema.ambient,
        -0.11,
      );
      const bookScale = mobile ? worldHeight * 210 / size.height / 3.55 : Math.min(0.78, worldHeight * (size.width / size.height) * (compact ? 0.22 : 0.3) / 2.6);
      root.current.scale.setScalar(bookScale * cinema.scale);
    }
    // Dolly and gaze converge together on the exposed page block.
    camera.position.set(
      x * cinema.dolly,
      y * cinema.dolly,
      distance + (1.15 - distance) * cinema.dolly,
    );
    target.set(x * cinema.dolly, y * cinema.dolly, 0);
    camera.lookAt(target);
    if (light.current) light.current.intensity = 3.2 * cinema.light;
    if (ambient.current) ambient.current.intensity = 1.5 * cinema.light;
  });
  return (
    <>
      <ambientLight ref={ambient} intensity={1.5} />
      <directionalLight
        ref={light}
        position={[-3, 5, 7]}
        color="#f5faff"
        intensity={3.2}
      />
      <directionalLight position={[5, 1, 2]} intensity={0.8} />
      <group ref={root}>
        <BookModel cinema={cinema} reducedMotion={reducedMotion} />
      </group>
    </>
  );
}
function useMemoVector() {
  const r = useRef(new THREE.Vector3());
  return r.current;
}
export default function Hero3DScene({
  active = true,
  cinema,
  state,
  reducedMotion,
  onReady,
  onFail,
}: {
  active?: boolean;
  cinema: Cinema;
  state: HeroState;
  reducedMotion: boolean;
  onReady: () => void;
  onFail: () => void;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <SceneBoundary onFail={onFail}>
      <Canvas
        aria-hidden="true"
        camera={{ position: [0, 0, 8.4], fov: 35, near: 0.05, far: 40 }}
        dpr={[1, 1.5]}
        frameloop={
          !active || !visible || state === "completed"
            ? "never"
            : reducedMotion && state === "idle"
              ? "demand"
              : "always"
        }
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", onFail, {
            once: true,
          });
        }}
        fallback={null}
      >
        <Suspense fallback={null}>
          <Scene
            cinema={cinema}
            reducedMotion={reducedMotion}
            onReady={onReady}
          />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
