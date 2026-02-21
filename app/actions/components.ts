"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Component,
  ComponentWithAnimation,
  CreateComponentInput,
  UpdateComponentInput,
  WhereComponentInput,
} from "@/shared-types";

export async function getComponents(
  filter?: WhereComponentInput,
): Promise<Component[]> {
  try {
    return await prisma.components.findMany({
      where: filter,
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function getComponentsWithAnimations(
  filter?: WhereComponentInput,
): Promise<ComponentWithAnimation[]> {
  try {
    return await prisma.components.findMany({
      where: filter,
      orderBy: { id: "asc" },
      include: {
        animation_events: {
          orderBy: { trigger_time: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function addComponent(data: CreateComponentInput) {
  try {
    const newComp = await prisma.components.create({ data });
    revalidatePath("/state-machine");
    return { success: true, data: newComp };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create component" };
  }
}

export async function updateComponent(id: number, data: UpdateComponentInput) {
  try {
    const updated = await prisma.components.update({
      where: { id },
      data,
    });
    revalidatePath("/state-machine");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update component" };
  }
}

export async function deleteComponent(id: number) {
  try {
    await prisma.components.delete({
      where: { id },
    });
    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete component" };
  }
}
