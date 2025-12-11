import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { RingState, OrnamentData } from '../types';

interface LuxuryRingProps {
  ringState: RingState;
}

// Reliable Cat Images
const CAT_IMAGES = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1495360019602-e05980bf543e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1529778873920-4da4926a7071?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1494256997604-0e105c1e5d78?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1501820488136-72669149e0d4?auto=format&fit=crop&w=400&q=80"
];

// Floating Text Messages (English for stability)
const TEXT_MESSAGES = [
    "So Happy Today",
    "Nice to Meet You",
    "Offline Today"
];

// -- Sub-component: Floating Text --
const FloatingText: React.FC<{ data: OrnamentData, ringState: RingState }> = ({ data, ringState }) => {
    const group = useRef<THREE.Group>(null);
    const currentPos = useRef(data.chaosPos.clone());
    const currentScale = useRef(0);
    const timeOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state, delta) => {
        if (!group.current) return;

        // 1. Target Interpolation
        // Text is hidden inside the ring (targetPos) but flies out to chaosPos
        const target = ringState === 'FORMED' ? data.targetPos : data.chaosPos;
        currentPos.current.lerp(target, delta * 2);

        // Apply position + Float
        group.current.position.copy(currentPos.current);
        group.current.position.y += Math.sin(state.clock.elapsedTime + timeOffset) * 0.1;

        // 2. Scale Logic
        // In FORMED: Scale to 0 (Hidden). In CHAOS: Scale to 1 (Visible)
        const targetScaleVal = ringState === 'CHAOS' ? 1 : 0;
        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScaleVal, delta * 4);
        group.current.scale.setScalar(currentScale.current);

        // 3. Rotation
        // Always face camera
        group.current.lookAt(state.camera.position);
    });

    return (
        <group ref={group}>
            <Text
                color="#FFD700" // Gold text
                anchorX="center"
                anchorY="middle"
                fontSize={0.8}
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {data.text}
            </Text>
        </group>
    );
};


// -- Sub-component: Single Photo Card --
const PhotoCard: React.FC<{ data: OrnamentData, ringState: RingState }> = ({ data, ringState }) => {
  const mesh = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Load Cat Image with fallback logic
  useEffect(() => {
    if (data.imageUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(
            data.imageUrl, 
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                // Center crop simulation
                tex.center.set(0.5, 0.5);
                setTexture(tex);
            },
            undefined, 
            (err) => {
                // If main image fails, load a robust fallback
                console.warn(`Failed to load image for ${data.id}, using fallback.`);
                loader.load(CAT_IMAGES[0], (fallbackTex) => {
                    fallbackTex.colorSpace = THREE.SRGBColorSpace;
                    fallbackTex.center.set(0.5, 0.5);
                    setTexture(fallbackTex);
                });
            }
        );
    }
  }, [data.imageUrl]);

  const currentPos = useRef(data.chaosPos.clone());
  
  // Random offset for floating animation
  const timeOffset = useMemo(() => Math.random() * 100, []);
  
  // Dynamic scale ref for smooth transition
  const currentScale = useRef(1);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    // 1. Target Interpolation
    // We want photos to be VERY visible in CHAOS mode (Explode)
    // In FORMED mode, they are part of the ring
    const target = ringState === 'FORMED' ? data.targetPos : data.chaosPos;
    
    // Smooth damp position
    currentPos.current.lerp(target, delta * 2);
    
    // Apply position with some float
    mesh.current.position.copy(currentPos.current);
    mesh.current.position.y += Math.sin(state.clock.elapsedTime + timeOffset) * 0.1;

    // 2. Scale Logic
    // In CHAOS mode, scale up to 1.8x to see the photo clearly. In FORMED, normal 1x.
    const targetScale = ringState === 'CHAOS' ? 1.8 : 1.0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, delta * 3);
    mesh.current.scale.setScalar(currentScale.current);

    // 3. Rotation Behavior
    if (ringState === 'FORMED') {
      // Follow the ring flow logic roughly, or just data.rotation
      // We'll lerp towards the assigned random rotation
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, data.rotation.x, delta * 2);
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, data.rotation.y, delta * 2);
      mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, data.rotation.z, delta * 2);
    } else {
      // CHAOS / EXPLODE: Face camera mostly, but with a slight drift
      // We can use lookAt to face camera (0,0,30) roughly
      const targetRotation = new THREE.Vector3(0, 4, 30); // Camera pos
      mesh.current.lookAt(targetRotation);
      
      // Add a slow "display" rotation
      mesh.current.rotation.z += Math.sin(state.clock.elapsedTime * 0.5 + timeOffset) * 0.05;
    }
  });

  return (
    <group ref={mesh}>
      {/* Paper Backing (White) */}
      <mesh>
        <boxGeometry args={[0.8, 1.0, 0.01]} />
        <meshStandardMaterial color="#fafafa" roughness={0.8} />
      </mesh>
      {/* Image Plane (Front) */}
      {texture && (
          <mesh position={[0, 0, 0.006]}>
            <planeGeometry args={[0.7, 0.9]} />
            <meshBasicMaterial map={texture} />
          </mesh>
      )}
    </group>
  );
};

// Helper to create curve points
const createRingCurve = () => {
  const points = [];
  // A flowy, organic ring (not a perfect circle)
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * Math.PI * 2;
    // Parametric equation for a wavy ring
    const x = Math.cos(t) * 8 + Math.sin(t * 3) * 0.5;
    const z = Math.sin(t) * 8 + Math.cos(t * 2) * 0.5;
    const y = Math.sin(t * 4) * 1.5; 
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, true);
};

