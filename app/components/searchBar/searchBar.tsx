import { X } from "lucide-react";

export interface SearchBarProps {
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
      <button
        className="absolute top-1/2 -translate-y-1/2 right-0 text-gray-medium-dark hover:text-gray-medium"
        onClick={() => props.setSearchQuery("")}
      >
        <X />
      </button>
    </div>
  );
}
