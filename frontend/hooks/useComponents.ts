"use client";

import { useEffect, useState, useCallback } from "react";

import { api } from "@/lib/api";
import {
  Component,
  ComponentWithAnimations,
  CreateComponent,
  UpdateComponent,
} from "@/shared-types";
import { animationEventService } from "./useAnimationEvents";

export const componentService = {
  getComponents: () => api.get<Component[]>(`/api/v1/components`),
  getComponentsWithAnimations: () =>
    api.get<ComponentWithAnimations[]>(
      `/api/v1/components?include=animation_events`,
    ),
  getComponent: (id: number) => api.get<Component>(`/api/v1/components/${id}`),
  postComponent: (component: CreateComponent) =>
    api.post<Component>(`/api/v1/components`, component),
  patchComponent: (id: number, component: UpdateComponent) =>
    api.patch<Component>(`/api/v1/components/${id}`, component),
  deleteComponent: (id: number) =>
    api.delete<Component>(`/api/v1/components/${id}`),
};

export function useComponents() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await componentService.getComponents();
      if (data) setComponents(data);
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

  const getComponent = useCallback(async (id: number) => {
    return componentService.getComponent(id);
  }, []);

  const createComponent = useCallback(async (component: CreateComponent) => {
    const created = await componentService.postComponent(component);
    setComponents((prev) => [...prev, created]);
    return created;
  }, []);

  const updateComponent = useCallback(
    async (id: number, component: UpdateComponent) => {
      const updated = await componentService.patchComponent(id, component);
      setComponents((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [],
  );

  const deleteComponent = useCallback(async (id: number) => {
    await componentService.deleteComponent(id);
    setComponents((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    components,
    loading,
    error,
    refresh,
    getComponent,
    createComponent,
    updateComponent,
    deleteComponent,
  };
}

export function useComponentsWithAnimations() {
  const [components, setComponents] = useState<ComponentWithAnimations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await componentService.getComponentsWithAnimations();
      if (data) setComponents(data);
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

  // Optimistic local update — no network call, just updates state immediately
  const handleLocalEventTimeChange = useCallback(
    (componentId: number, eventId: number, newTime: number) => {
      setComponents((previous) =>
        previous.map((component) => {
          if (component.id !== componentId) return component;

          const updatedEvents = component.animation_events
            .map((event) =>
              event.id === eventId
                ? { ...event, trigger_time: newTime }
                : event,
            )
            .sort((a, b) => Number(a.trigger_time) - Number(b.trigger_time));

          return { ...component, animation_events: updatedEvents };
        }),
      );
    },
    [],
  );

  // Persists the change; call this once dragging/editing settles (e.g. onDragEnd, onBlur)
  const commitEventTimeChange = useCallback(
    async (eventId: number, newTime: number) => {
      try {
        await animationEventService.patchAnimationEvent(eventId, {
          trigger_time: newTime,
        });
      } catch (err) {
        setError(err as Error);
        // consider calling refresh() here to roll back to server truth on failure
      }
    },
    [],
  );

  return {
    components,
    loading,
    error,
    refresh,
    handleLocalEventTimeChange,
    commitEventTimeChange,
  };
}
