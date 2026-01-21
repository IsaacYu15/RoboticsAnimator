import { Animation } from "@/types";
import { useState } from "react";

export default function useAnimations() {
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [animationsMap, setAnimationsMap] = useState<Map<number, Animation>>(
    new Map(),
  );

  const fetchAnimations = async () => {
    const response = await fetch("/api/animations");
    const data = (await response.json()) as Animation[];
    setAnimations(data);

    const tempMap = new Map<number, Animation>();
    data.forEach((value: Animation) => {
      tempMap.set(value.id, value);
    });
    setAnimationsMap(tempMap);

    return data;
  };

  const addAnimation = async (details: Animation) => {
    const response = await fetch("/api/animations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });
    return await response.json();
  };

  const updateAnimation = async (details: Animation) => {
    const response = await fetch("/api/animations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });
    return await response.json();
  };

  const deleteAnimation = async (id: number) => {
    const response = await fetch("/api/animations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    return await response.json();
  };

  return {
    animations,
    animationsMap,
    fetchAnimations,
    addAnimation,
    updateAnimation,
    deleteAnimation,
  };
}
