"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    onSearch(q);
    setSearchQuery("");
    setSearchDialogOpen(false);
  };

  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-nowrap">
        <Input
          placeholder={placeholder || "Search by artist name, title, etc..."}
          className="w-64 hidden md:block"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleEnterKeyPress}
        />

        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchDialogOpen(true)}
          aria-label="Open search"
        >
          <Search className="size-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="hidden md:flex"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>
      </div>

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Search by artist, title, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleEnterKeyPress}
              autoFocus
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
