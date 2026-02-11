"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { Input, Badge } from "@/components/ui";
import { helpArticles } from "@/content/help";
import { searchHelpArticles, getCategoryTitle, SearchResult } from "@/lib/help-search";

interface HelpSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onResultClick?: () => void;
}

export function HelpSearch({
  className = "",
  placeholder = "Search help articles...",
  autoFocus = false,
  onResultClick,
}: HelpSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResults = searchHelpArticles(query, helpArticles);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
      setIsOpen(true);
      setIsSearching(false);
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.length >= 2) {
        // Go to search results page
        router.push(`/help/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        onResultClick?.();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToArticle(results[selectedIndex]);
        } else {
          // Go to search results page
          router.push(`/help/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
          onResultClick?.();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const navigateToArticle = (result: SearchResult) => {
    router.push(`/help/${result.article.category}/${result.article.slug}`);
    setIsOpen(false);
    setQuery("");
    onResultClick?.();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-foreground-tertiary" />
        )}
        {!isSearching && query.length > 0 && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {results.length > 0 ? (
            <>
              <ul className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <li key={`${result.article.category}-${result.article.slug}`}>
                    <button
                      onClick={() => navigateToArticle(result)}
                      className={`w-full px-4 py-3 text-left hover:bg-background-secondary transition-colors ${
                        index === selectedIndex ? "bg-background-secondary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {result.article.title}
                          </p>
                          <p className="text-sm text-foreground-tertiary line-clamp-2 mt-0.5">
                            {result.excerpt}
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {getCategoryTitle(result.article.category)}
                        </Badge>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t border-border bg-background-secondary">
                <button
                  onClick={() => {
                    router.push(`/help/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    onResultClick?.();
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-foreground-secondary">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-foreground-tertiary mt-1">
                Try different keywords or browse categories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
