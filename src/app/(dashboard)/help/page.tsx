"use client";

import { HelpCircle, BookOpen, Search as SearchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { HelpSearch, HelpArticleCard, HelpCategoryCard, FAQSection } from "@/components/help";
import {
  helpCategories,
  faqItems,
  getPopularArticles,
  getArticlesByCategory,
} from "@/content/help";

export default function HelpPage() {
  const popularArticles = getPopularArticles();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-heading-1 text-foreground">Help Center</h1>
        <p className="text-foreground-secondary mt-2 max-w-lg mx-auto">
          Find answers to your questions and learn how to make the most of CareBase
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <HelpSearch
          placeholder="Search for articles, guides, and more..."
          className="w-full"
        />
      </div>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Popular Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article) => (
              <HelpArticleCard
                key={`${article.category}-${article.slug}`}
                article={article}
                showCategory
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <SearchIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {helpCategories.map((category) => (
            <HelpCategoryCard
              key={category.slug}
              category={category}
              articleCount={getArticlesByCategory(category.slug).length}
            />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <FAQSection items={faqItems.slice(0, 6)} title="" />
          </CardContent>
        </Card>
      </section>

      {/* Still Need Help */}
      <section className="text-center py-8 bg-background-secondary rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Still need help?
        </h2>
        <p className="text-foreground-secondary mb-4">
          Contact your agency administrator for additional support
        </p>
      </section>
    </div>
  );
}
