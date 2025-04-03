import type { FormEvent, ChangeEvent } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  searchInputValue: string;
  onSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: FormEvent) => void;
  placeholder?: string;
}

export function SearchInput({
  searchInputValue,
  onSearchInputChange,
  onSearchSubmit,
  placeholder = "Search..."
}: SearchInputProps) {
  return (
    <form
      onSubmit={onSearchSubmit}
      className="relative flex-grow max-w-xs"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={searchInputValue}
        onChange={onSearchInputChange}
        className="py-2 pr-4 pl-8 w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
      />
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
    </form>
  );
}
