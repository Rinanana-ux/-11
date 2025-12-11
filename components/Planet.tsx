import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { RingState } from '../types';

interface PlanetProps {
  ringState: RingState;
}

// -- Sub-components for details --

const PuffyTree = ({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* Leaves Cluster */}
      <group position={[0, 1, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <dodecahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
        </mesh>
        <mesh position={[0.3, -0.2, 0.3]} castShadow>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial color="#40916c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.3, 0.1, -0.2]} castShadow>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#1b4332" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const Cloud = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0,0,0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="white" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0.4,0.1,0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="white" transparent opacity={0.9} />
            </mesh>
            <mesh position={[-0.35,0.05,0.1]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color="white" transparent opacity={0.9} />
            </mesh>
        </group>
    )
}

const Cottage = () => {
  return (
    <group position={[0, 2.38, 0.5]} rotation={[-0.2, 0, 0]}>
      {/* Foundation Stones */}
      <mesh position={[0, 0.1, 0]}>
         <cylinderGeometry args={[0.8, 0.9, 0.2, 8]} />
         <meshStandardMaterial color="#78716c" />
      </mesh>

      {/* Main Body - Cream Stucco */}
      <RoundedBox args={[1.2, 1.1, 1.2]} radius={0.05} smoothness={4} position={[0, 0.7, 0]} castShadow>
        <meshStandardMaterial color="#fef3c7" roughness={0.5} />
      </RoundedBox>

      {/* Roof - Dark Green Tiles */}
      <group position={[0, 1.3, 0]}>
        <mesh castShadow>
          <coneGeometry args={[1.1, 1.2, 4]} />
          <meshStandardMaterial color="#14532d" roughness={0.6} />
        </mesh>
        {/* Roof overhang detail */}
        <mesh position={[0, -0.55, 0]} rotation={[0, Math.PI/4, 0]}>
             <boxGeometry args={[1.6, 0.1, 1.6]} />
             <meshStandardMaterial color="#064e3b" />
        </mesh>
      </group>

      {/* Chimney */}
      <group position={[0.6, 0.8, 0]}>
        <mesh castShadow>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#78716c" />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
             <boxGeometry args={[0.4, 0.1, 0.4]} />
             <meshStandardMaterial color="#57534e" />
        </mesh>
        {/* Smoke Puffs (Simple spheres) */}
        <mesh position={[0.1, 0.9, 0.1]}>
             <sphereGeometry args={[0.15]} />
             <meshStandardMaterial color="#ddd" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.2, 1.3, 0.0]}>
             <sphereGeometry args={[0.2]} />
             <meshStandardMaterial color="#ddd" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Door */}
      <group position={[0, 0.5, 0.61]}>
        <mesh>
            <boxGeometry args={[0.4, 0.7, 0.05]} />
            <meshStandardMaterial color="#451a03" />
        </mesh>
        {/* Doorknob */}
        <mesh position={[0.12, 0, 0.04]}>
            <sphereGeometry args={[0.04]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Windows (Glowing) */}
      <mesh position={[0.4, 0.8, 0.61]}>
           <circleGeometry args={[0.15, 32]} />
           <meshBasicMaterial color="#fcd34d" toneMapped={false} />
      </mesh>
      <mesh position={[-0.3, 0.6, 0.61]}>
           <planeGeometry args={[0.3, 0.4]} />
           <meshBasicMaterial color="#fcd34d" toneMapped={false} />
      </mesh>
      {/* Side Window */}
      <mesh position={[0.61, 0.6, 0]} rotation={[0, Math.PI/2, 0]}>
           <circleGeometry args={[0.2, 32]} />
           <meshBasicMaterial color="#fcd34d" toneMapped={false} />
      </mesh>

    </group>
  );
};

