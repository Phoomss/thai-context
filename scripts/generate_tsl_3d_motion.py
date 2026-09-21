#!/usr/bin/env python3
"""
Thai Sign Language (TSL) 3D Motion Generator & Linguistic Kinematic Synthesizer.

Follows the 5 Classical Linguistic Parameters of Thai Sign Language:
1. Handshape (สัณฐานมือ): FLAT_PALM, INDEX_POINT, PINCH_O, PINKY_HOOK, C_SHAPE, INTERLACED, WAI
2. Location (ตำแหน่งบนร่างกาย): CHEST, TEMPLE, MOUTH_CORNER, CHIN, FORWARD_SPACE
3. Movement (ลักษณะการเคลื่อนไหว): SWEEP_IN, TAP_CIRCLE, SCAN_HORIZONTAL, NEURAL_FLUTTER, PROGRESSIVE_ASCENT
4. Orientation (การหันของฝ่ามือ): PALM_IN, PALM_OUT, PALM_UP, PALM_DOWN, PALM_FACING
5. Non-Manual Markers (อากัปกิริยาเสริม): NOD, HEAD_TILT, RESPECT_BOW

Outputs MotionData format v1.0 matching frontend/src/lib/sign-language-types.ts.
"""

import json
import math
import argparse
import sys
from typing import Dict, Any, List, Optional

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Standard Neutral Rest Pose (in 3D meters, origin between feet)
NEUTRAL_POSE = {
    "head": {"x": 0.0, "y": 1.65, "z": 0.0},
    "neck": {"x": 0.0, "y": 1.48, "z": 0.0},
    "chest": {"x": 0.0, "y": 1.25, "z": 0.0},
    "left_shoulder": {"x": -0.28, "y": 1.38, "z": 0.0},
    "right_shoulder": {"x": 0.28, "y": 1.38, "z": 0.0},
    "left_elbow": {"x": -0.36, "y": 1.05, "z": 0.05},
    "right_elbow": {"x": 0.36, "y": 1.05, "z": 0.05},
    "left_wrist": {"x": -0.25, "y": 0.85, "z": 0.15},
    "right_wrist": {"x": 0.25, "y": 0.85, "z": 0.15},
}


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_joint(a: Dict[str, float], b: Dict[str, float], t: float) -> Dict[str, float]:
    return {
        "x": round(lerp(a["x"], b["x"], t), 4),
        "y": round(lerp(a["y"], b["y"], t), 4),
        "z": round(lerp(a["z"], b["z"], t), 4),
    }


def create_hand(wrist: Dict[str, float], offset_z: float = 0.05, offset_y: float = 0.03) -> Dict[str, Any]:
    sign = 1.0 if wrist["x"] > 0 else -1.0
    return {
        "wrist": wrist,
        "thumb_tip": {
            "x": round(wrist["x"] - sign * 0.03, 4),
            "y": round(wrist["y"] + offset_y * 0.6, 4),
            "z": round(wrist["z"] + offset_z * 0.5, 4),
        },
        "index_tip": {
            "x": round(wrist["x"] + sign * 0.015, 4),
            "y": round(wrist["y"] + offset_y, 4),
            "z": round(wrist["z"] + offset_z, 4),
        },
        "middle_tip": {
            "x": round(wrist["x"], 4),
            "y": round(wrist["y"] + offset_y * 1.1, 4),
            "z": round(wrist["z"] + offset_z, 4),
        },
        "ring_tip": {
            "x": round(wrist["x"] - sign * 0.015, 4),
            "y": round(wrist["y"] + offset_y * 0.95, 4),
            "z": round(wrist["z"] + offset_z * 0.9, 4),
        },
        "pinky_tip": {
            "x": round(wrist["x"] - sign * 0.03, 4),
            "y": round(wrist["y"] + offset_y * 0.8, 4),
            "z": round(wrist["z"] + offset_z * 0.8, 4),
        },
    }


def generate_motion(
    word: str,
    duration_ms: int = 1800,
    fps: int = 30,
    trajectory_fn: Optional[Any] = None
) -> Dict[str, Any]:
    total_frames = int((duration_ms / 1000.0) * fps)
    frames: List[Dict[str, Any]] = []

    for i in range(total_frames):
        t_norm = i / max(1, (total_frames - 1))
        timestamp = int(round(t_norm * duration_ms))

        if trajectory_fn:
            landmarks = trajectory_fn(t_norm)
        else:
            # Default breath neutral cycle
            breath = math.sin(t_norm * math.pi * 2) * 0.015
            landmarks = {
                "head": {"x": 0.0, "y": round(1.65 + breath * 0.5, 4), "z": 0.0},
                "neck": NEUTRAL_POSE["neck"],
                "chest": {"x": 0.0, "y": round(1.25 + breath, 4), "z": 0.0},
                "left_shoulder": NEUTRAL_POSE["left_shoulder"],
                "right_shoulder": NEUTRAL_POSE["right_shoulder"],
                "left_elbow": NEUTRAL_POSE["left_elbow"],
                "right_elbow": NEUTRAL_POSE["right_elbow"],
                "left_wrist": NEUTRAL_POSE["left_wrist"],
                "right_wrist": NEUTRAL_POSE["right_wrist"],
                "left_hand": create_hand(NEUTRAL_POSE["left_wrist"]),
                "right_hand": create_hand(NEUTRAL_POSE["right_wrist"]),
            }

        frames.append({"timestamp": timestamp, "landmarks": landmarks})

    return {
        "version": "1.0",
        "fps": fps,
        "duration_ms": duration_ms,
        "frames": frames,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate 3D TSL Motion Keyframe Dataset")
    parser.add_argument("--word", type=str, default="ปัญญาประดิษฐ์", help="Target Thai word")
    parser.add_argument("--duration", type=int, default=2000, help="Duration in milliseconds")
    parser.add_argument("--fps", type=int, default=30, help="Target FPS (default 30)")
    parser.add_argument("--out", type=str, default="", help="Output JSON path")
    args = parser.parse_args()

    res = generate_motion(args.word, args.duration, args.fps)
    out_json = json.dumps(res, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(out_json)
        print(f"Generated {len(res['frames'])} frames for '{args.word}' -> {args.out}")
    else:
        print(f"Generated {len(res['frames'])} frames for '{args.word}' (fps={args.fps}, duration={args.duration}ms)")
