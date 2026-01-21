"use client";

import { useSearchParams } from "next/navigation";

export default function AnimationPage() {
  const searchParams = useSearchParams();
  const animationId = searchParams.get("id");

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <h1 className="text-2xl font-bold">
        Editing Animation: {animationId}
      </h1>
    </div>
  );
}
