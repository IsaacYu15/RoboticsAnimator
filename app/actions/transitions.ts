"use server";

import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateTransitionInput, Transition } from "@/shared-types";

export async function getTransitions(): Promise<Transition[]> {
  try {
    return await prisma.transitions.findMany({
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export async function createTransition(data: CreateTransitionInput) {
  try {
    const newTransition = await prisma.transitions.create({ data });
    revalidatePath("/state-machine");

    return { success: true, data: newTransition };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create transition" };
  }
}

export async function deleteTransition(id: number) {
  try {
    await prisma.transitions.delete({
      where: { id },
    });

    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete transition" };
  }
}
