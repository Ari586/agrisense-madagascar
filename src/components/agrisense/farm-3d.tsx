'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, MeshDistortMaterial, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function Tree({ position, scale = 1, color = '#2e7d32' }: { position: [number, number, number], scale?: number, color?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.8, 1.5, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

function CropField({ position, size = [2, 0.1, 2] }: { position: [number, number, number], size?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-size[0]/3 + (i % 3) * (size[0]/3), 0.1, -size[2]/3 + Math.floor(i / 3) * (size[2]/3)]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#4caf50" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function House({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[1.1, 0.5, 4]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0.61]}>
        <boxGeometry args={[0.3, 0.6, 0.05]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  )
}

function Island() {
  const islandRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (islandRef.current) {
      islandRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={islandRef} position={[0, -1, 0]}>
        <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4, 2, 1, 32]} />
          <meshStandardMaterial color="#4e342e" roughness={1} />
        </mesh>
        
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[4, 4, 0.1, 32]} />
          <meshStandardMaterial color="#388e3c" roughness={0.9} />
        </mesh>

        <mesh position={[1, 0.06, 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 4]} />
          <MeshDistortMaterial color="#0288d1" distort={0.2} speed={3} roughness={0.1} />
        </mesh>

        <House position={[-1, 0, -1]} />
        <CropField position={[1.5, 0, -1.5]} size={[1.5, 0.1, 1.5]} />
        <CropField position={[-1.5, 0, 1.5]} size={[1.5, 0.1, 1.5]} />
        
        <Tree position={[-2, 0, -2]} scale={0.8} />
        <Tree position={[2, 0, 2]} scale={1.2} />
        <Tree position={[2.5, 0, 0]} scale={0.6} color="#43a047" />
        <Tree position={[0, 0, -2.5]} scale={0.9} color="#2e7d32" />
        <Tree position={[-2.5, 0, 0]} scale={0.7} color="#1b5e20" />
      </group>
    </Float>
  )
}

export function Farm3D() {
  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden relative border border-white/10 bg-black/20">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4caf50" />
        
        <Island />
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
