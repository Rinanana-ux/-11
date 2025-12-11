import React, { useRef, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneControlsProps {
  children: React.ReactNode;
}

export const SceneControls: React.FC<SceneControlsProps> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { size, viewport } = useThree();
  
  // Physics state
  const isDragging = useRef(false);
  const previousPointerX = useRef(0);
  const velocity = useRef(0);
  const friction = 0.95; // 0.95 = slippery, 0.8 = stiff
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Prevent interacting if clicking on UI (handled by DOM overlay usually, but good practice in R3F)
    isDragging.current = true;
    previousPointerX.current = e.clientX; // Use clientX for screen coordinates
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current && groupRef.current) {
      // Calculate delta
      // We rely on R3F event bubbling
      const currentX = e.clientX; // Use clientX
      const delta = currentX - previousPointerX.current;
      
      // Update velocity based on swipe speed
      // Scale down delta for manageable rotation speed
      velocity.current = delta * 0.005; 
      
      previousPointerX.current = currentX;
    }
  };

  // Add global event listeners for up/move to handle dragging outside the mesh
  // But R3F events are on meshes. 
  // Solution: A transparent plane that catches events or use window events for Move/Up.
  
  useEffect(() => {
    const handleWindowUp = () => { isDragging.current = false; };
    const handleWindowMove = (e: PointerEvent) => {
        if (isDragging.current) {
             const delta = e.movementX;
             velocity.current += delta * 0.002;
        }
    };

    window.addEventListener('pointerup', handleWindowUp);
    window.addEventListener('pointermove', handleWindowMove);
    return () => {
        window.removeEventListener('pointerup', handleWindowUp);
        window.removeEventListener('pointermove', handleWindowMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Apply rotation
      groupRef.current.rotation.y += velocity.current;
      
      // Apply friction
      if (!isDragging.current) {
        velocity.current *= friction;
        
        // Stop completely if very slow to save calc? 
        // Not strictly necessary for this visual.
      } else {
          // If dragging, we might want to dampen velocity accumulation slightly
          velocity.current *= 0.8; 
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      // Capture start of drag on the group's children
      onPointerDown={(e) => {
          // e.stopPropagation(); // Optional, depending on if we want background to trigger too
          isDragging.current = true;
          // document.body.style.cursor = 'grabbing';
      }}
      onPointerOver={() => { document.body.style.cursor = 'grab'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {children}
    </group>
  );
};