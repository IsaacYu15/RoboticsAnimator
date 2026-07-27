"use client";

import { useEffect, useState, useCallback } from "react";

import { api } from "@/lib/api";
import {
  AnimationEvent,
  CreateAnimationEvent,
  UpdateAnimationEvent,
} from "@/shared-types";

export const animationEventService = {
  getAnimationEvents: () =>
    api.get<AnimationEvent[]>(`/api/v1/animation-events`),
  getAnimationEvent: (id: number) =>
    api.get<AnimationEvent>(`/api/v1/animation-events/${id}`),
  postAnimationEvent: (event: CreateAnimationEvent) =>
    api.post<AnimationEvent>(`/api/v1/animation-events`, event),
  patchAnimationEvent: (id: number, event: UpdateAnimationEvent) =>
    api.patch<AnimationEvent>(`/api/v1/animation-events/${id}`, event),
  deleteAnimationEvent: (id: number) =>
    api.delete<AnimationEvent>(`/api/v1/animation-events/${id}`),
};

export function useAnimationEvents() {
  const [animationEvents, setAnimationEvents] = useState<AnimationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await animationEventService.getAnimationEvents();
      if (data) setAnimationEvents(data);
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

  const getAnimationEvent = useCallback(async (id: number) => {
    const event = await animationEventService.getAnimationEvent(id);
    return event;
  }, []);

  const createAnimationEvent = useCallback(
    async (event: CreateAnimationEvent) => {
      const created = await animationEventService.postAnimationEvent(event);
      setAnimationEvents((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const updateAnimationEvent = useCallback(
    async (id: number, event: UpdateAnimationEvent) => {
      const updated = await animationEventService.patchAnimationEvent(
        id,
        event,
      );
      setAnimationEvents((prev) =>
        prev.map((e) => (e.id === id ? updated : e)),
      );
      return updated;
    },
    [],
  );

  const deleteAnimationEvent = useCallback(async (id: number) => {
    await animationEventService.deleteAnimationEvent(id);
    setAnimationEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    animationEvents,
    loading,
    error,
    refresh,
    getAnimationEvent,
    createAnimationEvent,
    updateAnimationEvent,
    deleteAnimationEvent,
  };
}
