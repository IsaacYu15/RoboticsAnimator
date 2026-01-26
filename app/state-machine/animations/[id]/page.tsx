import { VERT_DRAGGABLE_SECTIONS } from "@/app/components/dragHandlers";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import { Direction } from "@/shared-types";

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ animationId: string }>;
}) {
  const { animationId } = await params;

  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center p-10 bg-gray-50">
      <div className="w-full flex flex-row justify-start">
        <h1 className="text-2xl font-bold">Editing Animation: {animationId}</h1>
      </div>

      <DragResizer minDim={VERT_DRAGGABLE_SECTIONS} direction={Direction.DOWN}>
        <div className="bg-white h-full p-5 flex flex-col justify-between border-l border-slate-200 shadow-xl"></div>
      </DragResizer>
    </div>
  );
}
