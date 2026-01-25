"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  AnimationEvent,
  CreateAnimationEventInput,
  UpdateAnimationEventInput,
} from "@/shared-types";

export async function getAnimationEvents(
  animationId?: number,
): Promise<AnimationEvent[]> {
  try {
    return await prisma.animation_events.findMany({
      where: animationId ? { animation_id: animationId } : {},
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function getAnimationEventById(id: number) {
  return await prisma.animation_events.findUnique({
    where: { id },
  });
}

export async function addAnimationEvent(data: CreateAnimationEventInput) {
  try {
    const newEvent = await prisma.animation_events.create({ data });
    revalidatePath("/state-machine");
    return { success: true, data: newEvent };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create animation event" };
  }
}

export async function updateAnimationEvent(
  id: number,
  data: UpdateAnimationEventInput,
) {
  try {
    const updated = await prisma.animation_events.update({
      where: { id },
      data,
    });
    revalidatePath("/state-machine");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update animation event" };
  }
}

export async function deleteAnimationEvent(id: number) {
  try {
    await prisma.animation_events.delete({
      where: { id },
    });
    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete animation event" };
  }
}
