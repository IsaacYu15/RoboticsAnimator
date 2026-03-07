"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { Asset, CreateAssetInput, UpdateAssetInput } from "@/shared-types";

export async function getAssets(): Promise<Asset[]> {
  return await prisma.assets.findMany({
    orderBy: { id: "asc" },
  });
}

export async function getAssetById(id: number): Promise<Asset | null> {
  return await prisma.assets.findUnique({ where: { id } });
}

export async function createAsset(data: CreateAssetInput) {
  try {
    const newAsset = await prisma.assets.create({ data });
    revalidatePath("/state-machine");
    return { success: true, data: newAsset };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create asset" };
  }
}

export async function updateAsset(id: number, data: UpdateAssetInput) {
  try {
    const updated = await prisma.assets.update({
      where: { id },
      data,
    });
    revalidatePath("/state-machine");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update asset" };
  }
}

export async function deleteAsset(id: number) {
  try {
    await prisma.assets.delete({
      where: { id },
    });
    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete asset" };
  }
}
