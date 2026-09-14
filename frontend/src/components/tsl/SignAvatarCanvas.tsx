"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { Joint3D, MotionData, MotionKeyframe } from "@/lib/sign-language-types";

export interface SignAvatarCanvasProps {
  motionData: MotionData;
  currentTimeMs: number;
  viewMode?: "AVATAR" | "SKELETON";
  isPaused?: boolean;
}

interface InterpolatedPose {
  head: Joint3D;
  neck: Joint3D;
  chest: Joint3D;
  left_shoulder: Joint3D;
  right_shoulder: Joint3D;
  left_elbow: Joint3D;
  right_elbow: Joint3D;
  left_wrist: Joint3D;
  right_wrist: Joint3D;
  left_hand?: any;
  right_hand?: any;
}

export default function SignAvatarCanvas({
  motionData,
  currentTimeMs,
  viewMode = "AVATAR",
  isPaused = false,
}: SignAvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Interpolate pose from motion keyframes at currentTimeMs
  const getInterpolatedPose = useCallback((timeMs: number): InterpolatedPose => {
    const frames = motionData.frames;
    if (!frames || frames.length === 0) {
      return {
        head: { x: 0, y: 1.65, z: 0 },
        neck: { x: 0, y: 1.48, z: 0 },
        chest: { x: 0, y: 1.25, z: 0 },
        left_shoulder: { x: -0.28, y: 1.38, z: 0 },
        right_shoulder: { x: 0.28, y: 1.38, z: 0 },
        left_elbow: { x: -0.36, y: 1.05, z: 0.05 },
        right_elbow: { x: 0.36, y: 1.05, z: 0.05 },
        left_wrist: { x: -0.25, y: 0.85, z: 0.15 },
        right_wrist: { x: 0.25, y: 0.85, z: 0.15 },
      };
    }

    const duration = motionData.duration_ms || 1800;
    const clampedTime = Math.max(0, Math.min(timeMs, duration));

    let f0: MotionKeyframe = frames[0];
    let f1: MotionKeyframe = frames[frames.length - 1];

    for (let i = 0; i < frames.length - 1; i++) {
      if (frames[i].timestamp <= clampedTime && frames[i + 1].timestamp >= clampedTime) {
        f0 = frames[i];
        f1 = frames[i + 1];
        break;
      }
    }

    const span = f1.timestamp - f0.timestamp;
    const alpha = span > 0 ? (clampedTime - f0.timestamp) / span : 0;

    const lerp = (a: number, b: number) => a + (b - a) * alpha;
    const lerpJ = (a?: Joint3D, b?: Joint3D): Joint3D => {
      if (!a) return b || { x: 0, y: 0, z: 0 };
      if (!b) return a;
      return {
        x: lerp(a.x, b.x),
        y: lerp(a.y, b.y),
        z: lerp(a.z, b.z),
      };
    };

    return {
      head: lerpJ(f0.landmarks.head, f1.landmarks.head),
      neck: lerpJ(f0.landmarks.neck, f1.landmarks.neck),
      chest: lerpJ(f0.landmarks.chest, f1.landmarks.chest),
      left_shoulder: lerpJ(f0.landmarks.left_shoulder, f1.landmarks.left_shoulder),
      right_shoulder: lerpJ(f0.landmarks.right_shoulder, f1.landmarks.right_shoulder),
      left_elbow: lerpJ(f0.landmarks.left_elbow, f1.landmarks.left_elbow),
      right_elbow: lerpJ(f0.landmarks.right_elbow, f1.landmarks.right_elbow),
      left_wrist: lerpJ(f0.landmarks.left_wrist, f1.landmarks.left_wrist),
      right_wrist: lerpJ(f0.landmarks.right_wrist, f1.landmarks.right_wrist),
      left_hand: f0.landmarks.left_hand || f1.landmarks.left_hand,
      right_hand: f0.landmarks.right_hand || f1.landmarks.right_hand,
    };
  }, [motionData]);

  // 2D Canvas Fallback Renderer (works in headless test environments & low-end fallback)
  useEffect(() => {
    if (webglSupported) return;
    const canvas = fallbackRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext ? canvas.getContext("2d") : null;
    if (!ctx || typeof ctx.clearRect !== "function") return;

    const pose = getInterpolatedPose(currentTimeMs);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping: 3D meter space [-0.6, 0.6] x [0.6, 1.8] to 2D canvas
    const project = (j: Joint3D) => ({
      x: width / 2 + j.x * 240,
      y: height - (j.y - 0.7) * 220,
    });

    const head = project(pose.head);
    const neck = project(pose.neck);
    const chest = project(pose.chest);
    const lSh = project(pose.left_shoulder);
    const rSh = project(pose.right_shoulder);
    const lElb = project(pose.left_elbow);
    const rElb = project(pose.right_elbow);
    const lWr = project(pose.left_wrist);
    const rWr = project(pose.right_wrist);

    ctx.lineWidth = viewMode === "AVATAR" ? 14 : 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = viewMode === "AVATAR" ? "#0284c7" : "#10b981";

    const drawBone = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    // Body bones
    drawBone(neck, chest);
    drawBone(chest, lSh);
    drawBone(chest, rSh);
    drawBone(lSh, lElb);
    drawBone(rSh, rElb);
    drawBone(lElb, lWr);
    drawBone(rElb, rWr);

    // Head
    ctx.fillStyle = viewMode === "AVATAR" ? "#38bdf8" : "#34d399";
    ctx.beginPath();
    ctx.arc(head.x, head.y, viewMode === "AVATAR" ? 24 : 16, 0, Math.PI * 2);
    ctx.fill();

    // Joints / Hands
    [lWr, rWr].forEach((hand) => {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(hand.x, hand.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [currentTimeMs, motionData, viewMode, webglSupported, getInterpolatedPose]);

  // Three.js 3D WebGL Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      const gl = canvas.getContext
        ? canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")
        : null;
      if (!gl || typeof (gl as any).getShaderPrecisionFormat !== "function") {
        setWebglSupported(false);
        return;
      }
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl as WebGLRenderingContext,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    if (!renderer) {
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();

    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 340;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Position camera to frame upper body (chest, hands, head)
    camera.position.set(0, 1.35, 2.2);
    camera.lookAt(0, 1.32, 0);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // Base contact shadow plate
    const shadowGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.02, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const shadowPlate = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlate.position.set(0, 0.6, 0);
    scene.add(shadowPlate);

    // 3D Avatar Meshes
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // Materials
    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Thai Context Deep Blue
      roughness: 0.35,
      metalness: 0.15,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Stylized cyan/light blue skin tone
      roughness: 0.4,
      metalness: 0.05,
    });
    const handMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Distinct warm amber for hands & fingers
      roughness: 0.3,
      metalness: 0.1,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.2,
    });

    // Skeleton Material
    const skeletonLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981, // Emerald green for skeleton wireframe
      linewidth: 3,
    });
    const skeletonJointMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
    });

    // Helper builders
    const createSphere = (r: number, mat: THREE.Material) => {
      const geo = new THREE.SphereGeometry(r, 24, 20);
      return new THREE.Mesh(geo, mat);
    };

    const createBoneMesh = (rTop: number, rBot: number, mat: THREE.Material) => {
      const geo = new THREE.CylinderGeometry(rTop, rBot, 1, 16);
      return new THREE.Mesh(geo, mat);
    };

    // Avatar parts
    const headMesh = createSphere(0.12, skinMat);
    // Stylized visor/face indicator to clarify head orientation
    const visorGeo = new THREE.BoxGeometry(0.12, 0.04, 0.08);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.01, 0.09);
    headMesh.add(visor);

    const chestMesh = createBoneMesh(0.16, 0.12, avatarMat);
    const lUpperArm = createBoneMesh(0.045, 0.04, avatarMat);
    const rUpperArm = createBoneMesh(0.045, 0.04, avatarMat);
    const lForearm = createBoneMesh(0.038, 0.032, avatarMat);
    const rForearm = createBoneMesh(0.038, 0.032, avatarMat);

    // Hand meshes (clearly distinguishable palm + articulated fingers)
    const createHandGroup = () => {
      const group = new THREE.Group();
      // Palm
      const palmGeo = new THREE.BoxGeometry(0.07, 0.08, 0.025);
      const palm = new THREE.Mesh(palmGeo, handMat);
      group.add(palm);

      // 5 distinct finger tips
      const fingerGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.045, 8);
      const thumb = new THREE.Mesh(fingerGeo, handMat);
      thumb.position.set(-0.04, 0.01, 0.005);
      thumb.rotation.z = 0.6;
      group.add(thumb);

      const index = new THREE.Mesh(fingerGeo, handMat);
      index.position.set(-0.02, 0.055, 0);
      group.add(index);

      const middle = new THREE.Mesh(fingerGeo, handMat);
      middle.position.set(0, 0.06, 0);
      group.add(middle);

      const ring = new THREE.Mesh(fingerGeo, handMat);
      ring.position.set(0.02, 0.055, 0);
      group.add(ring);

      const pinky = new THREE.Mesh(fingerGeo, handMat);
      pinky.position.set(0.036, 0.045, 0);
      pinky.rotation.z = -0.2;
      group.add(pinky);

      return group;
    };

    const lHandGroup = createHandGroup();
    const rHandGroup = createHandGroup();

    // Shoulder & elbow joints
    const lShoulderJoint = createSphere(0.055, jointMat);
    const rShoulderJoint = createSphere(0.055, jointMat);
    const lElbowJoint = createSphere(0.045, jointMat);
    const rElbowJoint = createSphere(0.045, jointMat);

    avatarGroup.add(
      headMesh,
      chestMesh,
      lUpperArm,
      rUpperArm,
      lForearm,
      rForearm,
      lHandGroup,
      rHandGroup,
      lShoulderJoint,
      rShoulderJoint,
      lElbowJoint,
      rElbowJoint
    );

    // Skeleton Group
    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);

    // Align a cylinder between two 3D vector points
    const orientLimb = (
      mesh: THREE.Mesh,
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      midScale = 1
    ) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      mesh.scale.set(1, len, 1);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(mid);

      const up = new THREE.Vector3(0, 1, 0);
      const axis = new THREE.Vector3().crossVectors(up, dir.clone().normalize()).normalize();
      const angle = Math.acos(Math.max(-1, Math.min(1, up.dot(dir.clone().normalize()))));
      mesh.quaternion.setFromAxisAngle(axis, angle);
    };

    // Render loop
    let animId: number | null = null;
    const renderPose = () => {
      const pose = getInterpolatedPose(currentTimeMs);

      const vHead = new THREE.Vector3(pose.head.x, pose.head.y, pose.head.z);
      const vNeck = new THREE.Vector3(pose.neck.x, pose.neck.y, pose.neck.z);
      const vChest = new THREE.Vector3(pose.chest.x, pose.chest.y, pose.chest.z);
      const vLSh = new THREE.Vector3(pose.left_shoulder.x, pose.left_shoulder.y, pose.left_shoulder.z);
      const vRSh = new THREE.Vector3(pose.right_shoulder.x, pose.right_shoulder.y, pose.right_shoulder.z);
      const vLElb = new THREE.Vector3(pose.left_elbow.x, pose.left_elbow.y, pose.left_elbow.z);
      const vRElb = new THREE.Vector3(pose.right_elbow.x, pose.right_elbow.y, pose.right_elbow.z);
      const vLWr = new THREE.Vector3(pose.left_wrist.x, pose.left_wrist.y, pose.left_wrist.z);
      const vRWr = new THREE.Vector3(pose.right_wrist.x, pose.right_wrist.y, pose.right_wrist.z);

      const isSkeleton = viewMode === "SKELETON";
      avatarGroup.visible = !isSkeleton;
      skeletonGroup.visible = isSkeleton;

      if (!isSkeleton) {
        headMesh.position.copy(vHead);
        orientLimb(chestMesh, vNeck, vChest);

        lShoulderJoint.position.copy(vLSh);
        rShoulderJoint.position.copy(vRSh);
        lElbowJoint.position.copy(vLElb);
        rElbowJoint.position.copy(vRElb);

        orientLimb(lUpperArm, vLSh, vLElb);
        orientLimb(rUpperArm, vRSh, vRElb);
        orientLimb(lForearm, vLElb, vLWr);
        orientLimb(rForearm, vRElb, vRWr);

        lHandGroup.position.copy(vLWr);
        rHandGroup.position.copy(vRWr);

        // Orient hands toward action
        const lDir = new THREE.Vector3().subVectors(vLWr, vLElb).normalize();
        const rDir = new THREE.Vector3().subVectors(vRWr, vRElb).normalize();
        lHandGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lDir);
        rHandGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rDir);
      } else {
        // Rebuild skeleton segments
        while (skeletonGroup.children.length > 0) {
          skeletonGroup.remove(skeletonGroup.children[0]);
        }

        const connections = [
          [vNeck, vChest],
          [vChest, vLSh],
          [vChest, vRSh],
          [vLSh, vLElb],
          [vRSh, vRElb],
          [vLElb, vLWr],
          [vRElb, vRWr],
        ];

        connections.forEach(([p1, p2]) => {
          const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          const line = new THREE.Line(geo, skeletonLineMat);
          skeletonGroup.add(line);
        });

        // Skeleton joint spheres
        [vHead, vNeck, vChest, vLSh, vRSh, vLElb, vRElb, vLWr, vRWr].forEach((pos, idx) => {
          const sphere = createSphere(idx === 0 ? 0.08 : 0.035, skeletonJointMat);
          sphere.position.copy(pos);
          skeletonGroup.add(sphere);
        });
      }

      renderer?.render(scene, camera);
    };

    renderPose();

    // Handle container resize
    const handleResize = () => {
      if (!canvas || !renderer) return;
      const w = canvas.clientWidth || 380;
      const h = canvas.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderPose();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
      renderer?.dispose();
    };
  }, [currentTimeMs, motionData, viewMode, webglSupported, getInterpolatedPose]);

  return (
    <div
      ref={containerRef}
      className="tsl-avatar-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        height: "320px",
        margin: "0 auto",
        borderRadius: "16px",
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        border: "1px solid var(--border, #e2e8f0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={
            viewMode === "AVATAR"
              ? "แบบจำลอง 3 มิติ อวตารแสดงท่าภาษามือไทย"
              : "แบบจำลองโครงกระดูก (Skeleton) แสดงการเคลื่อนไหวภาษามือไทย"
          }
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      ) : (
        <canvas
          ref={fallbackRef}
          width={400}
          height={320}
          role="img"
          aria-label="ภาพจำลองโครงร่างท่าภาษามือไทย (2D Fallback)"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      )}

      {/* Floating View Mode Badge */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#0f172a",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: viewMode === "AVATAR" ? "#0284c7" : "#10b981",
          }}
        />
        <span>{viewMode === "AVATAR" ? "3D Avatar (อวตาร)" : "Skeleton (โครงกระดูก)"}</span>
      </div>

      {isPaused && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            background: "rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(15, 23, 42, 0.75)",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            ⏸ พักท่ามือ (Paused)
          </div>
        </div>
      )}
    </div>
  );
}
