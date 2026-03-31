/**
 * 3D Scatter Plot Component
 * 
 * Interactive 3D visualization of customer segments using React Three Fiber.
 */

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ScatterPoint } from '@/types';

interface Point3DProps {
  position: [number, number, number];
  color: string;
  customerId: string;
  segment: string;
  onHover: (info: { customerId: string; segment: string; position: THREE.Vector3 } | null) => void;
}

function Point3D({ position, color, customerId, segment, onHover }: Point3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        hovered ? 1.5 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover({ customerId, segment, position: new THREE.Vector3(...position) });
      }}
      onPointerLeave={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.3}
        roughness={0.3}
        metalness={0.7}
      />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="glass-card px-3 py-2 text-xs whitespace-nowrap pointer-events-none">
            <p className="font-semibold">{segment}</p>
            <p className="text-muted-foreground">ID: {customerId.slice(0, 8)}...</p>
          </div>
        </Html>
      )}
    </mesh>
  );
}

interface AxesProps {
  size: number;
}

function Axes({ size }: AxesProps) {
  const xPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(size, 0, 0)
  ], [size]);

  const yPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, size, 0)
  ], [size]);

  const zPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, size)
  ], [size]);

  return (
    <group>
      <Line points={xPoints} color="#64748B" lineWidth={1} />
      <Text position={[size + 0.5, 0, 0]} fontSize={0.3} color="#64748B">
        Recency
      </Text>

      <Line points={yPoints} color="#64748B" lineWidth={1} />
      <Text position={[0, size + 0.5, 0]} fontSize={0.3} color="#64748B">
        Frequency
      </Text>

      <Line points={zPoints} color="#64748B" lineWidth={1} />
      <Text position={[0, 0, size + 0.5]} fontSize={0.3} color="#64748B">
        Monetary
      </Text>
    </group>
  );
}

interface ScatterPlot3DProps {
  data: Record<string, ScatterPoint[]>;
  isDark?: boolean;
}

const segmentColors: Record<string, string> = {
  'Champions': '#00FF88',
  'Loyal Customers': '#00D9FF',
  'Potential Loyalists': '#FFD93D',
  'New Customers': '#A855F7',
  'At-Risk Customers': '#FF6B6B',
  'Hibernating': '#F472B6',
};

export function ScatterPlot3D({ data, isDark = true }: ScatterPlot3DProps) {
  const [, setHoveredPoint] = useState<{
    customerId: string;
    segment: string;
    position: THREE.Vector3;
  } | null>(null);

  const points = useMemo(() => {
    const allPoints: Array<{
      position: [number, number, number];
      color: string;
      customerId: string;
      segment: string;
    }> = [];

    Object.entries(data).forEach(([segment, segmentData]) => {
      const color = segmentColors[segment] || '#00D9FF';
      const sampled = segmentData.slice(0, 100);
      
      sampled.forEach((point) => {
        const normalizedX = Math.min(point.x / 100, 5);
        const normalizedY = Math.min(point.y / 10, 5);
        const normalizedZ = Math.min(point.z / 1000, 5);
        
        allPoints.push({
          position: [normalizedX, normalizedY, normalizedZ],
          color,
          customerId: point.customer_id,
          segment,
        });
      });
    });

    return allPoints;
  }, [data]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-[var(--tech-border)]">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 50 }}
        style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D9FF" />

        <gridHelper
          args={[10, 20, isDark ? '#334155' : '#CBD5E1', isDark ? '#1E293B' : '#E2E8F0']}
          position={[2.5, 0, 2.5]}
        />

        <Axes size={5} />

        {points.map((point, index) => (
          <Point3D
            key={`${point.customerId}-${index}`}
            position={point.position}
            color={point.color}
            customerId={point.customerId}
            segment={point.segment}
            onHover={setHoveredPoint}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 glass-card p-3">
        <p className="text-xs font-semibold mb-2">Segments</p>
        <div className="space-y-1">
          {Object.entries(segmentColors).map(([segment, color]) => (
            <div key={segment} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full"
                style={{ background: color }}
              />
              <span className="text-xs">{segment}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-4 right-4 glass-card p-3 text-xs text-muted-foreground">
        <p>🖱️ Drag to rotate</p>
        <p>📜 Scroll to zoom</p>
        <p>👆 Hover for details</p>
      </div>
    </div>
  );
}
