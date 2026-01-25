import { Point } from "@/shared-types";

export interface ArrowProps {
  from: Point;
  to: Point;
}

export default function Arrow(props: ArrowProps) {
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
        </marker>
      </defs>
      <line
        x1={props.from.x}
        y1={props.from.y}
        x2={props.to.x}
        y2={props.to.y}
        stroke="#60a5fa"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
}
