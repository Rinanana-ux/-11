import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Planet } from './components/Planet';
import { LuxuryRing } from './components/LuxuryRing';
import { GoldDust } from './components/GoldDust';
import { SceneControls } from './components/SceneControls';
import { RingState } from './types';
import * as THREE from 'three';

const LoadingScreen = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black text-[#FFD700] z-50">
    <div className="text-2xl font-serif animate-pulse">Loading Luxury World...</div>
  </div>
);

// New Component: Controls Camera Position based on state
const CameraRig: React.FC<{ ringState: RingState }> = ({ ringState }) => {
  useFrame((state, delta) => {
    // Target Z position: 20 for Formed (close), 30 for Chaos (far)
    const targetZ = ringState === 'FORMED' ? 20 : 30;
    
    // Smoothly interpolate camera position
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 1.5);
    state.camera.updateProjectionMatrix();
  });
  return null;
};

export default function App() {
  const [ringState, setRingState] = useState<RingState>('FORMED');

  const toggleState = () => {
    setRingState(prev => prev === 'FORMED' ? 'CHAOS' : 'FORMED');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          camera={{ position: [0, 4, 20], fov: 35 }}
          gl={{ antialias: false, toneMappingExposure: 1.5 }}
          dpr={[1, 2]} // Optimization for varying screen densities
        >
          <CameraRig ringState={ringState} />
          
          <color attach="background" args={['#02040a']} />
          <fog attach="fog" args={['#02040a', 10, 50]} />

          {/* Lighting & Environment */}
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
            color="#ffeeb1" // Warm sun
          />
          <Environment preset="lobby" />

          {/* Interactive Core */}
          <SceneControls>
            <Planet ringState={ringState} />
            <LuxuryRing ringState={ringState} />
          </SceneControls>
          
          {/* Particles (Outside controls so they don't spin with the planet, they follow mouse) */}
          <GoldDust />

          {/* Shadows on "Floor" (invisible plane) */}
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />

          {/* Post Processing */}
          <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.2} 
                radius={0.6}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#FFD700] px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                 <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                 <span className="text-white font-serif font-bold tracking-wider text-sm">LUXURY PLANET</span>
            </div>
            
            <button className="bg-[#FFD700] text-black w-12 h-8 rounded-full flex items-center justify-center font-bold hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
            </button>
        </div>

        {/* Center UI (Floating labels if needed, omitted for cleanliness) */}
        
        {/* Footer Controls */}
        <div className="flex justify-between items-end w-full pointer-events-auto">
            
            {/* Left Info */}
            <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                    <span className="text-xl">←</span>
                </div>
            </div>

            {/* Center Title */}
             <div className="text-center pb-8 opacity-80">
                 <div className="text-[#004225] font-bold text-lg drop-shadow-[0_2px_2px_rgba(255,215,0,0.8)]">SUN星</div>
                 <div className="text-[#FFD700] font-serif text-2xl font-bold tracking-widest drop-shadow-lg">Alpaca</div>
             </div>

            {/* Right Action / Toggle */}
            <div className="flex gap-4 items-center">
                 <button 
                    onClick={toggleState}
                    className="relative group overflow-hidden rounded-full bg-[#1a1a1a] border border-[#FFD700] px-8 py-3 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] active:scale-95"
                 >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#004225] to-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <div className="relative flex items-center gap-2">
                        <span className="text-[#FFD700] font-bold uppercase tracking-wider text-sm">
                            {ringState === 'FORMED' ? 'Explode' : 'Assemble'}
                        </span>
                    </div>
                 </button>
                 
                 <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                    <span className="text-xl">→</span>
                 </div>
            </div>
        </div>
      </div>
      
      {/* Instructions Overlay (Fades out) */}
      <div className="absolute bottom-32 w-full text-center pointer-events-none opacity-50 text-[10px] text-[#FFD700] tracking-[0.2em] uppercase animate-pulse">
        Swipe to Spin • Mouse to Attract Gold
      </div>

    </div>
  );
}