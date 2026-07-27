"use client";

import { useEffect, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { Animation, CreateAnimation, UpdateAnimation } from "@/shared-types";

export const animationService = {
  getAnimations: () => api.get<Animation[]>(`/api/v1/animations`),
  getAnimation: (id: number) => api.get<Animation>(`/api/v1/animations/${id}`),
  postAnimation: (animation: CreateAnimation) =>
    api.post<Animation>(`/api/v1/animations`, animation),
  patchAnimation: (id: number, animation: UpdateAnimation) =>
    api.patch<Animation>(`/api/v1/animations/${id}`, animation),
  deleteAnimation: (id: number) =>
    api.delete<Animation>(`/api/v1/animations/${id}`),
};

export function useAnimations() {
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await animationService.getAnimations();
      if (data) setAnimations(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getAnimation = useCallback(async (id: number) => {
    const animation = await animationService.getAnimation(id);
    return animation;
  }, []);

  const createAnimation = useCallback(async (animation: CreateAnimation) => {
    const created = await animationService.postAnimation(animation);
    console.log(created);
    setAnimations((prev) => [...prev, created]);
    return created;
  }, []);

  const updateAnimation = useCallback(
    async (id: number, animation: UpdateAnimation) => {
      const updated = await animationService.patchAnimation(id, animation);
      setAnimations((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [],
  );

  const deleteAnimation = useCallback(async (id: number) => {
    await animationService.deleteAnimation(id);
    setAnimations((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    animations,
    loading,
    error,
    refresh,
    getAnimation,
    createAnimation,
    updateAnimation,
    deleteAnimation,
  };
}
