'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Stars, Grid, Line } from '@react-three/drei'
import { AnalysisResponse } from '@/lib/ttm/types'
import { Component, ReactNode, Suspense, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import * as THREE from 'three'

// Os rótulos 3D (<Text>) baixam fontes da internet. Se o download falhar ou
// demorar, o rótulo some, mas a cena 3D continua: sem esta proteção, a falha
// suspendia o Canvas inteiro ("Loading 3D visualizer..." para sempre).
class LabelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('3D label disabled (font unavailable):', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Label(props: ComponentProps<typeof Text>) {
  return (
    <LabelBoundary>
      <Suspense fallback={null}>
        <Text {...props} />
      </Suspense>
    </LabelBoundary>
  )
}

interface MorphemeVisualizerProps {
  result: AnalysisResponse | null
}

function MorphemeSphere({ position, morpheme }: { position: [number, number, number], morpheme: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? "#60a5fa" : "#3b82f6"} 
          emissive={hovered ? "#1e40af" : "#1e3a8a"}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <Label
        position={[0, 0.6, 0]}
        fontSize={0.3}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
      >
        {morpheme}
      </Label>
    </group>
  )
}

function AxisArrows() {
  const xPoints: [number, number, number][] = [[-5, 0, 0], [5, 0, 0]]
  const yPoints: [number, number, number][] = [[0, -5, 0], [0, 5, 0]]  
  const zPoints: [number, number, number][] = [[0, 0, -5], [0, 0, 5]]

  return (
    <>
      {/* X-axis (Blue) */}
      <Line points={xPoints} color="#3b82f6" lineWidth={2} />
      <Label position={[5.5, 0, 0]} fontSize={0.4} color="#60a5fa" anchorX="center">
        Width (X)
      </Label>
      
      {/* Y-axis (Green) */}
      <Line points={yPoints} color="#16a34a" lineWidth={2} />
      <Label position={[0, 5.5, 0]} fontSize={0.4} color="#4ade80" anchorX="center">
        Depth (Y)
      </Label>
      
      {/* Z-axis (Red) */}
      <Line points={zPoints} color="#dc2626" lineWidth={2} />
      <Label position={[0, 0, 5.5]} fontSize={0.4} color="#f87171" anchorX="center">
        Height (Z)
      </Label>
    </>
  )
}

function Scene({ result }: { result: AnalysisResponse | null }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Grid 
        args={[10, 10]} 
        position={[0, -0.1, 0]}
        cellColor="#374151"
        sectionColor="#6b7280"
        fadeDistance={15}
      />
      
      <AxisArrows />
      
      {result && (
        <MorphemeSphere 
          position={[
            result.morpheme.coordinates.x * 2, 
            result.morpheme.coordinates.y * 2, 
            result.morpheme.coordinates.z * 2
          ]} 
          morpheme={result.morpheme.morpheme}
        />
      )}
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={20}
        minDistance={5}
      />
    </>
  )
}

export default function MorphemeVisualizer({ result }: MorphemeVisualizerProps) {
  return (
    <div className="w-full space-y-3">
      <div className="w-full h-96 bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
        <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
          <Scene result={result} />
        </Canvas>
      </div>

      {result && (
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 backdrop-blur">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-space-blue rounded-full" />
              <span className="text-slate-300">
                X: {result.morpheme.coordinates.x} (Width)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-space-green rounded-full" />
              <span className="text-slate-300">
                Y: {result.morpheme.coordinates.y} (Depth)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-space-red rounded-full" />
              <span className="text-slate-300">
                Z: {result.morpheme.coordinates.z} (Height)
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-400">
            Root: <span className="font-mono text-slate-300">{result.morpheme.root}</span>
            {result.morpheme.gloss && (
              <>
                {' • '}
                <span className="italic">{result.morpheme.gloss}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}