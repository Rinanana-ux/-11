import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 600; // Increased from 300

export const GoldDust: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const { viewport, mouse } = useThree();

  const [positions, velocities, homePositions] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const home = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      home[i * 3] = x;
      home[i * 3 + 1] = y;
      home[i * 3 + 2] = z;
    }
    return [pos, vel, home];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // Map mouse to 3D space roughly at z=0 plane
    const targetX = (mouse.x * viewport.width) / 2;
    const targetY = (mouse.y * viewport.height) / 2;
    const targetZ = 5; // Pull towards camera slightly

    const positionsAttr = mesh.current.geometry.attributes.position;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Current pos
      const cx = positionsAttr.array[ix];
      const cy = positionsAttr.array[iy];
      const cz = positionsAttr.array[iz];

      // Distance to mouse
      const dx = targetX - cx;
      const dy = targetY - cy;
      const dz = targetZ - cz;
      const distSq = dx*dx + dy*dy + dz*dz;

      // Magical Attraction Force (Gravity-like but dampened)
      // Only attract if reasonably close to cursor (interaction radius)
      const force = Math.max(0, (100 - distSq) * 0.0005);
      
      if (force > 0) {
        velocities[ix] += dx * force * 0.02;
        velocities[iy] += dy * force * 0.02;
        velocities[iz] += dz * force * 0.02;
      }

      // Return to home drift
      const hx = homePositions[ix] - cx;
      const hy = homePositions[iy] - cy;
      const hz = homePositions[iz] - cz;
      
      velocities[ix] += hx * 0.002;
      velocities[iy] += hy * 0.002;
      velocities[iz] += hz * 0.002;

      // Friction
      velocities[ix] *= 0.96;
      velocities[iy] *= 0.96;
      velocities[iz] *= 0.96;

      // Apply
      positionsAttr.setXYZ(
        i,
        cx + velocities[ix],
        cy + velocities[iy],
        cz + velocities[iz]
      );
    }
    
    positionsAttr.needsUpdate = true;
    
    // Twinkle effect
    if (mesh.current.material instanceof THREE.PointsMaterial) {
        mesh.current.material.size = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FFD700"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};