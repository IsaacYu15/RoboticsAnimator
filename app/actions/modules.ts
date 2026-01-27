"use server";

import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateModuleInput, UpdateModuleInput, Module } from "@/shared-types";

export async function getModules(): Promise<Module[]> {
  return await prisma.modules.findMany();
}

export async function createModule(data: CreateModuleInput) {
  try {
    const result = await prisma.modules.create({ data });
    revalidatePath("/modules");
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `Failed to create module ${e}` };
  }
}

export async function updateModule(id: number, data: UpdateModuleInput) {
  try {
    const result = await prisma.modules.update({
      where: { id },
      data,
    });
    revalidatePath("/modules");
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: `Failed to update ${e}` };
  }
}

export async function deleteModule(id: number) {
  try {
    await prisma.modules.delete({ where: { id } });
    revalidatePath("/modules");
    return { success: true };
  } catch (e) {
    return { success: false, error: `Failed to delete ${e}` };
  }
}
