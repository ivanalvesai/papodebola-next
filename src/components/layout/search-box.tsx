"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/noticias?search=${encodeURIComponent(q)}`);
      setQuery("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden sm:flex items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="h-9 w-48 rounded-full bg-input-bg pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted border border-border-custom focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors"
        />
      </div>
    </form>
  );
}
