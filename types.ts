import * as THREE from 'three';

export type RingState = 'CHAOS' | 'FORMED';

export interface ParticleData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  speed: number;
  phase: number;
}

export interface OrnamentData {
  id: number;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  rotation: THREE.Euler;
  type: 'ORB' | 'STAR' | 'LIGHT' | 'PHOTO' | 'TEXT';
  color: string;
  weight: number; // For physics simulation feeling
  imageUrl?: string; // For photos
  text?: string; // For text messages
}