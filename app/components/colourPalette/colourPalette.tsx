interface ColourPaletteProps {
  selectedColour: string | null;
  setSelectedColour: (colour: string) => void;
}

const colourList = [
  { hex: "#fa2121", bgClass: "bg-red", borderClass: "border-red-dark" },
  { hex: "#6189f9", bgClass: "bg-blue", borderClass: "border-blue-dark" },
  { hex: "#61f973", bgClass: "bg-green", borderClass: "border-green-dark" },
  { hex: "#fac124", bgClass: "bg-yellow", borderClass: "border-yellow-dark" },
  {
    hex: "#4d4d4d",
    bgClass: "bg-gray-medium-dark",
    borderClass: "border-gray-dark",
  },
];

export default function ColourPalette(props: ColourPaletteProps) {
  return (
    <div>
      <div className="flex flex-row gap-2">
        {colourList.map((colour, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-lg ${props.selectedColour === colour.hex ? "border-4" : "border-2"} ${colour.bgClass} ${colour.borderClass} cursor-pointer`}
            onClick={() => props.setSelectedColour(colour.hex)}
          ></div>
        ))}
      </div>
    </div>
  );
}
