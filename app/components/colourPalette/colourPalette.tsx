import { COLOUR_LIST } from "@/app/constants";

interface ColourPaletteProps {
  selectedColour?: string;
  setSelectedColour: (colour: string) => void;
}

export default function ColourPalette(props: ColourPaletteProps) {
  return (
    <div>
      <div className="w-full h-full flex flex-row gap-2 items-center">
        {COLOUR_LIST.map((colour, i) => (
          <div
            key={i}
            className={`size-5 rounded-sm 
              ${props.selectedColour === colour.hex ? "outline-2 outline-offset-2 outline-blue-light" : "outline-none"} 
              ${colour.bgClass} ${colour.borderClass} 
              border-2 cursor-pointer`}
            onClick={() => props.setSelectedColour(colour.hex)}
          ></div>
        ))}
      </div>
    </div>
  );
}
