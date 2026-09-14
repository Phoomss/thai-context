import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Cinema } from "./types";

// All parts use book-local coordinates. The front hinge is exactly x=-W/2.
const W = 2.6,
  H = 3.55,
  D = 0.32;
function coverTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#eef5fb";
  c.fillRect(0, 0, 768, 1024);
  // Deterministic woven linen, with no external textures or font requests.
  for (let i = 0; i < 1024; i += 3) {
    c.strokeStyle = i % 2 ? "#e1edf6" : "#f7fbff";
    c.lineWidth = 0.55;
    c.beginPath();
    c.moveTo(0, i);
    c.lineTo(768, i);
    c.stroke();
  }
  for (let i = 0; i < 768; i += 3) {
    c.strokeStyle = "rgba(105,87,70,.055)";
    c.beginPath();
    c.moveTo(i, 0);
    c.lineTo(i, 1024);
    c.stroke();
  }
  c.fillStyle = "#245e97";
  c.fillRect(0, 0, 42, 1024);
  c.textAlign = "center";
  c.font = "76px Georgia";
  c.fillText("THAI", 405, 236);
  c.fillText("CONTEXT", 405, 321);
  c.strokeStyle = "#92b3d2";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(316, 371);
  c.lineTo(494, 371);
  c.stroke();
  c.font = '30px "Noto Sans Thai", sans-serif';
  c.fillStyle = "#344f6a";
  c.fillText("จาก “ค้นคำ”", 405, 451);
  c.fillText("สู่ “เข้าใจภาษา”", 405, 502);
  c.strokeStyle = "#7294ab";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(404, 688);
  c.quadraticCurveTo(390, 638, 435, 600);
  c.stroke();
  for (const [x, y, r] of [
    [407, 637, -0.8],
    [395, 660, 0.6],
    [422, 617, -0.6],
  ]) {
    c.save();
    c.translate(x, y);
    c.rotate(r);
    c.fillStyle = "#7294ab";
    c.beginPath();
    c.ellipse(0, 0, 10, 22, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  c.fillStyle = "#42566f";
  c.font = "20px Georgia";
  c.fillText("W O R D S", 405, 778);
  c.fillText("P E O P L E", 405, 818);
  c.fillText("C O N T E X T S", 405, 858);
  c.font = "17px Georgia";
  c.fillStyle = "#245e97";
  c.fillText("A  B R I G H T E R  T O M O R R O W", 405, 950);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export default function BookModel({
  cinema,
  reducedMotion,
}: {
  cinema: Cinema;
  reducedMotion: boolean;
}) {
  const pageMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const pivot = useRef<THREE.Group>(null);
  const texture = useMemo(() => coverTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    if (pageMaterial.current)
      pageMaterial.current.emissiveIntensity = reducedMotion ? 0 : cinema.bloom;
    if (pivot.current) pivot.current.rotation.y = -cinema.cover;
  });
  return (
    <group name="BookRoot">
      <RoundedBox
        name="BackCover"
        args={[W, H, 0.07]}
        radius={0.028}
        position={[0, 0, -D / 2 - 0.035]}
        smoothness={3}
      >
        <meshStandardMaterial color="#dae8f4" roughness={0.94} />
      </RoundedBox>
      <RoundedBox
        name="PageBlock"
        args={[W - 0.12, H - 0.12, D]}
        radius={0.025}
        smoothness={3}
      >
        <meshStandardMaterial color="#f1efe8" roughness={1} />
      </RoundedBox>
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={i} position={[0.01, 0, -0.145 + i * 0.012]}>
          <boxGeometry args={[W - 0.13, H - 0.125, 0.002]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#c8bda8" : "#ded3bc"}
            roughness={1}
          />
        </mesh>
      ))}
      <RoundedBox
        name="Spine"
        args={[0.15, H, 0.45]}
        radius={0.045}
        position={[-W / 2 + 0.025, 0, 0]}
        smoothness={4}
      >
        <meshStandardMaterial color="#235887" roughness={0.88} />
      </RoundedBox>
      <group
        name="FrontCoverPivot"
        ref={pivot}
        position={[-W / 2, 0, D / 2 + 0.04]}
      >
        <RoundedBox
          name="FrontCover"
          args={[W, H, 0.075]}
          radius={0.027}
          position={[W / 2, 0, 0]}
          smoothness={3}
        >
          <meshStandardMaterial color="#eef5fb" roughness={0.93} />
        </RoundedBox>
        <mesh position={[W / 2, 0, 0.0385]}>
          <planeGeometry args={[W - 0.035, H - 0.04]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
      </group>
      <mesh
        name="Bookmark"
        position={[-0.78, -H / 2 - 0.16, 0.015]}
        rotation={[0.04, 0, -0.045]}
      >
        <boxGeometry args={[0.17, 0.47, 0.018]} />
        <meshStandardMaterial color="#559cda" roughness={1} />
      </mesh>
      <mesh position={[0.03, 0, D / 2 + 0.003]}>
        <planeGeometry args={[W - 0.22, H - 0.24]} />
        <meshStandardMaterial
          ref={pageMaterial}
          color="#f8fcff"
          emissive="#edf7ff"
          emissiveIntensity={reducedMotion ? 0 : cinema.bloom}
        />
      </mesh>
    </group>
  );
}
