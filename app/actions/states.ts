"use server";

import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { State, CreateStateInput, UpdateStateInput } from "@/shared-types";

export async function getStates(): Promise<State[]> {
  return await prisma.states.findMany({
    orderBy: { id: "asc" },
  });
}

export async function createState(data: CreateStateInput) {
  try {
    const newState = await prisma.states.create({ data });
    revalidatePath("/state-machine");
    return { success: true, data: newState };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create state" };
  }
}

export async function updateState(id: number, data: UpdateStateInput) {
  try {
    const updated = await prisma.states.update({
      where: { id },
      data,
    });
    revalidatePath("/state-machine");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update state" };
  }
}

export async function deleteState(id: number) {
  try {
    await prisma.states.delete({
      where: { id },
    });
    revalidatePath("/state-machine");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete state" };
  }
}
