"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { useState } from "react";

export default function Page() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

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
        <TransformControls
          mode="translate"
          onMouseDown={() => setOrbitEnabled(false)}
          onMouseUp={() => setOrbitEnabled(true)}
        >
          <>
            <mesh>
              <boxGeometry />
              <meshStandardMaterial color="orange" />
            </mesh>
          </>
        </TransformControls>
        <mesh>
          <planeGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <ambientLight args={[0xffffff]} intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />

        {orbitEnabled && <OrbitControls />}
      </Canvas>
    </div>
  );
}

// <div className="h-full w-full flex flex-col items-center">
//   <form className="flex flex-row gap-5">
//     <div className="mb-5">
//       <label className="block mb-2.5 text-sm font-medium text-heading">
//         Grid Size X
//       </label>
//       <input
//         value={gridX}
//         onChange={(e) => setGridX(tryParseInt(e.target.value) ?? 0)}
//         className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
//         required
//       />
//     </div>

//     <div className="mb-5">
//       <label className="block mb-2.5 text-sm font-medium text-heading">
//         Grid Size Y
//       </label>
//       <input
//         value={gridY}
//         onChange={(e) => setGridY(tryParseInt(e.target.value) ?? 0)}
//         className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
//         required
//       />
//     </div>
//   </form>

//   <div
//     className="grid gap-2"
//     style={{
//       gridTemplateColumns: `repeat(${gridY}, minmax(0, 1fr))`,
//       width: "fit-content",
//     }}
//   >
//     {componentsGrid?.map((rowDetails, i) =>
//       rowDetails.map((details, j) => {
//         const isNull = !details;
//         return (
//           <ComponentTile
//             key={`${i}-${j}`}
//             id={isNull ? 0 : details.id}
//             type={isNull ? "N/A" : details.type}
//             pin={isNull ? 0 : details.pin}
//             x={i}
//             y={j}
//             onRefresh={fetchComponents}
//           />
//         );
//       })
//     )}
//   </div>
// </div>
