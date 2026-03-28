import { X } from "lucide-react";
import IconButton from "../input/iconButton";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="searching..."
        className="w-full border border-gray-300 bg-white rounded-md py-1 px-2"
        value={props.searchQuery}
        onChange={(e) => props.setSearchQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <IconButton icon={X} onClick={() => props.setSearchQuery("")} />
      </div>
    </div>
  );
}
