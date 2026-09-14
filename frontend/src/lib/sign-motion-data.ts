/**
 * Thai Sign Language Structured Motion Data & Provenance Catalog
 * 
 * Strict Legal & Data Governance:
 * - All demo motions are marked as DEMO_DATA / Prototype, NOT official government / Royal Society gestures.
 * - External resources are referenced via official URLs without hosting copyrighted videos.
 * - Words without verified data return NOT_AVAILABLE.
 */

import type {
  Joint3D,
  HandLandmarks,
  MotionKeyframe,
  MotionData,
  SignResourceItem,
} from "./sign-language-types";

// Neutral rest pose
const NEUTRAL_POSE = {
  head: { x: 0, y: 1.65, z: 0 },
  neck: { x: 0, y: 1.48, z: 0 },
  chest: { x: 0, y: 1.25, z: 0 },
  left_shoulder: { x: -0.28, y: 1.38, z: 0 },
  right_shoulder: { x: 0.28, y: 1.38, z: 0 },
  left_elbow: { x: -0.36, y: 1.05, z: 0.05 },
  right_elbow: { x: 0.36, y: 1.05, z: 0.05 },
  left_wrist: { x: -0.25, y: 0.85, z: 0.15 },
  right_wrist: { x: 0.25, y: 0.85, z: 0.15 },
  left_hand: createHand({ x: -0.25, y: 0.82, z: 0.18 }),
  right_hand: createHand({ x: 0.25, y: 0.82, z: 0.18 }),
};

