import { states, Prisma } from "../generated/prisma/client";

export type State = states;
export type CreateStateInput = Prisma.statesCreateInput;
export type UpdateStateInput = Prisma.statesUpdateInput;
