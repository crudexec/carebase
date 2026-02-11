"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Badge } from "@/components/ui";
import { HelpSearch } from "@/components/help";
import { helpArticles } from "@/content/help";
import { searchHelpArticles, getCategoryTitle, highlightSearchTerms } from "@/lib/help-search";

export default function HelpSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = query.length >= 2 ? searchHelpArticles(query, helpArticles) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/help"
        className="text-foreground-secondary hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      {/* Search Header */}
      <div>
        <h1 className="text-heading-2 text-foreground mb-4">Search Results</h1>
        <HelpSearch
          placeholder="Search help articles..."
          className="max-w-xl"
        />
      </div>

      {/* Results */}
      {query.length >= 2 ? (
        <div>
          <p className="text-foreground-secondary mb-4">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={`${result.article.category}-${result.article.slug}`}
                  href={`/help/${result.article.category}/${result.article.slug}`}
                  className="block p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground hover:text-primary">
                        {result.article.title}
                      </h3>
                      <p
                        className="text-sm text-foreground-secondary mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerms(result.excerpt, query),
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2 text-xs text-foreground-tertiary">
                        <span>Matched in: {result.matchedIn.join(", ")}</span>
                      </div>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">
                      {getCategoryTitle(result.article.category)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background-secondary rounded-lg">
              <Search className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
              <p className="text-foreground-secondary">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-foreground-tertiary mt-1">
                Try different keywords or browse categories
              </p>
              <Link
                href="/help"
                className="text-primary hover:underline mt-4 inline-block"
              >
                Browse all categories
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-background-secondary rounded-lg">
          <Search className="w-12 h-12 text-foreground-tertiary mx-auto mb-4" />
          <p className="text-foreground-secondary">
            Enter at least 2 characters to search
          </p>
        </div>
      )}
    </div>
  );
}
