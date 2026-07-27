"use client";

import { useEffect, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { CreateModule, Module, UpdateModule } from "@/shared-types";

export const moduleService = {
  getModules: () => api.get<Module[]>(`/api/v1/modules`),
  getModule: (id: number) => api.get<Module>(`/api/v1/modules/${id}`),
  postModule: (module: CreateModule) =>
    api.post<Module>(`/api/v1/modules`, module),
  patchModule: (id: number, module: UpdateModule) =>
    api.patch<Module>(`/api/v1/modules/${id}`, module),
  deleteModule: (id: number) => api.delete<Module>(`/api/v1/modules/${id}`),
};

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moduleService.getModules();
      if (data) setModules(data);
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

  const createModule = useCallback(async (module: CreateModule) => {
    const created = await moduleService.postModule(module);
    console.log(created);
    setModules((prev) => [...prev, created]);
    return created;
  }, []);

  const updateModule = useCallback(async (id: number, module: UpdateModule) => {
    const updated = await moduleService.patchModule(id, module);
    setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  }, []);

  const deleteModule = useCallback(async (id: number) => {
    await moduleService.deleteModule(id);
    setModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    modules,
    loading,
    error,
    refresh,
    createModule,
    updateModule,
    deleteModule,
  };
}
