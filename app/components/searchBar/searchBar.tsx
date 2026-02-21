export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="find..."
        className="w-full border border-gray-300 rounded-md p-2"
        value={props.searchQuery}
        onChange={(e) => props.setSearchQuery(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-md absolute right-0 top-0"
        onClick={() => props.setSearchQuery("")}
      >
        x
      </button>
    </div>
  );
}
