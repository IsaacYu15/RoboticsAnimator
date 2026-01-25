import { components, Prisma } from "../generated/prisma/client";

export type Component = components;
export type CreateComponentInput = Prisma.componentsUncheckedCreateInput;
export type UpdateComponentInput = Prisma.componentsUncheckedUpdateInput;
export type WhereComponentInput = Prisma.componentsWhereInput;