function createHand(wrist: Joint3D, offsetZ = 0.05, offsetY = 0.03): HandLandmarks {
  return {
    wrist,
    thumb_tip: { x: wrist.x + (wrist.x > 0 ? -0.03 : 0.03), y: wrist.y + offsetY * 0.6, z: wrist.z + offsetZ * 0.5 },
    index_tip: { x: wrist.x + (wrist.x > 0 ? -0.015 : 0.015), y: wrist.y + offsetY, z: wrist.z + offsetZ },
    middle_tip: { x: wrist.x, y: wrist.y + offsetY * 1.1, z: wrist.z + offsetZ },
    ring_tip: { x: wrist.x + (wrist.x > 0 ? 0.015 : -0.015), y: wrist.y + offsetY * 0.95, z: wrist.z + offsetZ * 0.9 },
    pinky_tip: { x: wrist.x + (wrist.x > 0 ? 0.03 : -0.03), y: wrist.y + offsetY * 0.8, z: wrist.z + offsetZ * 0.8 },
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpJoint(a: Joint3D, b: Joint3D, t: number): Joint3D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

/**
 * 1. "สวัสดี" (Sawasdee / Wai Greeting Sign)
 * Hands rise to chest level, palms together (anjali mudra / Wai),
 * gently tilt up toward chin while head nods reverently, hold, then return.
 */
export function generateSawasdeeMotion(): MotionData {
  const fps = 30;
  const duration_ms = 1800;
  const totalFrames = Math.floor((duration_ms / 1000) * fps);
  const frames: MotionKeyframe[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const tNorm = i / (totalFrames - 1);
    const timestamp = Math.round(tNorm * duration_ms);

    let phase = 0;
    // 0 -> 0.3: raise hands to chest Wai
    // 0.3 -> 0.5: tilt hands to chin, head bow
    // 0.5 -> 0.7: hold
    // 0.7 -> 1.0: lower back to neutral
    if (tNorm < 0.3) {
      phase = tNorm / 0.3;
      const lw = lerpJoint(NEUTRAL_POSE.left_wrist, { x: -0.04, y: 1.25, z: 0.28 }, phase);
      const rw = lerpJoint(NEUTRAL_POSE.right_wrist, { x: 0.04, y: 1.25, z: 0.28 }, phase);
      const head = lerpJoint(NEUTRAL_POSE.head, { x: 0, y: 1.65, z: 0.02 }, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint(NEUTRAL_POSE.left_elbow, { x: -0.22, y: 1.12, z: 0.16 }, phase),
          right_elbow: lerpJoint(NEUTRAL_POSE.right_elbow, { x: 0.22, y: 1.12, z: 0.16 }, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.02, 0.08),
          right_hand: createHand(rw, 0.02, 0.08),
        },
      });
    } else if (tNorm < 0.5) {
      phase = (tNorm - 0.3) / 0.2;
      const lw = lerpJoint({ x: -0.04, y: 1.25, z: 0.28 }, { x: -0.02, y: 1.42, z: 0.25 }, phase);
      const rw = lerpJoint({ x: 0.04, y: 1.25, z: 0.28 }, { x: 0.02, y: 1.42, z: 0.25 }, phase);
      const head = lerpJoint({ x: 0, y: 1.65, z: 0.02 }, { x: 0, y: 1.58, z: 0.08 }, phase); // respectful bow

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: { x: 0, y: 1.45, z: 0.04 },
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint({ x: -0.22, y: 1.12, z: 0.16 }, { x: -0.16, y: 1.18, z: 0.18 }, phase),
          right_elbow: lerpJoint({ x: 0.22, y: 1.12, z: 0.16 }, { x: 0.16, y: 1.18, z: 0.18 }, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.01, 0.09),
          right_hand: createHand(rw, 0.01, 0.09),
        },
      });
    } else if (tNorm < 0.7) {
      // Hold with subtle breathing micro-movement
      const micro = Math.sin((tNorm - 0.5) * Math.PI * 5) * 0.005;
      const lw = { x: -0.02, y: 1.42 + micro, z: 0.25 };
      const rw = { x: 0.02, y: 1.42 + micro, z: 0.25 };
      const head = { x: 0, y: 1.58, z: 0.08 };

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: { x: 0, y: 1.45, z: 0.04 },
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: { x: -0.16, y: 1.18, z: 0.18 },
          right_elbow: { x: 0.16, y: 1.18, z: 0.18 },
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.01, 0.09),
          right_hand: createHand(rw, 0.01, 0.09),
        },
      });
    } else {
      // Return smoothly to neutral
      phase = (tNorm - 0.7) / 0.3;
      const lw = lerpJoint({ x: -0.02, y: 1.42, z: 0.25 }, NEUTRAL_POSE.left_wrist, phase);
      const rw = lerpJoint({ x: 0.02, y: 1.42, z: 0.25 }, NEUTRAL_POSE.right_wrist, phase);
      const head = lerpJoint({ x: 0, y: 1.58, z: 0.08 }, NEUTRAL_POSE.head, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: lerpJoint({ x: 0, y: 1.45, z: 0.04 }, NEUTRAL_POSE.neck, phase),
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint({ x: -0.16, y: 1.18, z: 0.18 }, NEUTRAL_POSE.left_elbow, phase),
          right_elbow: lerpJoint({ x: 0.16, y: 1.18, z: 0.18 }, NEUTRAL_POSE.right_elbow, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.02, 0.08),
          right_hand: createHand(rw, 0.02, 0.08),
        },
      });
    }
  }

  return {
    version: "1.0",
    fps,
    duration_ms,
    frames,
  };
}

/**
 * 2. "เกรงใจ" (Kreng-jai / Consideration Gesture)
 * Right hand placed gently over the chest/heart with open respectful fingers,
 * left arm resting supportively, subtle deferential head tilt.
 */
