"use client";

import { useEffect, useState } from "react";
import { tryParseInt } from "@/app/services/parse";
import useComponents from "@/app/hooks/useComponents";
import { ComponentDetails } from "@/types";
import ComponentTile from "@/app/components/components/componentTile";

export default function Page() {
  const [gridX, setGridX] = useState<number>(0);
  const [gridY, setGridY] = useState<number>(0);
  const [componentsGrid, setComponentsGrid] = useState<ComponentDetails[][]>();
  const { components, fetchComponents } = useComponents();

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    if (!components) return;

    setGridX(Math.max(...components.map((comp) => comp.x)) + 1);
    setGridY(Math.max(...components.map((comp) => comp.y)) + 1);
  }, [components]);

  useEffect(() => {
    if (!components || gridX == 0 || gridY == 0) return;

    const tempComponentsGrid: ComponentDetails[][] = new Array(gridX)
      .fill(null)
      .map(() => new Array(gridY).fill(null));

    components.forEach((comp) => {
      tempComponentsGrid[comp.x][comp.y] = { ...comp };
    });

    setComponentsGrid(tempComponentsGrid);
  }, [gridX, gridY]);

  return (
    <div className="h-full w-full flex flex-col items-center">
      <form className="flex flex-row gap-5">
        <div className="mb-5">
          <label className="block mb-2.5 text-sm font-medium text-heading">
            Grid Size X
          </label>
          <input
            value={gridX}
            onChange={(e) => setGridX(tryParseInt(e.target.value) ?? 0)}
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2.5 text-sm font-medium text-heading">
            Grid Size Y
          </label>
          <input
            value={gridY}
            onChange={(e) => setGridY(tryParseInt(e.target.value) ?? 0)}
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base block w-full px-3 py-2.5"
            required
          />
        </div>
      </form>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridY}, minmax(0, 1fr))`,
          width: "fit-content",
        }}
      >
        {componentsGrid?.map((rowDetails, i) =>
          rowDetails.map((details, j) => {
            const isNull = !details;
            return (
              <ComponentTile
                key={`${i}-${j}`}
                id={isNull ? 0 : details.id}
                type={isNull ? "N/A" : details.type}
                pin={isNull ? 0 : details.pin}
                x={i}
                y={j}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