const AlpacaCharacter = () => {
    return (
        <group position={[0.8, 2.5, 1.0]} rotation={[-0.1, -0.4, 0]} scale={0.8}>
             {/* Body */}
             <mesh castShadow>
                <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
                <meshStandardMaterial color="#fff" roughness={0.9} />
             </mesh>
             {/* Neck */}
             <mesh position={[0, 0.4, 0.1]} rotation={[0.2, 0, 0]} castShadow>
                 <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
                 <meshStandardMaterial color="#fff" roughness={0.9} />
             </mesh>
             {/* Head */}
             <group position={[0, 0.75, 0.2]} rotation={[0.2, 0, 0]}>
                 <mesh castShadow>
                    <sphereGeometry args={[0.18]} />
                    <meshStandardMaterial color="#fff" roughness={0.9} />
                 </mesh>
                 {/* Ears */}
                 <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, -0.3]}>
                     <coneGeometry args={[0.05, 0.2]} />
                     <meshStandardMaterial color="#fff" />
                 </mesh>
                 <mesh position={[-0.1, 0.15, 0]} rotation={[0, 0, 0.3]}>
                     <coneGeometry args={[0.05, 0.2]} />
                     <meshStandardMaterial color="#fff" />
                 </mesh>
                 {/* Eyes */}
                 <mesh position={[0.08, 0.05, 0.15]}>
                     <sphereGeometry args={[0.02]} />
                     <meshStandardMaterial color="black" />
                 </mesh>
                 <mesh position={[-0.08, 0.05, 0.15]}>
                     <sphereGeometry args={[0.02]} />
                     <meshStandardMaterial color="black" />
                 </mesh>
                 {/* Blush */}
                 <mesh position={[0.1, -0.05, 0.14]}>
                     <circleGeometry args={[0.03]} />
                     <meshBasicMaterial color="#fda4af" transparent opacity={0.6} />
                 </mesh>
                 <mesh position={[-0.1, -0.05, 0.14]}>
                     <circleGeometry args={[0.03]} />
                     <meshBasicMaterial color="#fda4af" transparent opacity={0.6} />
                 </mesh>
             </group>
             {/* Legs */}
             <mesh position={[0.15, -0.3, 0]}>
                 <cylinderGeometry args={[0.06, 0.06, 0.4]} />
                 <meshStandardMaterial color="#fff" />
             </mesh>
             <mesh position={[-0.15, -0.3, 0]}>
                 <cylinderGeometry args={[0.06, 0.06, 0.4]} />
                 <meshStandardMaterial color="#fff" />
             </mesh>
        </group>
    )
}

export const Planet: React.FC<PlanetProps> = ({ ringState }) => {
  const planetRef = useRef<THREE.Group>(null);
  const targetScale = useRef(1.5);
  const currentScale = useRef(1.5);
  
  useFrame((state, delta) => {
    targetScale.current = ringState === 'FORMED' ? 1.5 : 0.8;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 3);
    
    if (planetRef.current) {
        planetRef.current.scale.setScalar(currentScale.current);
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
      <group ref={planetRef}>
        
        {/* --- MAIN PLANET BODY --- */}
        
        {/* Top Hemisphere - Clean Green Surface (No Grass) */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial 
            color="#4ade80" 
            roughness={0.6} 
            metalness={0.0}
            flatShading={false}
          />
        </mesh>

        {/* Bottom Hemisphere - Rich Soil */}
        <mesh position={[0, 0, 0]} receiveShadow>
            <sphereGeometry args={[2.5, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshPhysicalMaterial 
                color="#713f12" 
                roughness={0.9}
                metalness={0.1}
            />
        </mesh>

        {/* --- SURFACE DETAILS --- */}

        {/* Stepping Stones Path */}
        <group position={[0.2, 2.45, 1.4]} rotation={[-0.5, 0.2, 0]}>
            <mesh position={[0, 0, 0]} rotation={[-0.2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.25, 0.05, 6]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
            <mesh position={[0.3, -0.1, 0.4]} rotation={[-0.4, 0.1, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.05, 6]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
            <mesh position={[0.1, -0.2, 0.9]} rotation={[-0.6, -0.1, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.05, 6]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
        </group>

        <Cottage />

        <AlpacaCharacter />

        {/* Trees */}
        <PuffyTree position={[1.8, 1.6, 0.5]} rotation={[0, 0, -0.8]} scale={1.2} />
        <PuffyTree position={[-1.8, 1.8, -0.5]} rotation={[0.2, 0, 0.8]} scale={1.1} />
        <PuffyTree position={[-0.8, 2.0, -1.5]} rotation={[-0.5, 0, 0]} scale={0.9} />
        
        {/* Floating Clouds */}
        <group rotation={[0, 0, 0]}>
             <Cloud position={[3, 2, 0]} scale={1} />
             <Cloud position={[-2.5, 1.5, 2]} scale={0.8} />
             <Cloud position={[0, 3.5, -1]} scale={1.2} />
        </group>

      </group>
    </Float>
  );
};