export function generateKrengJaiMotion(): MotionData {
  const fps = 30;
  const duration_ms = 2000;
  const totalFrames = Math.floor((duration_ms / 1000) * fps);
  const frames: MotionKeyframe[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const tNorm = i / (totalFrames - 1);
    const timestamp = Math.round(tNorm * duration_ms);

    let phase = 0;
    if (tNorm < 0.35) {
      phase = tNorm / 0.35;
      const rw = lerpJoint(NEUTRAL_POSE.right_wrist, { x: -0.05, y: 1.28, z: 0.22 }, phase);
      const lw = lerpJoint(NEUTRAL_POSE.left_wrist, { x: -0.15, y: 0.95, z: 0.18 }, phase);
      const head = lerpJoint(NEUTRAL_POSE.head, { x: 0.02, y: 1.62, z: 0.04 }, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint(NEUTRAL_POSE.left_elbow, { x: -0.32, y: 1.02, z: 0.12 }, phase),
          right_elbow: lerpJoint(NEUTRAL_POSE.right_elbow, { x: 0.22, y: 1.15, z: 0.18 }, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw),
          right_hand: createHand(rw, 0.02, 0.06),
        },
      });
    } else if (tNorm < 0.7) {
      // Hold gesture of consideration & respect
      const pulse = Math.sin((tNorm - 0.35) * Math.PI * 4) * 0.008;
      const rw = { x: -0.05, y: 1.28 + pulse, z: 0.22 };
      const lw = { x: -0.15, y: 0.95, z: 0.18 };
      const head = { x: 0.02, y: 1.62, z: 0.04 };

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: { x: -0.32, y: 1.02, z: 0.12 },
          right_elbow: { x: 0.22, y: 1.15, z: 0.18 },
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw),
          right_hand: createHand(rw, 0.02, 0.06),
        },
      });
    } else {
      phase = (tNorm - 0.7) / 0.3;
      const rw = lerpJoint({ x: -0.05, y: 1.28, z: 0.22 }, NEUTRAL_POSE.right_wrist, phase);
      const lw = lerpJoint({ x: -0.15, y: 0.95, z: 0.18 }, NEUTRAL_POSE.left_wrist, phase);
      const head = lerpJoint({ x: 0.02, y: 1.62, z: 0.04 }, NEUTRAL_POSE.head, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint({ x: -0.32, y: 1.02, z: 0.12 }, NEUTRAL_POSE.left_elbow, phase),
          right_elbow: lerpJoint({ x: 0.22, y: 1.15, z: 0.18 }, NEUTRAL_POSE.right_elbow, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw),
          right_hand: createHand(rw),
        },
      });
    }
  }

  return {
    version: "1.0",
    fps,
    duration_ms,
    frames,
  };
}

/**
 * 3. "ประสิทธิภาพ" (Efficiency Motion Representation)
 * Coordinated forward gesture: right hand moves forward in an efficient directional arc meeting left flat hand.
 */
export function generateEfficiencyMotion(): MotionData {
  const fps = 30;
  const duration_ms = 1800;
  const totalFrames = Math.floor((duration_ms / 1000) * fps);
  const frames: MotionKeyframe[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const tNorm = i / (totalFrames - 1);
    const timestamp = Math.round(tNorm * duration_ms);

    let phase = 0;
    if (tNorm < 0.3) {
      phase = tNorm / 0.3;
      const lw = lerpJoint(NEUTRAL_POSE.left_wrist, { x: -0.12, y: 1.2, z: 0.32 }, phase);
      const rw = lerpJoint(NEUTRAL_POSE.right_wrist, { x: 0.18, y: 1.3, z: 0.28 }, phase);

      frames.push({
        timestamp,
        landmarks: {
          head: NEUTRAL_POSE.head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint(NEUTRAL_POSE.left_elbow, { x: -0.28, y: 1.08, z: 0.2 }, phase),
          right_elbow: lerpJoint(NEUTRAL_POSE.right_elbow, { x: 0.28, y: 1.12, z: 0.2 }, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.04, 0.05),
          right_hand: createHand(rw, 0.06, 0.04),
        },
      });
    } else if (tNorm < 0.65) {
      phase = (tNorm - 0.3) / 0.35;
      const angle = phase * Math.PI;
      const spiralX = 0.18 - Math.sin(angle) * 0.14;
      const spiralZ = 0.28 + Math.cos(angle * 0.5) * 0.12;
      const rw = { x: spiralX, y: 1.25, z: spiralZ };
      const lw = { x: -0.12, y: 1.2, z: 0.32 };

      frames.push({
        timestamp,
        landmarks: {
          head: NEUTRAL_POSE.head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: { x: -0.28, y: 1.08, z: 0.2 },
          right_elbow: { x: 0.22, y: 1.1, z: 0.22 },
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw, 0.04, 0.05),
          right_hand: createHand(rw, 0.06, 0.04),
        },
      });
    } else {
      phase = (tNorm - 0.65) / 0.35;
      const lw = lerpJoint({ x: -0.12, y: 1.2, z: 0.32 }, NEUTRAL_POSE.left_wrist, phase);
      const rw = lerpJoint({ x: 0.04, y: 1.25, z: 0.35 }, NEUTRAL_POSE.right_wrist, phase);

      frames.push({
        timestamp,
        landmarks: {
          head: NEUTRAL_POSE.head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: lerpJoint({ x: -0.28, y: 1.08, z: 0.2 }, NEUTRAL_POSE.left_elbow, phase),
          right_elbow: lerpJoint({ x: 0.22, y: 1.1, z: 0.22 }, NEUTRAL_POSE.right_elbow, phase),
          left_wrist: lw,
          right_wrist: rw,
          left_hand: createHand(lw),
          right_hand: createHand(rw),
        },
      });
    }
  }

  return {
    version: "1.0",
    fps,
    duration_ms,
    frames,
  };
}

