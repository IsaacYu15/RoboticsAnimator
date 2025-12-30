import { AnimationEvent } from "@/types";
import { useState } from "react";

export default function useAnimations() {
  const [animations, setAnimations] = useState<AnimationEvent[]>();
  
  const fetchAnimations = async () => {
    const response = await fetch("/api/animations");
    const data = await response.json();

    setAnimations(data as AnimationEvent[]);
    console.log(data);
  };

  return {animations, fetchAnimations}
}
