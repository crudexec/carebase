"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { HelpArticleCard } from "@/components/help";
import { getCategoryBySlug, getArticlesByCategory } from "@/content/help";

export default function HelpCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const category = getCategoryBySlug(categorySlug);
  const articles = getArticlesByCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/help"
          className="text-foreground-secondary hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Help Center
        </Link>
        <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
        <span className="text-foreground font-medium">{category.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-heading-2 text-foreground">{category.title}</h1>
        <p className="text-foreground-secondary mt-1">{category.description}</p>
        <p className="text-sm text-foreground-tertiary mt-2">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
      </div>

      {/* Articles List */}
      {articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <HelpArticleCard
              key={article.slug}
              article={article}
              showCategory={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-background-secondary rounded-lg">
          <p className="text-foreground-secondary">
            No articles in this category yet.
          </p>
          <Link href="/help" className="text-primary hover:underline mt-2 inline-block">
            Browse other categories
          </Link>
        </div>
      )}
    </div>
  );
}
