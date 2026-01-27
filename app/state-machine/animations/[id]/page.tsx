import { getComponentsWithAnimations } from "@/app/actions/components";
import {
  HORZ_DRAGGABLE_SECTIONS,
  VERT_DRAGGABLE_SECTIONS,
} from "@/app/components/dragHandlers";
import DragResizer from "@/app/components/dragHandlers/dragResizer";
import { ComponentWithAnimation, Direction } from "@/shared-types";
import ComponentTag from "./componentTag";
import ComponentTimeline from "./componentTimeline";
import LayoutScene from "@/app/components/layoutScene/layoutScene";

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolveParams = await params;
  const animationId = resolveParams.id;

  const components = await getComponentsWithAnimations();

  return (
    <div className="w-screen h-screen flex flex-col justify-start items-center p-10 bg-gray-50">
      <div className="w-full flex flex-row justify-start">
        <h1 className="text-2xl font-bold">Editing Animation: {animationId}</h1>
      </div>

      <LayoutScene components={components}></LayoutScene>

      <DragResizer
        minDim={VERT_DRAGGABLE_SECTIONS}
        dragDirection={Direction.UP}
      >
        <div className="bg-slate-800 h-full w-full flex flex-row gap-2 pt-5">
          <DragResizer
            minDim={HORZ_DRAGGABLE_SECTIONS}
            dragDirection={Direction.RIGHT}
            isNested={true}
          >
            <div className="h-5"></div>
            <div className="h-full w-full flex flex-col justify-start gap-1">
              {components.map((component) => (
                <ComponentTag
                  key={component.id}
                  name={component.name}
                  selected={false}
                />
              ))}
            </div>
          </DragResizer>

          <div className="flex-1 bg-slate-700 h-full min-w-0 relative">
            <div className="h-5 flex flex-row">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col gap-0.5"
                  style={{
                    left: `${i * 100}px`,
                  }}
                >
                  <h2>{i}</h2>
                </div>
              ))}
            </div>
            <div className="h-full w-full flex flex-col justify-start">
              {components.map((component: ComponentWithAnimation) => (
                <ComponentTimeline
                  key={component.id}
                  animations={component.animation_events}
                />
              ))}
            </div>
          </div>
        </div>
      </DragResizer>
    </div>
  );
}
