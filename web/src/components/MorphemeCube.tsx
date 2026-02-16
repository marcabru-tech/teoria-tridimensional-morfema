import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface MorphemeProps {
    form: string
    root: string
    position: [number, number, number]
    color?: string
}

export const MorphemeCube: React.FC<MorphemeProps> = ({ form, root, position, color = 'orange' }) => {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    useFrame((state, delta) => {
        if (active) {
            meshRef.current.rotation.x += delta
        }
    })

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                scale={active ? 1.5 : 1}
                onClick={() => setActive(!active)}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={hovered ? 'hotpink' : color} transparent opacity={0.8} />
            </mesh>

            {/* Labels */}
            <Text position={[0, 1.2, 0]} fontSize={0.3} color="white">
                {form}
            </Text>
            <Text position={[0, -1.2, 0]} fontSize={0.2} color="#aaa">
                Root: {root}
            </Text>
        </group>
    )
}
