"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { HelpArticleRenderer, extractHeadings, HelpArticleCard } from "@/components/help";
import { getArticleBySlug, getCategoryBySlug, getRelatedArticles } from "@/content/help";

export default function HelpArticlePage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const articleSlug = params.slug as string;

  const category = getCategoryBySlug(categorySlug);
  const article = getArticleBySlug(categorySlug, articleSlug);

  if (!category || !article) {
    notFound();
  }

  const headings = extractHeadings(article.content);
  const relatedArticles = getRelatedArticles(article, 3);
  const tocHeadings = headings.filter((h) => h.level <= 2);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <Link
          href="/help"
          className="text-foreground-secondary hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Help Center
        </Link>
        <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
        <Link
          href={`/help/${category.slug}`}
          className="text-foreground-secondary hover:text-foreground"
        >
          {category.title}
        </Link>
        <ChevronRight className="w-4 h-4 text-foreground-tertiary" />
        <span className="text-foreground font-medium">{article.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Table of Contents - Desktop Sidebar */}
        {tocHeadings.length > 1 && (
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                On this page
              </h3>
              <nav className="space-y-1">
                {tocHeadings.map((heading, index) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className={`block text-sm text-foreground-secondary hover:text-foreground transition-colors ${
                      heading.level === 2 ? "pl-0" : "pl-3"
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-6 md:p-8">
              <HelpArticleRenderer content={article.content} />
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((related) => (
                  <HelpArticleCard
                    key={`${related.category}-${related.slug}`}
                    article={related}
                    showCategory
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href={`/help/${category.slug}`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {category.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
