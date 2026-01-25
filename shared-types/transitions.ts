import { transitions, Prisma } from "../generated/prisma/client";

export type Transition = transitions;
export type CreateTransitionInput = Prisma.transitionsCreateInput;
export type UpdateTransitionInput = Prisma.transitionsUpdateInput;