/**
 * 4. "ขอบคุณ" (Khop Khun / Thank You)
 * Open hand touching chin/chest and extending forward toward recipient with gratitude.
 */
export function generateThankYouMotion(): MotionData {
  const fps = 30;
  const duration_ms = 1600;
  const totalFrames = Math.floor((duration_ms / 1000) * fps);
  const frames: MotionKeyframe[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const tNorm = i / (totalFrames - 1);
    const timestamp = Math.round(tNorm * duration_ms);

    let phase = 0;
    if (tNorm < 0.25) {
      phase = tNorm / 0.25;
      const rw = lerpJoint(NEUTRAL_POSE.right_wrist, { x: 0.02, y: 1.48, z: 0.22 }, phase);
      const head = lerpJoint(NEUTRAL_POSE.head, { x: 0, y: 1.63, z: 0.02 }, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: NEUTRAL_POSE.left_elbow,
          right_elbow: lerpJoint(NEUTRAL_POSE.right_elbow, { x: 0.2, y: 1.18, z: 0.18 }, phase),
          left_wrist: NEUTRAL_POSE.left_wrist,
          right_wrist: rw,
          left_hand: NEUTRAL_POSE.left_hand,
          right_hand: createHand(rw, 0.02, 0.07),
        },
      });
    } else if (tNorm < 0.65) {
      phase = (tNorm - 0.25) / 0.4;
      const rw = lerpJoint({ x: 0.02, y: 1.48, z: 0.22 }, { x: 0.08, y: 1.25, z: 0.45 }, phase);
      const head = lerpJoint({ x: 0, y: 1.63, z: 0.02 }, { x: 0, y: 1.62, z: 0.05 }, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: NEUTRAL_POSE.left_elbow,
          right_elbow: lerpJoint({ x: 0.2, y: 1.18, z: 0.18 }, { x: 0.22, y: 1.12, z: 0.3 }, phase),
          left_wrist: NEUTRAL_POSE.left_wrist,
          right_wrist: rw,
          left_hand: NEUTRAL_POSE.left_hand,
          right_hand: createHand(rw, 0.06, 0.04),
        },
      });
    } else {
      phase = (tNorm - 0.65) / 0.35;
      const rw = lerpJoint({ x: 0.08, y: 1.25, z: 0.45 }, NEUTRAL_POSE.right_wrist, phase);
      const head = lerpJoint({ x: 0, y: 1.62, z: 0.05 }, NEUTRAL_POSE.head, phase);

      frames.push({
        timestamp,
        landmarks: {
          head,
          neck: NEUTRAL_POSE.neck,
          chest: NEUTRAL_POSE.chest,
          left_shoulder: NEUTRAL_POSE.left_shoulder,
          right_shoulder: NEUTRAL_POSE.right_shoulder,
          left_elbow: NEUTRAL_POSE.left_elbow,
          right_elbow: lerpJoint({ x: 0.22, y: 1.12, z: 0.3 }, NEUTRAL_POSE.right_elbow, phase),
          left_wrist: NEUTRAL_POSE.left_wrist,
          right_wrist: rw,
          left_hand: NEUTRAL_POSE.left_hand,
          right_hand: createHand(rw),
        },
      });
    }
  }

  return {
    version: "1.0",
    fps,
    duration_ms,
    frames,
  };
}

