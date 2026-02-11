"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { HelpArticle } from "@/content/help";
import { getCategoryTitle } from "@/lib/help-search";

interface HelpArticleCardProps {
  article: HelpArticle;
  showCategory?: boolean;
  compact?: boolean;
}

export function HelpArticleCard({
  article,
  showCategory = true,
  compact = false,
}: HelpArticleCardProps) {
  return (
    <Link href={`/help/${article.category}/${article.slug}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {showCategory && (
                <Badge variant="secondary" className="mb-2 text-xs">
                  {getCategoryTitle(article.category)}
                </Badge>
              )}
              <h3
                className={`font-semibold text-foreground group-hover:text-primary transition-colors ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                {article.title}
              </h3>
              <p
                className={`text-foreground-secondary mt-1 line-clamp-2 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {article.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface HelpCategoryCardProps {
  category: {
    slug: string;
    title: string;
    icon: string;
    description: string;
  };
  articleCount: number;
}

export function HelpCategoryCard({ category, articleCount }: HelpCategoryCardProps) {
  // Dynamic icon import would be complex, so we'll use a simple approach
  return (
    <Link href={`/help/${category.slug}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {category.title[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-xs text-foreground-tertiary">
                {articleCount} {articleCount === 1 ? "article" : "articles"}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground-secondary line-clamp-2">
            {category.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
