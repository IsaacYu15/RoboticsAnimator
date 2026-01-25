"use server";

import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Animation,
  CreateAnimationInput,
  UpdateAnimationInput,
} from "@/shared-types";

export async function getAnimations(): Promise<Animation[]> {
  return await prisma.animations.findMany({
    orderBy: { id: "asc" },
  });
}

export async function createAnimation(data: CreateAnimationInput) {
  try {
    const newAnimation = await prisma.animations.create({ data });
    revalidatePath("/state-machine");
    return { success: true, data: newAnimation };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create animation" };
  }
}

export async function updateAnimation(id: number, data: UpdateAnimationInput) {
  try {
    const updated = await prisma.animations.update({
      where: { id },
      data,
    });
    revalidatePath("/state-machine");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update animation" };
  }
}

export async function deleteAnimation(id: number) {
  try {
    await prisma.animations.delete({
      where: { id },
    });
    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete animation" };
  }
}