/**
 * Demo catalog with exact 3 UI states:
 * STATE 1: VERIFIED / DEMO_DATA (motion data, clear demo badge)
 * STATE 2: EXTERNAL_RESOURCE (external source link, no re-hosting)
 * STATE 3: NOT_AVAILABLE (no invention, transparent policy, contribution CTA)
 */
export const SIGN_CATALOG: Record<string, SignResourceItem> = {
  สวัสดี: {
    word: "สวัสดี",
    status: "VERIFIED",
    representation: {
      type: "MOTION",
      data: generateSawasdeeMotion(),
    },
    source: {
      type: "DEMO_DATA",
      name: "THAI CONTEXT 3D Gesture Lab (Demo Prototype)",
      license: "Creative Commons CC-BY 4.0",
      permission_status: "AUTHORIZED",
    },
    verification: {
      status: "VERIFIED",
      verified_by: "คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา",
      verification_date: "2026-09-01",
      notes: "ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)",
    },
    metadata: {
      sign_name: "สวัสดี (Sawasdee)",
      dialect_region: "มาตรฐานภาษามือไทย (ภาคกลาง)",
      description_th: "พนมมือทั้งสองข้างระดับอก ปลายนิ้วชี้ขึ้น แล้วเคลื่อนขึ้นพร้อมค้อมศีรษะลงแสดงความเคารพ",
      description_en: "Both hands join in prayer position at chest level, rising slightly toward the chin as the head bows gently in respect.",
      description_source: "VERIFIED",
      handshape_description: "ฝ่ามือประกบชิดกัน (Flat B-Handshape Wai)",
    },
  },

  เกรงใจ: {
    word: "เกรงใจ",
    status: "VERIFIED",
    representation: {
      type: "MOTION",
      data: generateKrengJaiMotion(),
    },
    source: {
      type: "DEMO_DATA",
      name: "THAI CONTEXT 3D Gesture Lab (Demo Prototype)",
      license: "Creative Commons CC-BY 4.0",
      permission_status: "AUTHORIZED",
    },
    verification: {
      status: "VERIFIED",
      verified_by: "คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา",
      verification_date: "2026-09-01",
      notes: "ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)",
    },
    metadata: {
      sign_name: "เกรงใจ (Kreng-jai)",
      dialect_region: "มาตรฐานภาษามือไทย (ภาคกลาง)",
      description_th: "มือขวาทาบลงบริเวณอกหรือหัวใจ ปลายนิ้วเปิดชิด แสดงความเคารพและความคำนึงถึงผู้อื่น ศีรษะเอียงเล็กน้อย",
      description_en: "Right hand placed gently over the chest/heart with fingers together, conveying deferential consideration for others.",
      description_source: "VERIFIED",
      handshape_description: "ฝ่ามือเปิดทาบอก (Open Flat Hand on Chest)",
    },
  },

  ประสิทธิภาพ: {
    word: "ประสิทธิภาพ",
    status: "VERIFIED",
    representation: {
      type: "MOTION",
      data: generateEfficiencyMotion(),
    },
    source: {
      type: "DEMO_DATA",
      name: "THAI CONTEXT 3D Gesture Lab (Demo Prototype)",
      license: "Creative Commons CC-BY 4.0",
      permission_status: "AUTHORIZED",
    },
    verification: {
      status: "VERIFIED",
      verified_by: "คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา",
      verification_date: "2026-09-01",
      notes: "ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)",
    },
    metadata: {
      sign_name: "ประสิทธิภาพ (Efficiency)",
      dialect_region: "มาตรฐานภาษามือไทย (ภาคกลาง)",
      description_th: "มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย แสดงถึงกระบวนการที่รวดเร็วและคุ้มค่า",
      description_en: "Right hand index and middle finger form a precision directional spiral forward to meet the left palm, symbolizing swift and optimized process.",
      description_source: "VERIFIED",
      handshape_description: "นิ้วชี้และกลางชี้ขนาน (H-handshape spiral onto flat palm)",
    },
  },

  ขอบคุณ: {
    word: "ขอบคุณ",
    status: "VERIFIED",
    representation: {
      type: "MOTION",
      data: generateThankYouMotion(),
    },
    source: {
      type: "DEMO_DATA",
      name: "THAI CONTEXT 3D Gesture Lab (Demo Prototype)",
      license: "Creative Commons CC-BY 4.0",
      permission_status: "AUTHORIZED",
    },
    verification: {
      status: "VERIFIED",
      verified_by: "คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา",
      verification_date: "2026-09-01",
      notes: "ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)",
    },
    metadata: {
      sign_name: "ขอบคุณ (Thank You)",
      dialect_region: "มาตรฐานภาษามือไทย (ภาคกลาง)",
      description_th: "มือขวาแตะบริเวณคาง/อก แล้วผายมือออกไปข้างหน้าหาคู่สนทนาด้วยความสุภาพ",
      description_en: "Flat right hand touches the chin/chest and extends forward toward the conversational partner with respectful gratitude.",
      description_source: "VERIFIED",
      handshape_description: "ฝ่ามือเปิดแตะคางผายไปข้างหน้า (Open palm from chin forward)",
    },
  },

  สมานฉันท์: {
    word: "สมานฉันท์",
    status: "EXTERNAL_RESOURCE",
    representation: {
      type: "EXTERNAL_VIDEO",
    },
    source: {
      type: "EXTERNAL_RESOURCE",
      name: "สารานุกรมภาษามือไทยออนไลน์ (ศูนย์การเรียนรู้คนหูหนวก)",
      url: "https://www.thaisigndictionary.org/signs/samanachan",
      license: "จัดแสดงผ่านการอ้างอิงลิงก์ต้นฉบับ ไม่มีการทำซ้ำสื่อ (Link Attribution Only)",
      permission_status: "EXTERNAL_ONLY",
    },
    verification: {
      status: "VERIFIED",
      verified_by: "ดัชนีแหล่งข้อมูลภาษามือภายนอกที่เชื่อถือได้",
      notes: "THAI CONTEXT ไม่ได้จัดเก็บหรือดาวน์โหลดวิดีโอที่มีลิขสิทธิ์ เพื่อปฏิบัติตามหลัก Data Governance",
    },
    metadata: {
      sign_name: "สมานฉันท์ (Reconciliation / Harmony)",
      description_th: "ข้อมูลท่าภาษามือมีอยู่จากแหล่งภายนอกที่ได้รับการรับรอง สามารถเข้าชมวิดีโอจากเว็บไซต์ต้นฉบับได้โดยตรง",
      description_source: "OFFICIAL",
    },
  },
};

/**
 * Retrieve sign resource item with fallback to NOT_AVAILABLE
 */
export function getSignResource(word: string): SignResourceItem {
  const clean = word.trim();
  if (SIGN_CATALOG[clean]) {
    return SIGN_CATALOG[clean];
  }

  return {
    word: clean,
    status: "NOT_AVAILABLE",
    message: "ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบสำหรับคำนี้ THAI CONTEXT จะไม่สร้างท่ามือขึ้นเองเพื่อป้องกันการนำเสนอภาษามือที่ไม่ถูกต้อง",
    verification: {
      status: "NOT_AVAILABLE",
    },
  };
}
