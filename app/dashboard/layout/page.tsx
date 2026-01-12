"use client";

import Movement from "@/app/components/threeNavigation/movement";
import { TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function Page() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          near: 0.1,
          far: 1000,
          zoom: 1,
          position: [0, 0, 5],
        }}
      >
        <TransformControls mode="translate">
          <>
            <mesh>
              <boxGeometry />
              <meshStandardMaterial color="orange" />
            </mesh>
          </>
        </TransformControls>
        <gridHelper />
        <Movement></Movement>
        <ambientLight args={[0xffffff]} intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
      </Canvas>
    </div>
  );
}
