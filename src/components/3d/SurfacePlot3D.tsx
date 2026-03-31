/**
 * 3D Surface Plot Component
 * 
 * Interactive 3D surface visualization for correlation analysis.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ScatterPoint } from '@/types';

interface SurfaceMeshProps {
  data: ScatterPoint[];
}

function SurfaceMesh({ data }: SurfaceMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(6, 6, 20, 20);
    const posAttribute = geo.attributes.position;

    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      
      let height = 0;
      let weight = 0;
      
      data.forEach((point) => {
        const px = (point.x / 100) * 6 - 3;
        const py = (point.y / 10) * 6 - 3;
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        
        if (dist < 1) {
          const w = 1 / (dist + 0.1);
          height += (point.z / 1000) * w;
          weight += w;
        }
      });

      const z = weight > 0 ? (height / weight) * 2 : 0;
      posAttribute.setZ(i, z);
    }

    geo.computeVertexNormals();
    return { geometry: geo };
  }, [data]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#3B82F6"
        side={THREE.DoubleSide}
        roughness={0.4}
        metalness={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

function WireframeOverlay() {
  const lines = useMemo(() => {
    const lineGeometries: Array<[THREE.Vector3, THREE.Vector3]> = [];
    
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * 6 - 3;
      lineGeometries.push([
        new THREE.Vector3(x, 0, -3),
        new THREE.Vector3(x, 0, 3)
      ]);
      
      const z = (i / 10) * 6 - 3;
      lineGeometries.push([
        new THREE.Vector3(-3, 0, z),
        new THREE.Vector3(3, 0, z)
      ]);
    }
    
    return lineGeometries;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line key={i} points={points} color="#334155" lineWidth={1} transparent opacity={0.3} />
      ))}
    </group>
  );
}

interface SurfacePlot3DProps {
  data: Record<string, ScatterPoint[]>;
  isDark?: boolean;
}

export function SurfacePlot3D({ data, isDark = true }: SurfacePlot3DProps) {
  const allData = useMemo(() => {
    return Object.values(data).flat().slice(0, 500);
  }, [data]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-[var(--tech-border)] relative">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00D9FF" />

        <SurfaceMesh data={allData} />
        <WireframeOverlay />

        <Text position={[3.5, 0, 0]} fontSize={0.3} color="#64748B" rotation={[-Math.PI / 2, 0, 0]}>
          Recency →
        </Text>
        <Text position={[0, 0, 3.5]} fontSize={0.3} color="#64748B" rotation={[-Math.PI / 2, 0, 0]}>
          Frequency →
        </Text>
        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#64748B">
          Monetary ↑
        </Text>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      <div className="absolute bottom-4 right-4 glass-card p-3">
        <p className="text-xs font-semibold mb-2">Monetary Value</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-24 rounded overflow-hidden">
            <div className="h-1/4 bg-amber-500" />
            <div className="h-1/4 bg-emerald-500" />
            <div className="h-1/4 bg-cyan-500" />
            <div className="h-1/4 bg-blue-500" />
          </div>
          <div className="flex flex-col justify-between h-24 text-xs text-muted-foreground">
            <span>High</span>
            <span>Med-High</span>
            <span>Med-Low</span>
            <span>Low</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 glass-card p-4 max-w-sm">
        <h3 className="font-semibold mb-1">RFM Correlation Surface</h3>
        <p className="text-xs text-muted-foreground">
          3D surface showing the relationship between Recency, Frequency, and Monetary values. 
          Height represents average monetary value.
        </p>
      </div>

      <div className="absolute bottom-4 left-4 glass-card p-3 text-xs text-muted-foreground">
        <p>🖱️ Drag to rotate</p>
        <p>📜 Scroll to zoom</p>
      </div>
    </div>
  );
}
