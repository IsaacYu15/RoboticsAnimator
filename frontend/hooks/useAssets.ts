"use client";

import { useEffect, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { Asset, CreateAsset, UpdateAsset } from "@/shared-types";

export const assetService = {
  getAssets: () => api.get<Asset[]>(`/api/v1/assets`),
  getAsset: (id: number) => api.get<Asset>(`/api/v1/assets/${id}`),
  postAsset: (asset: CreateAsset) => api.post<Asset>(`/api/v1/assets`, asset),
  patchAsset: (id: number, asset: UpdateAsset) =>
    api.patch<Asset>(`/api/v1/assets/${id}`, asset),
  deleteAsset: (id: number) => api.delete<void>(`/api/v1/assets/${id}`),
};

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshAssets = useCallback(async () => {
    setLoading(true);

    try {
      const data = await assetService.getAssets();

      if (data) {
        setAssets(data);
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  const createAsset = useCallback(async (asset: CreateAsset) => {
    const created = await assetService.postAsset(asset);
    setAssets((prev) => [...prev, created]);
    return created;
  }, []);

  const updateAsset = useCallback(async (id: number, asset: UpdateAsset) => {
    const updated = await assetService.patchAsset(id, asset);
    setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const deleteAsset = useCallback(async (id: number) => {
    await assetService.deleteAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    assets,
    loading,
    error,
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  };
}