// Generate Star Geometry
const createStarGeometry = () => {
  const shape = new THREE.Shape();
  const points = 5;
  const outerRadius = 0.5;
  const innerRadius = 0.25;
  
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const a = (i / (points * 2)) * Math.PI * 2;
    // Rotate slightly so point is up
    const rot = -Math.PI / 2; 
    const x = Math.cos(a + rot) * r;
    const y = Math.sin(a + rot) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  
  const extrudeSettings = {
    steps: 1,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 1
  };
  
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

export const LuxuryRing: React.FC<LuxuryRingProps> = ({ ringState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbMeshRef = useRef<THREE.InstancedMesh>(null);
  const starMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Memoized Geometry for Stars
  const starGeometry = useMemo(() => createStarGeometry(), []);

  // Pre-calculate positions
  const { orbs, stars, lights, photos, texts } = useMemo(() => {
    const curve = createRingCurve();
    
    const generateData = (count: number, type: 'ORB' | 'STAR' | 'LIGHT' | 'PHOTO' | 'TEXT'): OrnamentData[] => {
      const data: OrnamentData[] = [];
      for (let i = 0; i < count; i++) {
        const t = i / count;
        
        // Target Position (Ring)
        const targetPoint = curve.getPoint(t);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.8; 
        targetPoint.x += Math.cos(angle) * radius;
        targetPoint.y += Math.sin(angle) * radius;

        // Chaos Position
        const r = 8 + Math.random() * 8; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const chaosPoint = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        chaosPoint.y *= 0.6; // Flatten slightly

        let color = '#FFFFFF';
        let weight = 0.1;
        let imageUrl: string | undefined = undefined;
        let textContent: string | undefined = undefined;

        if (type === 'ORB') {
          color = '#004225';
          weight = 0.05;
        } else if (type === 'STAR') {
          color = '#FFD700'; // Gold stars
          weight = 0.08;
        } else if (type === 'LIGHT') {
          color = '#FFFFFF';
          weight = 0.12;
        } else if (type === 'PHOTO') {
          color = '#FFFFFF';
          weight = 0.03;
          imageUrl = CAT_IMAGES[i % CAT_IMAGES.length];
        } else if (type === 'TEXT') {
            color = '#FFD700';
            weight = 0.01;
            textContent = TEXT_MESSAGES[i % TEXT_MESSAGES.length];
            // Push chaos point slightly further out for text
            chaosPoint.multiplyScalar(1.2);
        }

        data.push({
          id: i,
          type: type as any,
          chaosPos: chaosPoint,
          targetPos: targetPoint,
          rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
          color,
          weight,
          imageUrl,
          text: textContent
        });
      }
      return data;
    };

    return {
      orbs: generateData(60, 'ORB'),
      stars: generateData(80, 'STAR'), 
      lights: generateData(400, 'LIGHT'),
      photos: generateData(12, 'PHOTO'),
      texts: generateData(5, 'TEXT')
    };
  }, []);

  // Animation State for Instanced Meshes
  const animProgress = useRef(0); 
  const tempObj = new THREE.Object3D();

  useFrame((state, delta) => {
    // Update Animation Progress
    const targetProgress = ringState === 'FORMED' ? 1 : 0;
    animProgress.current = THREE.MathUtils.lerp(animProgress.current, targetProgress, delta * 2);
    const effectiveProgress = THREE.MathUtils.smoothstep(animProgress.current, 0, 1);

    const updateMesh = (mesh: THREE.InstancedMesh, data: OrnamentData[]) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        // Dynamic lerp
        tempObj.position.lerpVectors(item.chaosPos, item.targetPos, effectiveProgress);
        
        // Floating motion
        tempObj.position.y += Math.sin(state.clock.elapsedTime * 2 + item.id) * 0.05;

        // Rotation
        tempObj.rotation.copy(item.rotation);
        tempObj.rotation.x += state.clock.elapsedTime * 0.1;
        tempObj.rotation.y += state.clock.elapsedTime * 0.05;

        // Scale
        let scale = 1;
        if (item.type === 'ORB') scale = 0.4;
        else if (item.type === 'STAR') scale = 0.4;
        else if (item.type === 'LIGHT') scale = 0.1;
        
        tempObj.scale.setScalar(scale);

        tempObj.updateMatrix();
        mesh.setMatrixAt(i, tempObj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (orbMeshRef.current) updateMesh(orbMeshRef.current, orbs);
    if (starMeshRef.current) updateMesh(starMeshRef.current, stars);
    if (lightMeshRef.current) updateMesh(lightMeshRef.current, lights);
    
    // Rotate entire group
    if (groupRef.current) {
         if (ringState === 'FORMED') {
             groupRef.current.rotation.y += delta * 0.05;
         } else {
             groupRef.current.rotation.y += delta * 0.01;
         }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbs - Green Metallic Spheres */}
      <instancedMesh ref={orbMeshRef} args={[undefined, undefined, orbs.length]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
            color="#006435" 
            metalness={0.9} 
            roughness={0.1} 
        />
      </instancedMesh>

      {/* Stars */}
      <instancedMesh ref={starMeshRef} args={[undefined, undefined, stars.length]}>
        <primitive object={starGeometry} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </instancedMesh>

      {/* Lights */}
      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#FFF" toneMapped={false} />
      </instancedMesh>

      {/* Photos (Individual Components) */}
      {photos.map((photo) => (
         <PhotoCard key={photo.id} data={photo} ringState={ringState} />
      ))}

      {/* Floating Text (Individual Components) */}
      {texts.map((item) => (
          <FloatingText key={item.id} data={item} ringState={ringState} />
      ))}
    </group>
  );
};