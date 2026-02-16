import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stars } from '@react-three/drei'
import { MorphemeCube } from './components/MorphemeCube'

function App() {
    // Mock data for initial visualization
    const [morphemes] = useState([
        { form: 'kataba', root: 'ktb', x: 0, y: 1, z: 0, color: '#ff6b6b' },   // Literal
        { form: 'kuttiba', root: 'ktb', x: 2, y: 1, z: 0, color: '#4ecdc4' },  // Derived
        { form: 'maktab', root: 'ktb', x: 4, y: 2, z: 0, color: '#ffe66d' },   // Noun of place
        { form: 'kitab', root: 'ktb', x: 1, y: 1, z: 1, color: '#f7fff7' },  // Vowel change
    ])

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1, color: 'white' }}>
                <h1>TTM Explorer 3D</h1>
                <p>X: Derivation | Y: Semantics | Z: Phonology</p>
            </div>

            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <Suspense fallback={null}>
                    {morphemes.map((m, i) => (
                        <MorphemeCube
                            key={i}
                            form={m.form}
                            root={m.root}
                            position={[m.x, m.z, -m.y]} // Map TTM dimensions to 3D space (Y is depth in TTM, so Z in 3D usually)
                            color={m.color}
                        />
                    ))}

                    <Grid infiniteGrid fadeDistance={30} sectionColor="#4a4ae2" cellColor="#2a2a72" />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <OrbitControls />
                </Suspense>
            </Canvas>
        </div>
    )
}

export default App
