/**
 * Thai Sign Language (TSL) Structured Motion & Accessibility Layer Types
 * Follows strict legal provenance and structured motion representation principles.
 */

export type SignVerificationStatus =
  | "VERIFIED"
  | "PENDING_REVIEW"
  | "REJECTED"
  | "NOT_AVAILABLE";

export type SignSourceType =
  | "AUTHORIZED_DATASET"
  | "AUTHORIZED_PROVIDER"
  | "USER_SUBMISSION"
  | "EXTERNAL_RESOURCE"
  | "DEMO_DATA";

export type SignPermissionStatus =
  | "AUTHORIZED"
  | "EXTERNAL_ONLY"
  | "PENDING"
  | "UNKNOWN";

export type SignRepresentationType =
  | "MOTION"
  | "SKELETON"
  | "AVATAR"
  | "EXTERNAL_VIDEO"
  | "EXTERNAL_IMAGE"
  | "NOT_AVAILABLE";

export interface Joint3D {
  x: number;
  y: number;
  z: number;
}

export interface HandLandmarks {
  wrist: Joint3D;
  thumb_tip: Joint3D;
  index_tip: Joint3D;
  middle_tip: Joint3D;
  ring_tip: Joint3D;
  pinky_tip: Joint3D;
}

export interface MotionKeyframe {
  timestamp: number; // in milliseconds
  landmarks: {
    head: Joint3D;
    neck: Joint3D;
    chest: Joint3D;
    left_shoulder: Joint3D;
    right_shoulder: Joint3D;
    left_elbow: Joint3D;
    right_elbow: Joint3D;
    left_wrist: Joint3D;
    right_wrist: Joint3D;
    left_hand?: HandLandmarks;
    right_hand?: HandLandmarks;
  };
}

export interface MotionData {
  version: "1.0";
  fps: number;
  duration_ms: number;
  frames: MotionKeyframe[];
}

export interface SignSourceInfo {
  type: SignSourceType;
  name: string;
  url?: string;
  license?: string;
  permission_status?: SignPermissionStatus;
}

export interface SignVerificationInfo {
  status: SignVerificationStatus;
  verified_by?: string;
  verification_date?: string;
  notes?: string;
}

export interface SignMetadata {
  sign_name?: string;
  dialect_region?: string;
  description_th?: string;
  description_en?: string;
  description_source?: "OFFICIAL" | "VERIFIED" | "AI_GENERATED";
  handshape_description?: string;
}

export interface SignResourceItem {
  id?: string;
  word: string;
  status: "VERIFIED" | "EXTERNAL_RESOURCE" | "NOT_AVAILABLE" | "PENDING_REVIEW";
  representation?: {
    type: SignRepresentationType;
    data?: MotionData;
  };
  source?: SignSourceInfo;
  verification?: SignVerificationInfo;
  metadata?: SignMetadata;
  message?: string;
}

export interface UserContributionSubmission {
  word: string;
  sign_name?: string;
  source_url: string;
  provider_name?: string;
  notes?: string;
  handshape_description?: string;
}
